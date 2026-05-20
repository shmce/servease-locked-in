import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import {
  getAdminProviderApplication,
  getAdminProviderApplicationDocument,
  getAdminManagedProvider,
  updateAdminManagedProviderStatus,
  listAdminProviderApplications,
  listAdminProviderPortfolio,
  deleteAdminProviderPortfolioMedia,
  getAdminProviderAvailability,
  listAdminAuditLogs,
  AdminProviderApplicationSummary,
  AdminProviderSummary,
  AdminProviderPortfolioMediaSummary,
  AdminAvailabilitySchedule,
  AdminAvailabilityDayOfWeek,
  AdminAuditLogSummary,
} from "../../services/serveaseAdminApi";
import {
  countVerifiedProviderDocuments,
  findProviderApplicationForDetails,
  ProviderDocumentItem,
  toProviderDocumentItems,
} from "../utils/providerApplicationDocuments";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import {
  ArrowLeft,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Shield,
  User,
  ZoomIn,
  ZoomOut,
  Download,
  MapPin,
  Phone,
  Mail,
  Globe,
  Activity,
  ClipboardList,
  Building2,
  Award,
  AlertTriangle,
  TrendingUp,
  RotateCw,
  ImageOff,
  ScanLine,
} from "lucide-react";

/* ─── SHARED CONSTANTS ───────────────────────────────────────────── */
const TABS = ["Overview", "Documents", "Portfolio", "Availability", "Activity Logs"];

const DAY_ORDER: AdminAvailabilityDayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS: Record<AdminAvailabilityDayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

/* ─── HELPERS ────────────────────────────────────────────────────── */
function getLevelBadge(level: string) {
  switch (level) {
    case "Premium": return <Badge className="bg-purple-100 text-purple-700 border-purple-200"><Award className="w-3 h-3 mr-1" />Premium</Badge>;
    case "Fully Verified": return <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"><CheckCircle className="w-3 h-3 mr-1" />Fully Verified</Badge>;
    case "Basic": return <Badge className="bg-blue-50 text-blue-700 border-blue-200"><Shield className="w-3 h-3 mr-1" />Basic</Badge>;
    default: return <Badge variant="outline">{level}</Badge>;
  }
}

function getBgCheckBadge(status: string) {
  switch (status) {
    case "Passed": return <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"><CheckCircle className="w-3 h-3 mr-1" />Passed</Badge>;
    case "Failed": return <Badge className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
    case "Concern": return <Badge className="bg-amber-50 text-amber-700 border-amber-200"><AlertCircle className="w-3 h-3 mr-1" />Concern</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

function getDocumentStatusBadge(status: ProviderDocumentItem["status"]) {
  switch (status) {
    case "verified":
      return <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0] text-xs"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
    case "pending":
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    case "rejected":
      return <Badge className="bg-red-50 text-red-700 border-red-200 text-xs"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
  }
}

function formatNullableDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
}

function hasMeaningfulValue(value: string | number | null | undefined): boolean {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 && normalized !== "—";
}

type ProviderBookingStats = AdminProviderSummary & {
  totalBookings?: number | null;
  completionRate?: number | null;
};

function formatIntegerStat(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return "—";
  }
  return Number(value).toLocaleString("en-US");
}

function formatCompletionRate(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return "—";
  }
  return `${Math.round(Number(value))}%`;
}

function getDocumentFilenameLabel(doc: ProviderDocumentItem): string | null {
  const fileName = doc.file.trim();
  return fileName.length > 0 && !/\.document$/i.test(fileName) ? fileName : null;
}

