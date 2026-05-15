import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Star,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  FileText,
  Shield,
  User,
  Send,
  Columns2,
  ScanLine,
  Briefcase,
  ImageOff,
  BookOpen,
  Users,
  ShieldCheck,
  Activity,
} from "lucide-react";

/* ─── MOCK DATA ─────────────────────────────────────────────────── */
const buildApplication = (
  applicationId: string,
  businessName: string,
  ownerName: string,
  category: string,
  dateApplied: string,
  location: string,
  riskLevel: "low" | "medium" | "high",
  flags: string[]
) => ({
  applicationId,
  businessName,
  ownerName,
  category,
  dateApplied,
  location,
  riskLevel,
  flags,
  govIdNumber: "PSN-2026-" + applicationId.slice(-4),
  ocrConfidence: 92,
  govIdType: "PhilSys National ID",
  notes: [
    {
      id: 1,
      text: "Application received and queued for manual review.",
      author: "System",
      timestamp: dateApplied + " 09:00 AM",
    },
    {
      id: 2,
      text: "Forwarded to senior verifier for flag assessment.",
      author: "Admin User",
      timestamp: dateApplied + " 10:30 AM",
    },
  ],
});

const mockApplications: Record<string, ReturnType<typeof buildApplication>> = {
  "APP-2026-0237": buildApplication("APP-2026-0237", "AutoCare Express", "Leonardo David Reyes", "Automotive & Tech Support", "Mar 4, 2026", "Makati City, Metro Manila", "medium", ["ID mismatch", "Duplicate TIN"]),
  "APP-2026-0235": buildApplication("APP-2026-0235", "Wellness Massage Therapy", "Carmen Grace Alvarez", "Beauty Wellness & Personal Care", "Mar 3, 2026", "Manila City, Metro Manila", "low", []),
  "APP-2026-0238": buildApplication("APP-2026-0238", "PetCare Veterinary Services", "Victoria Anne Lopez", "Pet Services", "Mar 3, 2026", "Pasig City, Metro Manila", "low", []),
  "APP-2026-0236": buildApplication("APP-2026-0236", "Prime Cleaning Solutions", "Fernando Jose Santos", "Domestic & Cleaning Services", "Mar 2, 2026", "Quezon City, Metro Manila", "high", ["Blurry document", "Missing document", "Duplicate TIN"]),
  "APP-2026-0240": buildApplication("APP-2026-0240", "HandyFix Home Services", "Michelle Anne Garcia", "Home Maintenance & Repair", "Mar 2, 2026", "Mandaluyong City, Metro Manila", "low", []),
  "APP-2026-0234": buildApplication("APP-2026-0234", "Tutor Excellence Hub", "Roberto Miguel Cruz", "Education & Professional Services", "Mar 1, 2026", "Taguig City, Metro Manila", "low", []),
  "APP-2026-0239": buildApplication("APP-2026-0239", "EventMasters Pro", "Christopher James Diaz", "Events & Entertainment", "Mar 1, 2026", "Pasay City, Metro Manila", "medium", ["Missing document"]),
};

/* ─── SHARED CONSTANTS ───────────────────────────────────────────── */
const TABS = ["Overview", "Documents", "Portfolio", "References", "Background Check", "Activity Logs"];

const DOCUMENT_TYPES = [
  { id: "gov-id", name: "Government ID", file: "national-id-2026.jpg", date: "Mar 1, 2026", status: "verified", color: "bg-blue-100", iconColor: "text-blue-500" },
  { id: "nbi", name: "NBI Clearance", file: "nbi-clearance.pdf", date: "Mar 1, 2026", status: "pending", color: "bg-amber-100", iconColor: "text-amber-500" },
  { id: "prc", name: "PRC License", file: "prc-license-2026.jpg", date: "Mar 1, 2026", status: "verified", color: "bg-purple-100", iconColor: "text-purple-500" },
  { id: "tin", name: "TIN Document", file: "bir-tin-2026.pdf", date: "Mar 1, 2026", status: "flagged", color: "bg-orange-100", iconColor: "text-orange-500" },
  { id: "permit", name: "Business Permit", file: "business-permit-2026.pdf", date: "Mar 1, 2026", status: "pending", color: "bg-teal-100", iconColor: "text-teal-500" },
  { id: "address", name: "Proof of Address", file: "utility-bill-2026.jpg", date: "Mar 1, 2026", status: "verified", color: "bg-cyan-100", iconColor: "text-cyan-500" },
  { id: "insurance", name: "Insurance Certificate", file: "insurance-cert-2026.pdf", date: "Mar 1, 2026", status: "pending", color: "bg-indigo-100", iconColor: "text-indigo-500" },
];

