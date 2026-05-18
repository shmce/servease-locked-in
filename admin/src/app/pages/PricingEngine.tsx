import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  Pencil,
  Plus,
  Save,
  Settings2,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  createAdminPricingFuelIndex,
  listAdminPricingFuelIndex,
  listAdminPricingQuoteAudits,
  listAdminPricingRules,
  saveAdminPricingRule,
  type AdminPricingCategoryRuleSummary,
  type AdminPricingFuelIndexSummary,
  type AdminPricingMode,
  type AdminPricingQuoteAuditSummary,
} from "../../services/serveaseAdminApi";

type EditorMode = "advanced" | "wizard" | null;
type WizardStep = 0 | 1 | 2 | 3 | 4;
type PricingUrgency = "standard" | "priority" | "emergency";

interface PricingRuleDraft {
  ruleId: string | null;
  categoryId: string;
  categoryName: string;
  pricingMode: AdminPricingMode;
  baselineMin: string;
  baselineMax: string;
  fairBandPercent: string;
  travelFeeMin: string;
  travelFeeMax: string;
  travelMultiplier: string;
  travelTimeFeePerMinute: string;
  urgencyPriorityMultiplier: string;
  urgencyEmergencyMultiplier: string;
  outlierWarnPercent: string;
  isActive: boolean;
}

interface PreviewInput {
  providerBasePrice: string;
  pricingMode: "flat" | "hourly";
  hoursRequired: string;
  distanceKm: string;
  durationMinutes: string;
  urgency: PricingUrgency;
}

const wizardSteps = [
  "Scope",
  "Labor baseline",
  "Travel and fuel",
  "Urgency and outliers",
  "Review and publish",
] as const;

function formatPeso(value: number) {
  return `₱${Math.round(value).toLocaleString()}`;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "N/A";
}

function defaultDraft(): PricingRuleDraft {
  return {
    ruleId: null,
    categoryId: "",
    categoryName: "Default services",
    pricingMode: "any",
    baselineMin: "300",
    baselineMax: "5000",
    fairBandPercent: "15",
    travelFeeMin: "0",
    travelFeeMax: "500",
    travelMultiplier: "1.2",
    travelTimeFeePerMinute: "2",
    urgencyPriorityMultiplier: "0.1",
    urgencyEmergencyMultiplier: "0.25",
    outlierWarnPercent: "20",
    isActive: true,
  };
}

function draftFromRule(rule: AdminPricingCategoryRuleSummary): PricingRuleDraft {
  return {
    ruleId: rule.id,
    categoryId: rule.categoryId ?? "",
    categoryName: rule.categoryName,
    pricingMode: rule.pricingMode,
    baselineMin: String(rule.baselineMin),
    baselineMax: String(rule.baselineMax),
    fairBandPercent: String(rule.fairBandPercent),
    travelFeeMin: String(rule.travelFeeMin),
    travelFeeMax: String(rule.travelFeeMax),
    travelMultiplier: String(rule.travelMultiplier),
    travelTimeFeePerMinute: String(rule.travelTimeFeePerMinute),
    urgencyPriorityMultiplier: String(rule.urgencyPriorityMultiplier),
    urgencyEmergencyMultiplier: String(rule.urgencyEmergencyMultiplier),
    outlierWarnPercent: String(rule.outlierWarnPercent),
    isActive: rule.isActive,
  };
}

function numberFromDraft(value: string): number {
  return Number(value);
}