/* ─── MAIN COMPONENT ─────────────────────────────────────────────── */
export function ServiceProviderDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const [apiProvider, setApiProvider] = useState<AdminProviderSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !accessToken) return;
    getAdminManagedProvider(accessToken, id)
      .then(setApiProvider)
      .catch(() => setLoadError('Provider not found.'));
  }, [id, accessToken]);

  const providerStats = apiProvider as ProviderBookingStats | null;
  const provider = {
    id: apiProvider?.id ?? id ?? "",
    businessName: apiProvider?.businessName ?? "Provider not loaded",
    ownerName: apiProvider?.userFullName ?? "—",
    category: apiProvider?.serviceDescription ?? "Service Marketplace",
    location: apiProvider?.serviceArea ?? "—",
    phone: apiProvider?.userContactNumber ?? "—",
    email: apiProvider?.userEmail ?? "—",
    website: "—",
    rating: apiProvider ? apiProvider.averageRating : 0,
    totalBookings: formatIntegerStat(providerStats?.totalBookings),
    completionRate: formatCompletionRate(providerStats?.completionRate),
    verificationLevel:
      apiProvider?.verificationStatus === "approved"
        ? "Fully Verified"
        : "Basic",
    approvalDate: formatNullableDate(apiProvider?.createdAt),
    approvedBy: apiProvider?.approvedByName ?? "—",
    joinDate: formatNullableDate(apiProvider?.createdAt),
    nbiNumber: "—",
    prcNumber: "—",
    tinNumber: "—",
    bgCheckStatus: "—",
    totalScore: "—",
    checklist: [] as { label: string; checked: boolean }[],
    services: apiProvider?.serviceDescription ? [apiProvider.serviceDescription] : [],
    govIdType: "—",
    govIdNumber: "—",
    ocrConfidence: null as number | null,
  };

  const [activeTab, setActiveTab] = useState("Documents");
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ProviderDocumentItem | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [rotation, setRotation] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [providerApplication, setProviderApplication] =
    useState<AdminProviderApplicationSummary | null>(null);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<AdminProviderPortfolioMediaSummary[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !accessToken || activeTab !== "Documents") return;

    let cancelled = false;
    const providerId = id;
    const token = accessToken;

    async function loadProviderApplicationDocuments() {
      setDocumentsLoading(true);
      setDocumentsError(null);

      try {
        const directApplication = await getAdminProviderApplication(token, providerId).catch(
          () => null,
        );
        const resolvedApplication =
          directApplication ??
          findProviderApplicationForDetails(
            await listAdminProviderApplications(token, { limit: 100 }),
            {
              providerId,
              businessName: provider.businessName,
            },
          );

        if (!cancelled) setProviderApplication(resolvedApplication);
      } catch (error) {
        if (!cancelled) {
          setProviderApplication(null);
          setDocumentsError(
            error instanceof Error
              ? error.message
              : "Unable to load provider application documents.",
          );
        }
      } finally {
        if (!cancelled) setDocumentsLoading(false);
      }
    }

    void loadProviderApplicationDocuments();

    return () => {
      cancelled = true;
    };
  }, [id, accessToken, activeTab, provider.businessName]);

  useEffect(() => {
    if (!apiProvider?.id || !accessToken || activeTab !== "Portfolio") return;
    let cancelled = false;
    setPortfolioLoading(true);
    setPortfolioError(null);
    listAdminProviderPortfolio(accessToken, apiProvider.id)
      .then((media) => {
        if (!cancelled) setPortfolio(media);
      })
      .catch((error) => {
        if (!cancelled)
          setPortfolioError(
            error instanceof Error ? error.message : "Unable to load portfolio.",
          );
      })
      .finally(() => {
        if (!cancelled) setPortfolioLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiProvider?.id, accessToken, activeTab]);

  const [availability, setAvailability] = useState<AdminAvailabilitySchedule | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [providerAuditTrail, setProviderAuditTrail] = useState<
    Array<{
      id: string;
      timestamp: string;
      actor: string;
      action: string;
      type: "system" | "admin" | "provider";
    }>
  >([]);
  const [isLoadingAuditTrail, setIsLoadingAuditTrail] = useState(false);

  useEffect(() => {
    if (!apiProvider?.id || !accessToken || activeTab !== "Availability") return;
    let cancelled = false;
    setAvailabilityLoading(true);
    setAvailabilityError(null);
    getAdminProviderAvailability(accessToken, apiProvider.id)
      .then((schedule) => {
        if (!cancelled) setAvailability(schedule);
      })
      .catch((error) => {
        if (!cancelled)
          setAvailabilityError(
            error instanceof Error ? error.message : "Unable to load availability.",
          );
      })
      .finally(() => {
        if (!cancelled) setAvailabilityLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [apiProvider?.id, accessToken, activeTab]);

  useEffect(() => {
    if (!apiProvider?.id || !accessToken || activeTab !== "Activity Logs") return;
    let cancelled = false;
    const providerDisplayName = apiProvider.businessName?.trim();

    const toAuditEntry = (log: AdminAuditLogSummary) => {
      const action = log.details ?? log.action;
      const metadataProviderId =
        typeof log.metadata?.providerId === "string"
          ? log.metadata.providerId
          : null;

      return {
        id: log.id,
        timestamp: formatNullableDate(log.createdAt),
        actor: log.adminName ?? log.adminEmail ?? "Admin",
        action:
          metadataProviderId === apiProvider.id && providerDisplayName
            ? action.replace(/\bPA-[A-Z0-9-]+\b/g, providerDisplayName)
            : action,
        type: "admin" as const,
      };
    };

    setIsLoadingAuditTrail(true);
    listAdminAuditLogs(accessToken, {
      entityType: "ProviderApplication",
      limit: 100,
    })
      .then((logs) => {
        if (!cancelled) {
          setProviderAuditTrail(
            logs
              .filter((log) => {
                const metadataProviderId =
                  typeof log.metadata?.providerId === "string"
                    ? log.metadata.providerId
                    : null;
                return log.entityId === apiProvider.id || metadataProviderId === apiProvider.id;
              })
              .map(toAuditEntry),
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProviderAuditTrail([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingAuditTrail(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiProvider?.id, apiProvider?.businessName, accessToken, activeTab]);

  const handleRemovePortfolioMedia = async (mediaId: string) => {
    if (!accessToken || !apiProvider?.id) return;
    setDeletingMediaId(mediaId);
    try {
      await deleteAdminProviderPortfolioMedia(accessToken, apiProvider.id, mediaId);
      setPortfolio((current) => current.filter((item) => item.id !== mediaId));
      toast.success("Portfolio media removed.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to remove media.",
      );
    } finally {
      setDeletingMediaId(null);
    }
  };

  const displayedDocuments = providerApplication
    ? toProviderDocumentItems(providerApplication.documents)
    : [];
  const verifiedDocuments = countVerifiedProviderDocuments(displayedDocuments);

  const openDocModal = async (doc: ProviderDocumentItem) => {
    if (accessToken && providerApplication?.id && doc.documentId) {
      try {
        const liveDocument = await getAdminProviderApplicationDocument(
          accessToken,
          providerApplication.id,
          doc.documentId,
        );
        const [freshDocument] = toProviderDocumentItems([liveDocument]);

        setSelectedDoc({
          ...freshDocument,
          color: doc.color,
          iconColor: doc.iconColor,
        });
      } catch (error) {
        setDocumentsError(
          error instanceof Error ? error.message : "Provider document failed to load.",
        );
        setSelectedDoc(doc);
      }
    } else {
      setSelectedDoc(doc);
    }
    setRotation(0);
    setZoomLevel(100);
    setShowDocModal(true);
  };

  const handleDownloadSelectedDoc = () => {
    const url = selectedDoc?.downloadUrl ?? selectedDoc?.previewUrl;
    if (!url) return;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loadError) {
    return <div className="p-8 text-red-600">{loadError}</div>;
  }

  return (
    <div className="space-y-5">

      {/* ─── BREADCRUMB ─── */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button onClick={() => navigate("/dashboard")} className="text-gray-500 hover:text-gray-700 text-sm">Dashboard</button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button onClick={() => navigate("/service-providers")} className="text-gray-500 hover:text-gray-700 text-sm">Service Providers</button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-gray-900 text-sm">{provider.id} — {provider.businessName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ─── PAGE HEADER ROW ─── */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate("/service-providers")} className="gap-2 shrink-0">
          <ArrowLeft className="w-4 h-4" />Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Provider Details</h1>
          <p className="text-gray-500 text-sm mt-0.5">Approved provider verification audit view</p>
        </div>
      </div>

      {/* ─── TOP SUMMARY CARD ─── */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-5 justify-between">
            {/* Left: Avatar + Profile */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7] flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-[#16A34A]" />
              </div>
              <div className="space-y-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{provider.businessName}</h2>
                  <p className="text-gray-500 text-sm">{provider.ownerName}</p>
                </div>
                <p className="text-sm text-gray-600">{provider.category}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
                    <CheckCircle className="w-3 h-3 mr-1" />Approved
                  </Badge>
                  {getLevelBadge(provider.verificationLevel)}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-900">{provider.rating}</span>
                  <span className="text-gray-400">rating</span>
                </div>
              </div>
            </div>

            {/* Right: Stats + Revoke Action */}
            <div className="flex flex-col gap-3 sm:items-end">
              <Button
                variant="outline"
                className="gap-2 text-red-600 hover:bg-red-50 hover:border-red-300 border-red-200"
                onClick={() => setShowRevokeModal(true)}
              >
                <AlertTriangle className="w-4 h-4" />Revoke Verification
              </Button>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-bold text-gray-900">{provider.totalBookings}</p>
                  <p className="text-xs text-gray-400">Bookings</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{provider.completionRate}</p>
                  <p className="text-xs text-gray-400">Completion</p>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-xs leading-5">{provider.approvalDate}</p>
                  <p className="text-xs text-gray-400">Approved</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 sm:text-right">
                by <span className="text-gray-600 font-medium">{provider.approvedBy}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── NAVIGATION TABS ─── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab ? "bg-white text-[#16A34A] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#16A34A]" />Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {[
                { icon: MapPin, label: "Location", value: provider.location },
                { icon: Phone, label: "Phone", value: provider.phone },
                { icon: Mail, label: "Email", value: provider.email },
                { icon: Globe, label: "Website", value: provider.website },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm text-gray-900 font-medium">{item.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#16A34A]" />Services Offered
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2">
                {provider.services.length === 0 ? (
                  <li className="text-sm text-gray-500">No services returned by the backend.</li>
                ) : (
                  provider.services.map((service, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />{service}
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#16A34A]" />Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Rating", value: `${provider.rating} ★`, color: "text-yellow-600" },
                  { label: "Total Bookings", value: provider.totalBookings.toString(), color: "text-blue-600" },
                  { label: "Completion Rate", value: provider.completionRate, color: "text-[#16A34A]" },
                  { label: "Member Since", value: provider.joinDate, color: "text-gray-700" },
                ].map(stat => (
                  <div key={stat.label} className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── DOCUMENTS TAB ─── */}
      {activeTab === "Documents" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ── LEFT COLUMN (col-span-7) ── */}
          <div className="lg:col-span-7 space-y-5">

            {/* Uploaded Documents Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#16A34A]" />
                  Uploaded Documents
                  <span className="ml-auto text-xs text-gray-400 font-normal">
                    {verifiedDocuments}/{displayedDocuments.length} Verified
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {documentsError ? (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                    {documentsError}
                  </p>
                ) : null}
                {documentsLoading ? (
                  <p className="text-sm text-gray-500 py-8 text-center">Loading provider documents…</p>
                ) : displayedDocuments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="w-10 h-10 text-gray-200 mb-3" />
                    <p className="text-gray-400 text-sm font-medium">No application documents found</p>
                    <p className="text-gray-300 text-xs mt-1">
                      Uploaded application documents will appear here once available.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {displayedDocuments.map((doc, index) => {
                      const fileNameLabel = getDocumentFilenameLabel(doc);
                      const documentLabel = fileNameLabel
                        ? doc.name
                        : `${doc.name} #${index + 1}`;

                      return (
                        <div key={doc.id} className="border border-gray-100 rounded-xl p-3 hover:border-gray-200 hover:shadow-sm transition-all group">
                          <div className={`${doc.color} rounded-lg h-20 flex items-center justify-center mb-3 relative overflow-hidden`}>
                            <FileText className={`w-8 h-8 ${doc.iconColor} opacity-60`} />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                              <button onClick={() => void openDocModal(doc)} className="bg-white rounded-full p-1.5 shadow-md">
                                <ZoomIn className="w-3.5 h-3.5 text-gray-700" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-sm font-semibold text-gray-900">{documentLabel}</p>
                            {fileNameLabel ? (
                              <p
                                className="text-xs text-gray-500 truncate font-mono"
                                title={fileNameLabel}
                              >
                                {fileNameLabel}
                              </p>
                            ) : null}
                            <p className="text-xs text-gray-400">Uploaded {doc.date}</p>
                            <div className="flex items-center justify-between">
                              {getDocumentStatusBadge(doc.status)}
                              <button onClick={() => void openDocModal(doc)} className="text-xs text-[#16A34A] hover:text-[#15803D] font-medium">
                                View Full Size
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* OCR Extracted Data Card (Read-only) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ScanLine className="w-4 h-4 text-[#16A34A]" />
                  OCR Extracted Data
                  <Badge className="ml-auto bg-gray-100 text-gray-500 border-gray-200 text-xs font-normal">Read-only</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Government ID Type</p>
                    <p className="text-sm font-medium text-gray-900 mt-1.5 flex items-center gap-2">
                      {provider.govIdType}
                      {hasMeaningfulValue(provider.govIdType) ? (
                        <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                      ) : null}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Government ID Number</p>
                    <p className="text-sm font-mono font-medium text-gray-900 mt-1.5 flex items-center gap-2">
                      {provider.govIdNumber}
                      {hasMeaningfulValue(provider.govIdNumber) ? (
                        <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                      ) : null}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">OCR Confidence Score</p>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#16A34A] rounded-full"
                        style={{ width: `${provider.ocrConfidence ?? 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-[#16A34A]">
                      {provider.ocrConfidence === null ? "—" : `${provider.ocrConfidence}%`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT COLUMN (col-span-5) ── */}
          <div className="lg:col-span-5 space-y-5">

            {/* Primary Verification Panel (Read-only) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#16A34A]" />
                  Primary Verification Panel
                  <Badge className="ml-auto bg-gray-100 text-gray-500 border-gray-200 text-xs font-normal">Read-only</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {[
                  { label: "NBI Clearance Number", value: provider.nbiNumber },
                  { label: "PRC License Number", value: provider.prcNumber },
                  { label: "TIN Number", value: provider.tinNumber },
                ].map(item => (
                  <div key={item.label} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{item.label}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono font-medium text-gray-900">{item.value}</p>
                      {hasMeaningfulValue(item.value) ? (
                        <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                      ) : null}
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Background Check Status</p>
                  <div className="flex items-center justify-between">
                    {getBgCheckBadge(provider.bgCheckStatus)}
                    {hasMeaningfulValue(provider.bgCheckStatus) ? (
                      <Shield className="w-4 h-4 text-[#16A34A] shrink-0" />
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verification Checklist (Read-only + Total Score) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                  Verification Checklist
                  <span className="ml-auto text-xs font-normal text-gray-500">
                    {provider.checklist.filter(c => c.checked).length}/{provider.checklist.length} complete
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-[#16A34A] rounded-full"
                    style={{
                      width:
                        provider.checklist.length > 0
                          ? `${(provider.checklist.filter(c => c.checked).length / provider.checklist.length) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
                {provider.checklist.length === 0 ? (
                  <p className="text-sm text-gray-500 py-3">No verification checklist returned by the backend.</p>
                ) : (
                  provider.checklist.map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg ${item.checked ? "bg-gray-50" : "bg-red-50"}`}>
                      {item.checked
                        ? <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                        : <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      }
                      <span className="text-sm text-gray-900 flex-1">{item.label}</span>
                      {item.checked
                        ? <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        : <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      }
                    </div>
                  ))
                )}
                {/* Total Application Score */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="rounded-xl p-4 bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">Total Application Score</p>
                      <span className="text-2xl font-bold text-[#16A34A]">{provider.totalScore}</span>
                    </div>
                    <div className="w-full h-2 bg-[#BBF7D0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#16A34A] rounded-full" style={{ width: "0%" }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Verification Level</p>
                      {getLevelBadge(provider.verificationLevel)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ─── ACTIVITY LOGS TAB ─── */}
      {activeTab === "Activity Logs" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#16A34A]" />
              Audit Trail / Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="relative pl-6">
              <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gray-200" />
              <div className="space-y-0">
                {isLoadingAuditTrail ? (
                  <p className="text-sm text-gray-500 py-6 text-center">
                    Loading provider activity logs...
                  </p>
                ) : providerAuditTrail.length === 0 ? (
                  <p className="text-sm text-gray-500 py-6 text-center">
                    No provider activity logs returned by the backend.
                  </p>
                ) : (
                  providerAuditTrail.map(entry => (
                    <div key={entry.id} className="relative pb-6 last:pb-0">
                      <div className={`absolute left-[-17px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        entry.type === "system" ? "bg-blue-50 border-blue-300" : "bg-[#DCFCE7] border-[#16A34A]"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${entry.type === "system" ? "bg-blue-400" : "bg-[#16A34A]"}`} />
                      </div>
                      <div className="pl-2 hover:bg-gray-50 rounded-lg p-2 transition-colors -ml-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-0.5">
                            <p className="text-sm text-gray-900">{entry.action}</p>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${entry.type === "system" ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"}`}>
                                {entry.type === "system"
                                  ? <><Activity className="w-3 h-3 mr-1" />System</>
                                  : <><User className="w-3 h-3 mr-1" />{entry.actor}</>
                                }
                              </Badge>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{entry.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── PORTFOLIO TAB ─── */}
      {activeTab === "Portfolio" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageOff className="w-4 h-4 text-[#16A34A]" />
              Provider Portfolio · Moderation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {portfolioError ? (
              <p className="text-sm text-red-600 mb-3">{portfolioError}</p>
            ) : null}
            {portfolioLoading ? (
              <p className="text-sm text-gray-500 py-6 text-center">Loading portfolio…</p>
            ) : portfolio.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ImageOff className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-gray-400 text-sm font-medium">No portfolio media uploaded</p>
                <p className="text-gray-300 text-xs mt-1">
                  Items added by this provider on mobile will appear here for review.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {portfolio.map((media) => (
                  <div
                    key={media.id}
                    className="border border-gray-200 rounded-lg overflow-hidden flex flex-col"
                  >
                    <div className="aspect-square bg-gray-100">
                      {media.fileUrl ? (
                        <img
                          src={media.fileUrl}
                          alt={media.caption ?? "Portfolio media"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-300">
                          <ImageOff className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="p-2 space-y-1">
                      <p className="text-xs text-gray-700 line-clamp-2">
                        {media.caption ?? <span className="italic text-gray-400">No caption</span>}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {media.createdAt
                          ? new Date(media.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : ""}
                      </p>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full"
                        onClick={() => void handleRemovePortfolioMedia(media.id)}
                        disabled={deletingMediaId === media.id}
                      >
                        {deletingMediaId === media.id ? "Removing…" : "Remove media"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── AVAILABILITY TAB ─── */}
      {activeTab === "Availability" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#16A34A]" />
              Weekly availability &amp; days off
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-6">
            {availabilityError ? (
              <p className="text-sm text-red-600">{availabilityError}</p>
            ) : null}
            {availabilityLoading ? (
              <p className="text-sm text-gray-500 py-6 text-center">Loading availability…</p>
            ) : !availability ? (
              <p className="text-sm text-gray-500 py-6 text-center">
                Availability data not yet loaded.
              </p>
            ) : (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Weekly windows</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {DAY_ORDER.map((day) => {
                      const windows = availability.windows.filter(
                        (window) => window.dayOfWeek === day && window.isActive,
                      );
                      return (
                        <div
                          key={day}
                          className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2"
                        >
                          <span className="text-sm font-medium text-gray-700">
                            {DAY_LABELS[day]}
                          </span>
                          {windows.length === 0 ? (
                            <Badge variant="outline" className="text-xs">Unavailable</Badge>
                          ) : (
                            <div className="flex flex-wrap gap-1 justify-end">
                              {windows.map((window) => (
                                <Badge
                                  key={window.id}
                                  className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0] text-xs"
                                >
                                  {window.startTime} – {window.endTime}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Upcoming days off
                  </h3>
                  {availability.daysOff.length === 0 ? (
                    <p className="text-xs text-gray-400">No days off scheduled.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {availability.daysOff
                        .slice()
                        .sort((a, b) => a.offDate.localeCompare(b.offDate))
                        .map((dayOff) => (
                          <li
                            key={dayOff.id}
                            className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 text-sm"
                          >
                            <span className="text-gray-700 font-medium">
                              {new Date(dayOff.offDate).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className="text-xs text-gray-500">
                              {dayOff.reason ?? "No reason given"}
                            </span>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── DOCUMENT VIEWER MODAL ─── */}
      <Dialog open={showDocModal} onOpenChange={setShowDocModal}>
        <DialogContent
          className="w-[90%] max-h-[90vh] flex flex-col overflow-x-hidden"
          style={{ maxWidth: "56rem", width: "90%" }}
        >
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#16A34A]" />
              {selectedDoc?.name}
              {selectedDoc ? getDocumentStatusBadge(selectedDoc.status) : null}
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable body — vertical scroll only */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-4">
            {/* Toolbar — single row, no wrap */}
            <div className="flex flex-nowrap items-center gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={() => setZoomLevel(z => Math.max(25, z - 25))}>
                <ZoomOut className="w-3 h-3" />Zoom Out
              </Button>
              <span className="text-xs text-gray-500 text-center tabular-nums px-1 shrink-0">{zoomLevel}%</span>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={() => setZoomLevel(z => Math.min(300, z + 25))}>
                <ZoomIn className="w-3 h-3" />Zoom In
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={() => setRotation(r => (r + 90) % 360)}>
                <RotateCw className="w-3 h-3" />Rotate
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={() => { setZoomLevel(100); setRotation(0); }}>
                Reset
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs shrink-0"
                onClick={handleDownloadSelectedDoc}
                disabled={!selectedDoc?.downloadUrl && !selectedDoc?.previewUrl}
              >
                <Download className="w-3 h-3" />Download
              </Button>
            </div>

            {/* Preview area — fully contained, no horizontal scroll */}
            <div className="w-full min-w-0 rounded-xl overflow-hidden" style={{ height: "380px" }}>
              <div
                className={`${selectedDoc?.color} w-full h-full flex items-center justify-center overflow-hidden`}
                style={{
                  transform: `rotate(${rotation}deg) scale(${zoomLevel / 100})`,
                  transition: "transform 0.25s ease",
                  transformOrigin: "center center",
                }}
              >
                {selectedDoc?.previewUrl ? (
                  <iframe
                    src={selectedDoc.previewUrl}
                    title={selectedDoc.name}
                    className="w-full h-full border-0 bg-white"
                  />
                ) : (
                  <div className="text-center space-y-3 pointer-events-none select-none">
                    <FileText className={`w-24 h-24 ${selectedDoc?.iconColor} opacity-40 mx-auto`} />
                    <p className="text-xs text-gray-400 font-mono break-all px-4">{selectedDoc?.file}</p>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">Uploaded: {selectedDoc?.date}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── REVOKE VERIFICATION MODAL ─── */}
      <Dialog open={showRevokeModal} onOpenChange={setShowRevokeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />Revoke Verification
            </DialogTitle>
            <DialogDescription>
              You are about to revoke the verification status of <strong>{provider.businessName}</strong>. This will suspend their provider account and require re-verification.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 space-y-1">
            <p className="font-medium">This action will:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Remove their Approved status</li>
              <li>Suspend active listings</li>
              <li>Notify the provider via email</li>
              <li>Require full re-verification to restore access</li>
            </ul>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Reason for Revocation <span className="text-red-500">*</span></label>
            <Textarea
              value={revokeReason}
              onChange={e => setRevokeReason(e.target.value)}
              placeholder="Explain why verification is being revoked..."
              rows={3}
              className="text-sm"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRevokeModal(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!revokeReason.trim()}
              onClick={() => { setShowRevokeModal(false); navigate("/service-providers"); }}
              className="gap-2"
            >
              <AlertTriangle className="w-4 h-4" />Confirm Revocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