/* ─── HELPERS ────────────────────────────────────────────────────── */
type VerifStatus = null | "loading" | "verified" | "no-match" | "error";

function getDocBadge(status: string) {
  switch (status) {
    case "verified": return <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0] text-xs"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
    case "pending": return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    case "flagged": return <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Flagged</Badge>;
    case "rejected": return <Badge className="bg-red-50 text-red-700 border-red-200 text-xs"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    default: return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
}

function getRiskBadge(level: "low" | "medium" | "high") {
  switch (level) {
    case "low": return <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]"><Shield className="w-3 h-3 mr-1" />Low Risk</Badge>;
    case "medium": return <Badge className="bg-amber-50 text-amber-700 border-amber-200"><AlertTriangle className="w-3 h-3 mr-1" />Medium Risk</Badge>;
    case "high": return <Badge className="bg-red-50 text-red-700 border-red-200"><AlertTriangle className="w-3 h-3 mr-1" />High Risk</Badge>;
  }
}

function getVerifResult(status: VerifStatus) {
  if (!status) return null;
  if (status === "loading") return <span className="inline-flex items-center gap-1.5 text-gray-500 text-sm"><RefreshCw className="w-3.5 h-3.5 animate-spin" />Verifying…</span>;
  if (status === "verified") return <span className="inline-flex items-center gap-1.5 text-[#16A34A] text-sm"><CheckCircle className="w-3.5 h-3.5" />Verified</span>;
  if (status === "no-match") return <span className="inline-flex items-center gap-1.5 text-red-600 text-sm"><XCircle className="w-3.5 h-3.5" />No Match</span>;
  if (status === "error") return <span className="inline-flex items-center gap-1.5 text-amber-600 text-sm"><AlertCircle className="w-3.5 h-3.5" />Error – Retry</span>;
}

const TAB_EMPTY_ICONS: Record<string, React.ReactNode> = {
  Overview: <Briefcase className="w-10 h-10 text-gray-200 mb-3" />,
  Portfolio: <ImageOff className="w-10 h-10 text-gray-200 mb-3" />,
  References: <Users className="w-10 h-10 text-gray-200 mb-3" />,
  "Background Check": <ShieldCheck className="w-10 h-10 text-gray-200 mb-3" />,
  "Activity Logs": <Activity className="w-10 h-10 text-gray-200 mb-3" />,
};

