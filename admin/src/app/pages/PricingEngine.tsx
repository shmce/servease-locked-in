import { useCallback, useEffect, useMemo, useState } from "react";
import { Fuel, Gauge, Save, TrendingUp } from "lucide-react";
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
  type AdminPricingQuoteAuditSummary,
} from "../../services/serveaseAdminApi";

function formatPeso(value: number) {
  return `₱${Math.round(value).toLocaleString()}`;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "N/A";
}

export function PricingEngine() {
  const { accessToken } = useAuth();
  const [rules, setRules] = useState<AdminPricingCategoryRuleSummary[]>([]);
  const [fuelIndex, setFuelIndex] = useState<AdminPricingFuelIndexSummary[]>([]);
  const [audits, setAudits] = useState<AdminPricingQuoteAuditSummary[]>([]);
  const [categoryName, setCategoryName] = useState("Default services");
  const [baselineMin, setBaselineMin] = useState("300");
  const [baselineMax, setBaselineMax] = useState("5000");
  const [fuelPrice, setFuelPrice] = useState("68");
  const [isLoading, setIsLoading] = useState(true);

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

  async function handleSaveRule() {
    if (!accessToken) return;
    const min = Number(baselineMin);
    const max = Number(baselineMax);
    if (!categoryName.trim() || !Number.isFinite(min) || !Number.isFinite(max) || max < min) {
      toast.error("Enter a valid category and baseline range.");
      return;
    }

    try {
      const rule = await saveAdminPricingRule(accessToken, {
        categoryName,
        pricingMode: "any",
        baselineMin: min,
        baselineMax: max,
      });
      setRules((current) => [rule, ...current.filter((item) => item.id !== rule.id)]);
      toast.success("Pricing rule saved.");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pricing Engine</h1>
        <p className="text-gray-600 mt-1">
          Manage fair-price rules, gas inputs, and quote outlier review.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Gauge size={18} /> Rules</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{rules.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Fuel size={18} /> Fuel Index</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {latestFuel ? `₱${latestFuel.fuelPricePerLiter}/L` : "N/A"}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><TrendingUp size={18} /> Outliers</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{outlierCount}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Rule Editor</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
          <Input value={baselineMin} onChange={(event) => setBaselineMin(event.target.value)} type="number" />
          <Input value={baselineMax} onChange={(event) => setBaselineMax(event.target.value)} type="number" />
          <Button onClick={() => void handleSaveRule()}><Save size={16} className="mr-2" />Save Rule</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Gas/Fuel Index</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Input value={fuelPrice} onChange={(event) => setFuelPrice(event.target.value)} type="number" />
          <Button onClick={() => void handleSaveFuel()}><Save size={16} className="mr-2" />Update</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Quote Audits</CardTitle></CardHeader>
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
                <TableRow><TableCell colSpan={5}>Loading pricing engine...</TableCell></TableRow>
              ) : audits.length === 0 ? (
                <TableRow><TableCell colSpan={5}>No quote audits yet.</TableCell></TableRow>
              ) : (
                audits.slice(0, 20).map((audit) => (
                  <TableRow key={audit.quoteId}>
                    <TableCell className="font-mono text-xs">{audit.quoteId.slice(0, 8)}</TableCell>
                    <TableCell>{formatPeso(audit.estimatedTotal)}</TableCell>
                    <TableCell>{formatPeso(audit.fairRangeMin)} - {formatPeso(audit.fairRangeMax)}</TableCell>
                    <TableCell><Badge>{audit.fairnessStatus.replace("_", " ")}</Badge></TableCell>
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