function buildRulePayload(draft: PricingRuleDraft) {
  return {
    ruleId: draft.ruleId,
    categoryId: draft.categoryId.trim() || null,
    categoryName: draft.categoryName.trim(),
    pricingMode: draft.pricingMode,
    baselineMin: numberFromDraft(draft.baselineMin),
    baselineMax: numberFromDraft(draft.baselineMax),
    fairBandPercent: numberFromDraft(draft.fairBandPercent),
    travelFeeMin: numberFromDraft(draft.travelFeeMin),
    travelFeeMax: numberFromDraft(draft.travelFeeMax),
    travelMultiplier: numberFromDraft(draft.travelMultiplier),
    travelTimeFeePerMinute: numberFromDraft(draft.travelTimeFeePerMinute),
    urgencyPriorityMultiplier: numberFromDraft(draft.urgencyPriorityMultiplier),
    urgencyEmergencyMultiplier: numberFromDraft(draft.urgencyEmergencyMultiplier),
    outlierWarnPercent: numberFromDraft(draft.outlierWarnPercent),
    isActive: draft.isActive,
  };
}

function validateDraft(draft: PricingRuleDraft): string | null {
  const payload = buildRulePayload(draft);
  const numericFields = [
    payload.baselineMin,
    payload.baselineMax,
    payload.fairBandPercent,
    payload.travelFeeMin,
    payload.travelFeeMax,
    payload.travelMultiplier,
    payload.travelTimeFeePerMinute,
    payload.urgencyPriorityMultiplier,
    payload.urgencyEmergencyMultiplier,
    payload.outlierWarnPercent,
  ];

  if (!payload.categoryName) {
    return "Enter a category name before publishing.";
  }
  if (numericFields.some((value) => !Number.isFinite(value))) {
    return "Enter valid numeric pricing values.";
  }
  if (payload.baselineMin < 0 || payload.baselineMax < payload.baselineMin) {
    return "Baseline maximum must be greater than or equal to the baseline minimum.";
  }
  if (payload.travelFeeMin < 0 || payload.travelFeeMax < payload.travelFeeMin) {
    return "Travel fee maximum must be greater than or equal to the travel fee minimum.";
  }
  if (payload.fairBandPercent < 0 || payload.fairBandPercent > 100) {
    return "Fair band percent must be between 0 and 100.";
  }
  if (
    payload.travelMultiplier < 0 ||
    payload.travelTimeFeePerMinute < 0 ||
    payload.urgencyPriorityMultiplier < 0 ||
    payload.urgencyEmergencyMultiplier < 0 ||
    payload.outlierWarnPercent < 0
  ) {
    return "Multipliers, travel time fees, and outlier thresholds cannot be negative.";
  }
  return null;
}

function defaultPreviewInput(): PreviewInput {
  return {
    providerBasePrice: "1200",
    pricingMode: "flat",
    hoursRequired: "1",
    distanceKm: "8",
    durationMinutes: "25",
    urgency: "standard",
  };
}