/* ─── MAIN COMPONENT ─────────────────────────────────────────────── */
export function ProviderApplicationReview() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const application = id ? mockApplications[id] : null;

  const [activeTab, setActiveTab] = useState("Documents");
  const [flagsExpanded, setFlagsExpanded] = useState(true);
  const [compareMode, setCompareMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState<typeof DOCUMENT_TYPES[0] | null>(null);
  const [nbiNumber, setNbiNumber] = useState("");
  const [prcNumber, setPrcNumber] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [nbiResult, setNbiResult] = useState<VerifStatus>(null);
  const [prcResult, setPrcResult] = useState<VerifStatus>(null);
  const [adminNote, setAdminNote] = useState("");
  const [notes, setNotes] = useState(application?.notes || []);
  const [checklist, setChecklist] = useState([
    { id: "identity", label: "Identity matches documents", checked: true },
    { id: "nbi", label: "NBI verified", checked: false },
    { id: "prc", label: "PRC verified", checked: true },
    { id: "tin", label: "TIN verified", checked: false },
    { id: "docs", label: "All required documents submitted", checked: true },
  ]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [govIdType, setGovIdType] = useState(application?.govIdType || "PhilSys National ID");
  const [govIdNumber, setGovIdNumber] = useState(application?.govIdNumber || "");
  const [ocrRunning, setOcrRunning] = useState(false);

  if (!application) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-3">
          <FileText className="w-12 h-12 text-gray-300 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-700">Application Not Found</h2>
          <p className="text-gray-500 text-sm">No application found for ID: {id}</p>
          <Button variant="outline" onClick={() => navigate("/approval-queue")} className="mt-2 gap-2">
            <ArrowLeft className="w-4 h-4" />Back to Approval Queue
          </Button>
        </div>
      </div>
    );
  }

  const checkedCount = checklist.filter((c) => c.checked).length;
  const canApprove = checkedCount === checklist.length;
  const verifiedDocs = DOCUMENT_TYPES.filter(d => d.status === "verified").length;

  const simulateVerify = (type: "nbi" | "prc", setter: (v: VerifStatus) => void) => {
    setter("loading");
    setTimeout(() => {
      const result: VerifStatus = Math.random() > 0.3 ? "verified" : "no-match";
      setter(result);
      if (result === "verified") {
        setChecklist(prev => prev.map(c => c.id === type ? { ...c, checked: true } : c));
      }
    }, 1800);
  };

  const handleAddNote = () => {
    if (!adminNote.trim()) return;
    setNotes(prev => [...prev, {
      id: prev.length + 1,
      text: adminNote.trim(),
      author: "Admin User",
      timestamp: "Mar 31, 2026 " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    }]);
    setAdminNote("");
  };

  const openDocModal = (doc: typeof DOCUMENT_TYPES[0]) => {
    setSelectedDoc(doc);
    setZoomLevel(100);
    setRotation(0);
    setCompareMode(false);
    setShowDocModal(true);
  };

  return (
    <div className="flex flex-col space-y-5 pb-20">

      {/* ─── BREADCRUMB ─── */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button onClick={() => navigate("/")} className="text-gray-500 hover:text-gray-700 text-sm">User Management</button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button onClick={() => navigate("/approval-queue")} className="text-gray-500 hover:text-gray-700 text-sm">Approval Queue</button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-gray-900 text-sm">{application.applicationId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* ─── PAGE HEADER ROW ─── */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate("/approval-queue")} className="gap-2 shrink-0">
          <ArrowLeft className="w-4 h-4" />Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Provider Application Review</h1>
          <p className="text-gray-500 text-sm mt-0.5">Review and process provider onboarding application</p>
        </div>
      </div>

      {/* ─── TOP SUMMARY CARD ─── */}
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-5 justify-between">
            {/* Left: Avatar + Profile */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                <User className="w-8 h-8 text-amber-500" />
              </div>
              <div className="space-y-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{application.businessName}</h2>
                  <p className="text-gray-500 text-sm">{application.ownerName}</p>
                </div>
                <p className="text-sm text-gray-600">{application.category}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200">
                    <Clock className="w-3 h-3 mr-1" />Pending Review
                  </Badge>
                  {getRiskBadge(application.riskLevel)}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <Star className="w-3.5 h-3.5" />
                  <span>No ratings yet</span>
                </div>
              </div>
            </div>

            {/* Right: Meta info */}
            <div className="flex flex-col gap-2.5 sm:items-end text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-y-2 gap-x-6">
                <div className="sm:text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Application ID</p>
                  <p className="font-mono text-[#16A34A] font-semibold text-sm">{application.applicationId}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Date Applied</p>
                  <p className="text-gray-700 font-medium text-sm">{application.dateApplied}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Location</p>
                  <p className="text-gray-700 font-medium text-sm">{application.location}</p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Documents</p>
                  <p className="text-gray-700 font-medium text-sm">{verifiedDocs}/{DOCUMENT_TYPES.length} Verified</p>
                </div>
              </div>
            </div>
          </div>

          {/* Flags inline (below main row) */}
          {application.flags.length > 0 && (
            <div className={`mt-4 pt-4 border-t border-gray-100`}>
              <button
                onClick={() => setFlagsExpanded(v => !v)}
                className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                <AlertTriangle className="w-4 h-4" />
                {application.flags.length} Flag{application.flags.length !== 1 ? "s" : ""} Detected
                {flagsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {flagsExpanded && (
                <div className="flex flex-wrap gap-2 mt-2.5">
                  {application.flags.map(flag => (
                    <span key={flag} className="inline-flex items-center gap-1.5 text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-3 py-1">
                      <AlertCircle className="w-3 h-3" />{flag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── NAVIGATION TABS ─── */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-white text-[#16A34A] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

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
                  <span className="ml-auto text-xs text-gray-400 font-normal">{verifiedDocs}/{DOCUMENT_TYPES.length} Verified</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DOCUMENT_TYPES.map(doc => (
                    <div key={doc.id} className="border border-gray-100 rounded-xl p-3 hover:border-gray-200 hover:shadow-sm transition-all group">
                      <div className={`${doc.color} rounded-lg h-20 flex items-center justify-center mb-3 relative overflow-hidden`}>
                        <FileText className={`w-8 h-8 ${doc.iconColor} opacity-60`} />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                          <button onClick={() => openDocModal(doc)} className="bg-white rounded-full p-1.5 shadow-md">
                            <ZoomIn className="w-3.5 h-3.5 text-gray-700" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500 truncate font-mono">{doc.file}</p>
                        <p className="text-xs text-gray-400">Uploaded {doc.date}</p>
                        <div className="flex items-center justify-between">
                          {getDocBadge(doc.status)}
                          <button onClick={() => openDocModal(doc)} className="text-xs text-[#16A34A] hover:text-[#15803D] font-medium">
                            View Full Size
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* OCR Extracted Data Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ScanLine className="w-4 h-4 text-[#16A34A]" />
                  OCR Extracted Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Government ID Type</label>
                    <select
                      value={govIdType}
                      onChange={e => setGovIdType(e.target.value)}
                      className="mt-1.5 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
                    >
                      <option>PhilSys National ID</option>
                      <option>Driver's License</option>
                      <option>Passport</option>
                      <option>PRC ID</option>
                      <option>SSS ID</option>
                      <option>Voter's ID</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Government ID Number</label>
                    <Input
                      value={govIdNumber}
                      onChange={e => setGovIdNumber(e.target.value)}
                      className="mt-1.5 text-sm"
                      placeholder="e.g. PSN-2026-1234"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-gray-500">OCR Confidence Score</p>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#16A34A] rounded-full" style={{ width: `${application.ocrConfidence}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-[#16A34A]">{application.ocrConfidence}%</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={() => { setOcrRunning(true); setTimeout(() => setOcrRunning(false), 2000); }} disabled={ocrRunning}>
                    {ocrRunning ? <><RefreshCw className="w-3 h-3 animate-spin" />Running…</> : <><ScanLine className="w-3 h-3" />Run OCR Again</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT COLUMN (col-span-5) ── */}
          <div className="lg:col-span-5 space-y-5">

            {/* Primary Verification Panel */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#16A34A]" />
                  Primary Verification Panel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-0">
                {/* NBI */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">NBI Clearance Number</label>
                  <Input value={nbiNumber} onChange={e => setNbiNumber(e.target.value)} placeholder="e.g. NBI-2026-XXXXXX" className="text-sm" />
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={() => simulateVerify("nbi", setNbiResult)} disabled={nbiResult === "loading"}>
                      <Shield className="w-3 h-3" />Verify with NBI Online
                    </Button>
                    {getVerifResult(nbiResult)}
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* PRC */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">PRC License Number</label>
                  <Input value={prcNumber} onChange={e => setPrcNumber(e.target.value)} placeholder="e.g. PRC-2026-XXXXXX" className="text-sm" />
                  <div className="flex items-center gap-3">
                    <Button size="sm" variant="outline" className="gap-2 text-xs" onClick={() => simulateVerify("prc", setPrcResult)} disabled={prcResult === "loading"}>
                      <Shield className="w-3 h-3" />Verify with PRC Online
                    </Button>
                    {getVerifResult(prcResult)}
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* TIN */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">TIN Number</label>
                  <Input value={tinNumber} onChange={e => setTinNumber(e.target.value)} placeholder="e.g. 123-456-789-000" className="text-sm" />
                  <p className="text-xs text-gray-400">Manually cross-check with BIR records</p>
                </div>
              </CardContent>
            </Card>

            {/* Verification Checklist */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                  Verification Checklist
                  <span className="ml-auto text-xs font-normal text-gray-500">{checkedCount}/{checklist.length} complete</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-[#16A34A] rounded-full transition-all" style={{ width: `${(checkedCount / checklist.length) * 100}%` }} />
                </div>
                {checklist.map(item => (
                  <label key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => setChecklist(prev => prev.map(c => c.id === item.id ? { ...c, checked: !c.checked } : c))}
                      className="w-4 h-4 accent-[#16A34A]"
                    />
                    <span className={`text-sm flex-1 ${item.checked ? "text-gray-900" : "text-gray-500"}`}>{item.label}</span>
                    {item.checked && <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />}
                  </label>
                ))}
                {!canApprove && (
                  <p className="text-xs text-amber-600 mt-2 pt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 shrink-0" />Complete all checks to enable approval
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Admin Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#16A34A]" />
                  Admin Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="space-y-3">
                  {notes.map(note => (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-700">{note.author}</span>
                        <span className="text-xs text-gray-400">{note.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-600">{note.text}</p>
                    </div>
                  ))}
                </div>
                <Textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Add a note..." rows={3} className="text-sm resize-none" />
                <Button size="sm" className="w-full gap-2 bg-[#16A34A] hover:bg-[#15803D]" onClick={handleAddNote} disabled={!adminNote.trim()}>
                  <Send className="w-3.5 h-3.5" />Add Note
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ─── EMPTY STATE TABS ─── */}
      {activeTab !== "Documents" && (
        <Card className="border-dashed border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            {TAB_EMPTY_ICONS[activeTab] ?? <FileText className="w-10 h-10 text-gray-200 mb-3" />}
            <p className="text-gray-400 text-sm font-medium">{activeTab}</p>
            <p className="text-gray-300 text-xs mt-1">No information available for this section yet</p>
          </CardContent>
        </Card>
      )}

      {/* ─── STICKY ACTION BAR (portal → fixed to content column) ─── */}
      {createPortal(
        <div
          className="fixed bottom-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]"
          style={{ left: "var(--sidebar-offset, 16rem)" }}
        >
          <div className="px-6 py-3 flex items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{application.applicationId}</span>
              {" — "}{application.businessName}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300" onClick={() => setShowRejectModal(true)}>
                <XCircle className="w-4 h-4" />Reject
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setShowRequestModal(true)}>
                <AlertCircle className="w-4 h-4" />Request More Info
              </Button>
              <Button
                className="gap-2 bg-[#16A34A] hover:bg-[#15803D]"
                onClick={() => setShowApproveModal(true)}
                disabled={!canApprove}
                title={canApprove ? "" : "Complete all verification checklist items first"}
              >
                <CheckCircle className="w-4 h-4" />Approve Provider
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ─── DOCUMENT VIEWER MODAL ─── */}
      <Dialog open={showDocModal} onOpenChange={setShowDocModal}>
        <DialogContent
          className="w-[90%] max-h-[90vh] flex flex-col overflow-x-hidden"
          style={{ maxWidth: "56rem", width: "90%" }}
        >
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#16A34A]" />{selectedDoc?.name}
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable body — vertical only, no horizontal overflow */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-4">
            {/* Toolbar — single row, no wrap */}
            <div className="flex flex-nowrap items-center gap-2">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={() => setZoomLevel(z => Math.max(25, z - 25))}>
                <ZoomOut className="w-3 h-3" />Zoom Out
              </Button>
              <span className="text-xs text-gray-500 tabular-nums px-1 shrink-0">{zoomLevel}%</span>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={() => setZoomLevel(z => Math.min(300, z + 25))}>
                <ZoomIn className="w-3 h-3" />Zoom In
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={() => setRotation(r => (r + 90) % 360)}>
                <RotateCw className="w-3 h-3" />Rotate
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0" onClick={() => { setZoomLevel(100); setRotation(0); }}>
                Reset
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0">
                <Download className="w-3 h-3" />Download
              </Button>
              <Button
                size="sm"
                variant={compareMode ? "default" : "outline"}
                className={`gap-1.5 text-xs shrink-0 ml-auto ${compareMode ? "bg-[#16A34A] hover:bg-[#15803D]" : ""}`}
                onClick={() => setCompareMode(v => !v)}
              >
                <Columns2 className="w-3 h-3" />Compare Mode
              </Button>
            </div>

            {compareMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Document Preview</p>
                  {/* Clipping wrapper — overflow:hidden keeps transform contained */}
                  <div className="w-full min-w-0 rounded-xl overflow-hidden" style={{ height: "280px" }}>
                    <div
                      className={`${selectedDoc?.color} w-full h-full flex items-center justify-center overflow-hidden`}
                      style={{
                        transform: `rotate(${rotation}deg) scale(${zoomLevel / 100})`,
                        transition: "transform 0.25s ease",
                        transformOrigin: "center center",
                      }}
                    >
                      <FileText className={`w-16 h-16 ${selectedDoc?.iconColor} opacity-40 pointer-events-none`} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2 min-w-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">OCR Data + Manual Input</p>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3 overflow-y-auto" style={{ height: "280px" }}>
                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500">ID Type</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{govIdType}</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500">ID Number</p>
                      <p className="text-sm font-mono text-gray-900 mt-0.5 break-all">{govIdNumber}</p>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-[#16A34A]/30">
                      <p className="text-xs text-gray-500">Owner Name</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{application.ownerName}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-[#16A34A] mt-1">
                        <CheckCircle className="w-3 h-3" />Match
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Normal view — fully constrained, no horizontal scroll */
              <div className="w-full min-w-0 rounded-xl overflow-hidden" style={{ height: "380px" }}>
                <div
                  className={`${selectedDoc?.color} w-full h-full flex items-center justify-center overflow-hidden`}
                  style={{
                    transform: `rotate(${rotation}deg) scale(${zoomLevel / 100})`,
                    transition: "transform 0.25s ease",
                    transformOrigin: "center center",
                  }}
                >
                  <div className="text-center space-y-2 pointer-events-none select-none">
                    <FileText className={`w-20 h-20 ${selectedDoc?.iconColor} opacity-40 mx-auto`} />
                    <p className="text-xs text-gray-400 font-mono break-all px-4">{selectedDoc?.file}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Uploaded: {selectedDoc?.date}</span>
              <span>{getDocBadge(selectedDoc?.status || "pending")}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── APPROVE MODAL ─── */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#16A34A]" />Approve Provider Application
            </DialogTitle>
            <DialogDescription>
              You are about to approve <strong>{application.businessName}</strong> ({application.applicationId}) as a service provider on the ServEase platform.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-[#DCFCE7] rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-[#15803D]">Approval Summary</p>
            <ul className="space-y-1">
              {checklist.map(c => (
                <li key={c.id} className="flex items-center gap-2 text-sm text-[#166534]">
                  <CheckCircle className="w-3.5 h-3.5" />{c.label}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>Cancel</Button>
            <Button className="bg-[#16A34A] hover:bg-[#15803D] gap-2" onClick={() => { setShowApproveModal(false); navigate("/approval-queue"); }}>
              <CheckCircle className="w-4 h-4" />Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── REJECT MODAL ─── */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />Reject Application
            </DialogTitle>
            <DialogDescription>
              Rejecting <strong>{application.businessName}</strong>'s application. This action will notify the applicant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Rejection Reason <span className="text-red-500">*</span></label>
            <Textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Explain why this application is being rejected..." rows={4} className="text-sm" />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
            <Button variant="destructive" disabled={!rejectionReason.trim()} onClick={() => { setShowRejectModal(false); navigate("/approval-queue"); }} className="gap-2">
              <XCircle className="w-4 h-4" />Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── REQUEST MORE INFO MODAL ─── */}
      <Dialog open={showRequestModal} onOpenChange={setShowRequestModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />Request More Information
            </DialogTitle>
            <DialogDescription>
              Send a request to <strong>{application.ownerName}</strong> for additional information or documents.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Message to Applicant <span className="text-red-500">*</span></label>
            <Textarea value={requestMessage} onChange={e => setRequestMessage(e.target.value)} placeholder="Describe what additional information or documents are needed..." rows={4} className="text-sm" />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowRequestModal(false)}>Cancel</Button>
            <Button className="gap-2 bg-amber-500 hover:bg-amber-600" disabled={!requestMessage.trim()} onClick={() => setShowRequestModal(false)}>
              <Send className="w-4 h-4" />Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}