function calculatePreview(
  draft: PricingRuleDraft,
  input: PreviewInput,
  fuelPricePerLiter: number,
) {
  const baselineMin = numberFromDraft(draft.baselineMin);
  const baselineMax = numberFromDraft(draft.baselineMax);
  const fairBandPercent = numberFromDraft(draft.fairBandPercent);
  const travelFeeMin = numberFromDraft(draft.travelFeeMin);
  const travelFeeMax = numberFromDraft(draft.travelFeeMax);
  const travelMultiplier = numberFromDraft(draft.travelMultiplier);
  const travelTimeFeePerMinute = numberFromDraft(draft.travelTimeFeePerMinute);
  const priorityMultiplier = numberFromDraft(draft.urgencyPriorityMultiplier);
  const emergencyMultiplier = numberFromDraft(draft.urgencyEmergencyMultiplier);
  const outlierWarnPercent = numberFromDraft(draft.outlierWarnPercent);
  const providerBasePrice = Number(input.providerBasePrice);
  const hoursRequired = Math.max(1, Math.ceil(Number(input.hoursRequired) || 1));
  const distanceKm = Number(input.distanceKm);
  const durationMinutes = Number(input.durationMinutes);
  const rawLabor =
    input.pricingMode === "hourly" ? providerBasePrice * hoursRequired : providerBasePrice;
  const laborSubtotal = clamp(rawLabor, baselineMin, Math.max(baselineMax, baselineMin));
  const fuelCost = Number.isFinite(distanceKm) && distanceKm >= 0
    ? (distanceKm / 10) * fuelPricePerLiter
    : 120;
  const travelTimeFee =
    Number.isFinite(durationMinutes) && durationMinutes >= 0
      ? durationMinutes * travelTimeFeePerMinute
      : 0;
  const travelSubtotal = clamp(
    fuelCost * travelMultiplier + travelTimeFee,
    travelFeeMin,
    travelFeeMax,
  );
  const urgencyMultiplier =
    input.urgency === "emergency"
      ? emergencyMultiplier
      : input.urgency === "priority"
        ? priorityMultiplier
        : 0;
  const urgencyAdjustment = laborSubtotal * urgencyMultiplier;
  const estimatedTotal = Math.round(laborSubtotal + travelSubtotal + urgencyAdjustment);
  const fairBandAmount = estimatedTotal * (fairBandPercent / 100);
  const fairRangeMin = Math.round(Math.max(0, estimatedTotal - fairBandAmount));
  const fairRangeMax = Math.round(estimatedTotal + fairBandAmount);
  const warnRatio = outlierWarnPercent / 100;
  const providerAdjustedEstimate = rawLabor + travelSubtotal + urgencyAdjustment;
  const fairnessStatus =
    providerAdjustedEstimate < fairRangeMin * (1 - warnRatio)
      ? "Below range"
      : providerAdjustedEstimate > fairRangeMax * (1 + warnRatio)
        ? "Above range"
        : "Within range";

  return {
    estimatedTotal,
    fairRangeMin,
    fairRangeMax,
    fairnessStatus,
    laborSubtotal: Math.round(laborSubtotal),
    travelSubtotal: Math.round(travelSubtotal),
    urgencyAdjustment: Math.round(urgencyAdjustment),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function Field({
  help,
  id,
  label,
  onChange,
  type = "number",
  value,
}: {
  help?: string;
  id: string;
  label: string;
  onChange: (value: string) => void;
  type?: "number" | "text";
  value: string;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="block text-sm font-medium text-gray-800">{label}</span>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1"
      />
      {help ? <span className="mt-1 block text-xs text-gray-500">{help}</span> : null}
    </label>
  );
}

export function PricingEngine() {
  const { accessToken } = useAuth();
  const [rules, setRules] = useState<AdminPricingCategoryRuleSummary[]>([]);
  const [fuelIndex, setFuelIndex] = useState<AdminPricingFuelIndexSummary[]>([]);
  const [audits, setAudits] = useState<AdminPricingQuoteAuditSummary[]>([]);
  const [fuelPrice, setFuelPrice] = useState("68");
  const [isLoading, setIsLoading] = useState(true);
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [wizardStep, setWizardStep] = useState<WizardStep>(0);
  const [draft, setDraft] = useState<PricingRuleDraft>(defaultDraft);
  const [previewInput, setPreviewInput] = useState<PreviewInput>(defaultPreviewInput);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const [nextRules, nextFuelIndex, nextAudits] = await Promise.all([
        listAdminPricingRules(accessToken),
        listAdminPricingFuelIndex(accessToken),
        listAdminPricingQuoteAudits(accessToken),
      ]);
      setRules(nextRules);
      setFuelIndex(nextFuelIndex);
      setAudits(nextAudits);
      if (nextFuelIndex[0]) {
        setFuelPrice(String(nextFuelIndex[0].fuelPricePerLiter));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load pricing engine.");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    void load();
  }, [load]);

  const outlierCount = useMemo(
    () => audits.filter((audit) => audit.fairnessStatus !== "within_range").length,
    [audits],
  );
  const latestFuel = fuelIndex[0] ?? null;
  const latestFuelPrice = latestFuel?.fuelPricePerLiter ?? 68;
  const preview = useMemo(
    () => calculatePreview(draft, previewInput, latestFuelPrice),
    [draft, latestFuelPrice, previewInput],
  );

  function updateDraft(key: keyof PricingRuleDraft, value: string | boolean) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updatePreview(key: keyof PreviewInput, value: string) {
    setPreviewInput((current) => ({ ...current, [key]: value }));
  }

  function openCreateWizard() {
    setDraft(defaultDraft());
    setPreviewInput(defaultPreviewInput());
    setWizardStep(0);
    setEditorMode("wizard");
  }

  function openWizard(rule: AdminPricingCategoryRuleSummary) {
    setDraft(draftFromRule(rule));
    setPreviewInput(defaultPreviewInput());
    setWizardStep(0);
    setEditorMode("wizard");
  }

  function openAdvanced(rule: AdminPricingCategoryRuleSummary) {
    setDraft(draftFromRule(rule));
    setEditorMode("advanced");
  }

  async function publishDraft() {
    if (!accessToken) return;
    const validationError = validateDraft(draft);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const rule = await saveAdminPricingRule(accessToken, buildRulePayload(draft));
      setRules((current) => [rule, ...current.filter((item) => item.id !== rule.id)]);
      setEditorMode(null);
      toast.success("Pricing rule published.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save rule.");
    }
  }

  async function handleSaveFuel() {
    if (!accessToken) return;
    const price = Number(fuelPrice);
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Enter a valid gas/fuel price.");
      return;
    }

    try {
      const row = await createAdminPricingFuelIndex(accessToken, {
        region: "default",
        fuelPricePerLiter: price,
        source: "admin",
      });
      setFuelIndex((current) => [row, ...current]);
      toast.success("Fuel index updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update fuel index.");
    }
  }

  function nextStep(step: WizardStep) {
    const validationError = validateDraft(draft);
    if (step > 0 && validationError) {
      toast.error(validationError);
      return;
    }
    setWizardStep(step);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing Engine</h1>
          <p className="mt-1 text-gray-600">
            Guided pricing rules, fuel inputs, and quote outlier review.
          </p>
        </div>
        <Button onClick={openCreateWizard}>
          <Plus size={16} />
          Create Rule
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge size={18} /> Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{rules.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Fuel size={18} /> Fuel Index
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {latestFuel ? `₱${latestFuel.fuelPricePerLiter}/L` : "N/A"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp size={18} /> Outliers
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{outlierCount}</CardContent>
        </Card>
      </div>

      {editorMode === "wizard" ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle>Guided Rule Setup</CardTitle>
                <p className="mt-1 text-sm text-gray-500">
                  Follow the steps in order, then publish the rule after reviewing the quote simulation.
                </p>
              </div>
              <Button variant="outline" onClick={() => setEditorMode("advanced")}>
                <Settings2 size={16} />
                Advanced
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
              {wizardSteps.map((step, index) => (
                <button
                  key={step}
                  type="button"
                  aria-label={`Go to step ${index + 1}`}
                  onClick={() => nextStep(index as WizardStep)}
                  className={`rounded-md border px-3 py-2 text-left text-sm ${
                    wizardStep === index
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : "border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  <span className="block text-xs font-medium">Step {index + 1}</span>
                  {step}
                </button>
              ))}
            </div>

            {wizardStep === 0 ? (
              <WizardScope draft={draft} updateDraft={updateDraft} />
            ) : null}
            {wizardStep === 1 ? (
              <WizardLabor draft={draft} updateDraft={updateDraft} />
            ) : null}
            {wizardStep === 2 ? (
              <WizardTravel
                draft={draft}
                fuelPrice={fuelPrice}
                latestFuel={latestFuel}
                onFuelPriceChange={setFuelPrice}
                onSaveFuel={() => void handleSaveFuel()}
                updateDraft={updateDraft}
              />
            ) : null}
            {wizardStep === 3 ? (
              <WizardUrgency draft={draft} updateDraft={updateDraft} />
            ) : null}
            {wizardStep === 4 ? (
              <WizardReview
                draft={draft}
                preview={preview}
                previewInput={previewInput}
                updatePreview={updatePreview}
              />
            ) : null}

            <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-between">
              <Button variant="outline" onClick={() => setEditorMode(null)}>
                Cancel
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row">
                {wizardStep > 0 ? (
                  <Button
                    variant="outline"
                    onClick={() => setWizardStep((wizardStep - 1) as WizardStep)}
                  >
                    <ChevronLeft size={16} />
                    Back
                  </Button>
                ) : null}
                {wizardStep < 4 ? (
                  <Button onClick={() => nextStep((wizardStep + 1) as WizardStep)}>
                    Next: {wizardSteps[wizardStep + 1]}
                    <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button onClick={() => void publishDraft()}>
                    <CheckCircle2 size={16} />
                    Publish Rule
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {editorMode === "advanced" ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle>Advanced Rule Editor</CardTitle>
                <p className="mt-1 text-sm text-gray-500">
                  Direct access to every pricing rule field. Use guided setup when you want step-by-step context.
                </p>
              </div>
              <Button variant="outline" onClick={() => setEditorMode("wizard")}>
                <Pencil size={16} />
                Guided setup
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <RuleFields draft={draft} updateDraft={updateDraft} />
            <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setEditorMode(null)}>
                Cancel
              </Button>
              <Button onClick={() => void publishDraft()}>
                <Save size={16} />
                Save Advanced Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Pricing Rules</CardTitle>
              <p className="mt-1 text-sm text-gray-500">
                Use guided setup for rule changes. Advanced mode is available for direct edits.
              </p>
            </div>
            <Badge variant="outline">{rules.length} rules</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Labor Range</TableHead>
                <TableHead>Travel Cap</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>Loading pricing rules...</TableCell>
                </TableRow>
              ) : rules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>No pricing rules yet.</TableCell>
                </TableRow>
              ) : (
                rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div className="font-medium">{rule.categoryName}</div>
                      <div className="text-xs text-gray-500">{rule.categoryId ?? "Default fallback"}</div>
                    </TableCell>
                    <TableCell>{rule.pricingMode}</TableCell>
                    <TableCell>
                      {formatPeso(rule.baselineMin)} - {formatPeso(rule.baselineMax)}
                    </TableCell>
                    <TableCell>
                      {formatPeso(rule.travelFeeMin)} - {formatPeso(rule.travelFeeMax)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? "default" : "outline"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => openWizard(rule)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openAdvanced(rule)}>
                          Advanced
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quote Audits</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Fair Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>Loading pricing engine...</TableCell>
                </TableRow>
              ) : audits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>No quote audits yet.</TableCell>
                </TableRow>
              ) : (
                audits.slice(0, 20).map((audit) => (
                  <TableRow key={audit.quoteId}>
                    <TableCell className="font-mono text-xs">{audit.quoteId.slice(0, 8)}</TableCell>
                    <TableCell>{formatPeso(audit.estimatedTotal)}</TableCell>
                    <TableCell>
                      {formatPeso(audit.fairRangeMin)} - {formatPeso(audit.fairRangeMax)}
                    </TableCell>
                    <TableCell>
                      <Badge>{audit.fairnessStatus.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(audit.createdAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function WizardScope({
  draft,
  updateDraft,
}: {
  draft: PricingRuleDraft;
  updateDraft: (key: keyof PricingRuleDraft, value: string | boolean) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Step 1: Scope</h2>
        <p className="mt-1 text-sm text-gray-600">
          Choose which bookings this rule affects. Category-specific rules win before default rules.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          id="category-name"
          label="Category name"
          value={draft.categoryName}
          type="text"
          onChange={(value) => updateDraft("categoryName", value)}
          help="Use Default services when this rule should apply as the platform fallback."
        />
        <Field
          id="category-id"
          label="Category ID"
          value={draft.categoryId}
          type="text"
          onChange={(value) => updateDraft("categoryId", value)}
          help="Leave blank for the default fallback rule."
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block" htmlFor="pricing-mode">
          <span className="block text-sm font-medium text-gray-800">Pricing mode</span>
          <select
            id="pricing-mode"
            value={draft.pricingMode}
            onChange={(event) => updateDraft("pricingMode", event.target.value)}
            className="mt-1 h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
          >
            <option value="any">Any</option>
            <option value="flat">Flat</option>
            <option value="hourly">Hourly</option>
          </select>
          <span className="mt-1 block text-xs text-gray-500">
            Any applies when no flat or hourly specific rule is available.
          </span>
        </label>
        <label className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(event) => updateDraft("isActive", event.target.checked)}
          />
          <span>
            <span className="block text-sm font-medium text-gray-800">Active rule</span>
            <span className="block text-xs text-gray-500">
              Inactive rules stay saved but are ignored by quote selection.
            </span>
          </span>
        </label>
      </div>
    </section>
  );
}

function WizardLabor({
  draft,
  updateDraft,
}: {
  draft: PricingRuleDraft;
  updateDraft: (key: keyof PricingRuleDraft, value: string | boolean) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Step 2: Labor Baseline</h2>
        <p className="mt-1 text-sm text-gray-600">
          Hourly prices are multiplied by estimated hours. Labor is clamped into this range before
          travel and urgency are added.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          id="baseline-minimum"
          label="Baseline minimum"
          value={draft.baselineMin}
          onChange={(value) => updateDraft("baselineMin", value)}
          help="Lowest normal labor amount before travel and urgency."
        />
        <Field
          id="baseline-maximum"
          label="Baseline maximum"
          value={draft.baselineMax}
          onChange={(value) => updateDraft("baselineMax", value)}
          help="Upper normal labor cap used before fair band calculation."
        />
      </div>
    </section>
  );
}

function WizardTravel({
  draft,
  fuelPrice,
  latestFuel,
  onFuelPriceChange,
  onSaveFuel,
  updateDraft,
}: {
  draft: PricingRuleDraft;
  fuelPrice: string;
  latestFuel: AdminPricingFuelIndexSummary | null;
  onFuelPriceChange: (value: string) => void;
  onSaveFuel: () => void;
  updateDraft: (key: keyof PricingRuleDraft, value: string | boolean) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Step 3: Travel And Fuel</h2>
        <p className="mt-1 text-sm text-gray-600">
          Distance-based fuel cost uses fuel index and vehicle efficiency. Missing distance falls
          back to the default travel fee.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Field
          id="travel-fee-minimum"
          label="Travel fee minimum"
          value={draft.travelFeeMin}
          onChange={(value) => updateDraft("travelFeeMin", value)}
        />
        <Field
          id="travel-fee-maximum"
          label="Travel fee maximum"
          value={draft.travelFeeMax}
          onChange={(value) => updateDraft("travelFeeMax", value)}
        />
        <Field
          id="travel-multiplier"
          label="Travel multiplier"
          value={draft.travelMultiplier}
          onChange={(value) => updateDraft("travelMultiplier", value)}
        />
        <Field
          id="travel-time-fee-per-minute"
          label="Travel time fee per minute"
          value={draft.travelTimeFeePerMinute}
          onChange={(value) => updateDraft("travelTimeFeePerMinute", value)}
        />
      </div>
      <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <Field
            id="default-fuel-index"
            label="Default fuel index"
            value={fuelPrice}
            onChange={onFuelPriceChange}
            help={
              latestFuel
                ? `Current snapshot from ${formatDate(latestFuel.effectiveAt)}.`
                : "No fuel snapshot loaded yet."
            }
          />
          <Button onClick={onSaveFuel}>
            <Save size={16} />
            Update Fuel Index
          </Button>
        </div>
      </div>
    </section>
  );
}

function WizardUrgency({
  draft,
  updateDraft,
}: {
  draft: PricingRuleDraft;
  updateDraft: (key: keyof PricingRuleDraft, value: string | boolean) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Step 4: Urgency And Outliers</h2>
        <p className="mt-1 text-sm text-gray-600">
          Urgency multipliers apply to labor subtotal. The fair band creates the fair min and max
          around the final estimate.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Field
          id="urgency-priority-multiplier"
          label="Priority urgency multiplier"
          value={draft.urgencyPriorityMultiplier}
          onChange={(value) => updateDraft("urgencyPriorityMultiplier", value)}
        />
        <Field
          id="urgency-emergency-multiplier"
          label="Emergency urgency multiplier"
          value={draft.urgencyEmergencyMultiplier}
          onChange={(value) => updateDraft("urgencyEmergencyMultiplier", value)}
        />
        <Field
          id="fair-band-percent"
          label="Fair band percent"
          value={draft.fairBandPercent}
          onChange={(value) => updateDraft("fairBandPercent", value)}
          help="Builds the fair range around the estimate."
        />
        <Field
          id="outlier-warn-percent"
          label="Outlier warning percent"
          value={draft.outlierWarnPercent}
          onChange={(value) => updateDraft("outlierWarnPercent", value)}
          help="Decides when quotes are marked below or above range."
        />
      </div>
    </section>
  );
}

function WizardReview({
  draft,
  preview,
  previewInput,
  updatePreview,
}: {
  draft: PricingRuleDraft;
  preview: ReturnType<typeof calculatePreview>;
  previewInput: PreviewInput;
  updatePreview: (key: keyof PreviewInput, value: string) => void;
}) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Step 5: Review And Publish</h2>
        <p className="mt-1 text-sm text-gray-600">
          Review the rule and inspect a sample quote simulation before saving.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900">Rule summary</h3>
          <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <SummaryItem label="Category" value={draft.categoryName} />
            <SummaryItem label="Mode" value={draft.pricingMode} />
            <SummaryItem label="Labor" value={`${formatPeso(Number(draft.baselineMin))} - ${formatPeso(Number(draft.baselineMax))}`} />
            <SummaryItem label="Travel" value={`${formatPeso(Number(draft.travelFeeMin))} - ${formatPeso(Number(draft.travelFeeMax))}`} />
            <SummaryItem label="Fair band" value={`${draft.fairBandPercent}%`} />
            <SummaryItem label="Outlier threshold" value={`${draft.outlierWarnPercent}%`} />
          </dl>
        </div>
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="font-semibold text-emerald-950">Sample quote simulation</h3>
          <p className="mt-1 text-sm text-emerald-900">
            This preview is educational only. Payment Service remains authoritative after publish.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              id="preview-base-price"
              label="Provider base price"
              value={previewInput.providerBasePrice}
              onChange={(value) => updatePreview("providerBasePrice", value)}
            />
            <label className="block" htmlFor="preview-pricing-mode">
              <span className="block text-sm font-medium text-gray-800">Preview pricing mode</span>
              <select
                id="preview-pricing-mode"
                value={previewInput.pricingMode}
                onChange={(event) => updatePreview("pricingMode", event.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
              >
                <option value="flat">Flat</option>
                <option value="hourly">Hourly</option>
              </select>
            </label>
            <Field
              id="preview-hours"
              label="Hours required"
              value={previewInput.hoursRequired}
              onChange={(value) => updatePreview("hoursRequired", value)}
            />
            <Field
              id="preview-distance"
              label="Distance kilometers"
              value={previewInput.distanceKm}
              onChange={(value) => updatePreview("distanceKm", value)}
            />
            <Field
              id="preview-duration"
              label="Duration minutes"
              value={previewInput.durationMinutes}
              onChange={(value) => updatePreview("durationMinutes", value)}
            />
            <label className="block" htmlFor="preview-urgency">
              <span className="block text-sm font-medium text-gray-800">Urgency</span>
              <select
                id="preview-urgency"
                value={previewInput.urgency}
                onChange={(event) => updatePreview("urgency", event.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
              >
                <option value="standard">Standard</option>
                <option value="priority">Priority</option>
                <option value="emergency">Emergency</option>
              </select>
            </label>
          </div>
          <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <SummaryItem label="Labor subtotal" value={formatPeso(preview.laborSubtotal)} />
            <SummaryItem label="Travel subtotal" value={formatPeso(preview.travelSubtotal)} />
            <SummaryItem label="Urgency adjustment" value={formatPeso(preview.urgencyAdjustment)} />
            <SummaryItem label="Estimated total" value={formatPeso(preview.estimatedTotal)} />
            <SummaryItem
              label="Fair range"
              value={`${formatPeso(preview.fairRangeMin)} - ${formatPeso(preview.fairRangeMax)}`}
            />
            <SummaryItem label="Fairness" value={preview.fairnessStatus} />
          </dl>
        </div>
      </div>
    </section>
  );
}

function RuleFields({
  draft,
  updateDraft,
}: {
  draft: PricingRuleDraft;
  updateDraft: (key: keyof PricingRuleDraft, value: string | boolean) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Field id="advanced-category-name" label="Category name" value={draft.categoryName} type="text" onChange={(value) => updateDraft("categoryName", value)} />
      <Field id="advanced-category-id" label="Category ID" value={draft.categoryId} type="text" onChange={(value) => updateDraft("categoryId", value)} />
      <label className="block" htmlFor="advanced-pricing-mode">
        <span className="block text-sm font-medium text-gray-800">Pricing mode</span>
        <select
          id="advanced-pricing-mode"
          value={draft.pricingMode}
          onChange={(event) => updateDraft("pricingMode", event.target.value)}
          className="mt-1 h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
        >
          <option value="any">Any</option>
          <option value="flat">Flat</option>
          <option value="hourly">Hourly</option>
        </select>
      </label>
      <Field id="advanced-baseline-minimum" label="Baseline minimum" value={draft.baselineMin} onChange={(value) => updateDraft("baselineMin", value)} />
      <Field id="advanced-baseline-maximum" label="Baseline maximum" value={draft.baselineMax} onChange={(value) => updateDraft("baselineMax", value)} />
      <Field id="advanced-fair-band-percent" label="Fair band percent" value={draft.fairBandPercent} onChange={(value) => updateDraft("fairBandPercent", value)} />
      <Field id="advanced-travel-fee-minimum" label="Travel fee minimum" value={draft.travelFeeMin} onChange={(value) => updateDraft("travelFeeMin", value)} />
      <Field id="advanced-travel-fee-maximum" label="Travel fee maximum" value={draft.travelFeeMax} onChange={(value) => updateDraft("travelFeeMax", value)} />
      <Field id="advanced-travel-multiplier" label="Travel multiplier" value={draft.travelMultiplier} onChange={(value) => updateDraft("travelMultiplier", value)} />
      <Field id="advanced-travel-time-fee-per-minute" label="Travel time fee per minute" value={draft.travelTimeFeePerMinute} onChange={(value) => updateDraft("travelTimeFeePerMinute", value)} />
      <Field id="advanced-urgency-priority-multiplier" label="Priority urgency multiplier" value={draft.urgencyPriorityMultiplier} onChange={(value) => updateDraft("urgencyPriorityMultiplier", value)} />
      <Field id="advanced-urgency-emergency-multiplier" label="Emergency urgency multiplier" value={draft.urgencyEmergencyMultiplier} onChange={(value) => updateDraft("urgencyEmergencyMultiplier", value)} />
      <Field id="advanced-outlier-warn-percent" label="Outlier warning percent" value={draft.outlierWarnPercent} onChange={(value) => updateDraft("outlierWarnPercent", value)} />
      <label className="flex items-center gap-3 rounded-md border border-gray-200 px-3 py-2">
        <input
          type="checkbox"
          checked={draft.isActive}
          onChange={(event) => updateDraft("isActive", event.target.checked)}
        />
        <span className="text-sm font-medium text-gray-800">Active rule</span>
      </label>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}
