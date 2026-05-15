import { useState } from "react";
import { useNavigate, useParams } from "react-router";
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
  ShieldCheck,
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
  Briefcase,
  ImageOff,
  Users,
  ScanLine,
  BookOpen,
} from "lucide-react";

/* ─── MOCK DATA ─────────────────────────────────────────────────── */
const PROVIDERS: Record<string, {
  id: string;
  businessName: string;
  ownerName: string;
  category: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  totalBookings: number;
  completionRate: number;
  verificationLevel: "Basic" | "Fully Verified" | "Premium";
  approvalDate: string;
  approvedBy: string;
  joinDate: string;
  nbiNumber: string;
  prcNumber: string;
  tinNumber: string;
  bgCheckStatus: "Passed" | "Failed" | "Concern";
  totalScore: number;
  checklist: { label: string; checked: boolean }[];
  notes: { id: number; text: string; author: string; timestamp: string }[];
  auditTrail: { id: number; timestamp: string; actor: string; action: string; type: "system" | "admin" | "provider" }[];
  services: string[];
  govIdType: string;
  govIdNumber: string;
  ocrConfidence: number;
}> = {
  "PRV-001": {
    id: "PRV-001",
    businessName: "HomeFixPro Manila",
    ownerName: "Juan Dela Cruz",
    category: "Home Maintenance & Repair",
    location: "Makati City, Metro Manila",
    phone: "+63 917 123 4567",
    email: "contact@homefixpro.ph",
    website: "https://homefixpro.ph",
    rating: 4.8,
    totalBookings: 234,
    completionRate: 97.4,
    verificationLevel: "Fully Verified",
    approvalDate: "Jan 15, 2024",
    approvedBy: "Admin User",
    joinDate: "Jan 15, 2024",
    nbiNumber: "NBI-2024-HM-001234",
    prcNumber: "PRC-2024-HM-056789",
    tinNumber: "123-456-789-000",
    bgCheckStatus: "Passed",
    totalScore: 96,
    checklist: [
      { label: "Identity matches documents", checked: true },
      { label: "NBI verified", checked: true },
      { label: "PRC verified", checked: true },
      { label: "TIN verified", checked: true },
      { label: "All required documents submitted", checked: true },
    ],
    notes: [
      { id: 1, text: "Application reviewed and all documents verified successfully.", author: "Admin User", timestamp: "Jan 14, 2024 2:30 PM" },
      { id: 2, text: "Background check cleared. Provider approved for platform.", author: "Admin User", timestamp: "Jan 15, 2024 9:00 AM" },
    ],
    auditTrail: [
      { id: 1, timestamp: "Jan 10, 2024 8:00 AM", actor: "System", action: "Application submitted by provider", type: "system" },
      { id: 2, timestamp: "Jan 10, 2024 8:05 AM", actor: "System", action: "Documents uploaded and queued for OCR processing", type: "system" },
      { id: 3, timestamp: "Jan 10, 2024 8:10 AM", actor: "System", action: "OCR processing completed – confidence score: 96%", type: "system" },
      { id: 4, timestamp: "Jan 11, 2024 10:00 AM", actor: "Admin User", action: "NBI Clearance verified via NBI Online API", type: "admin" },
      { id: 5, timestamp: "Jan 12, 2024 2:00 PM", actor: "Admin User", action: "PRC License verified via PRC Online API", type: "admin" },
      { id: 6, timestamp: "Jan 13, 2024 11:30 AM", actor: "Admin User", action: "Background check submitted to third-party service", type: "admin" },
      { id: 7, timestamp: "Jan 14, 2024 2:30 PM", actor: "Admin User", action: "All documents reviewed. Notes added to application.", type: "admin" },
      { id: 8, timestamp: "Jan 15, 2024 9:00 AM", actor: "Admin User", action: "Application approved. Provider onboarded to platform.", type: "admin" },
      { id: 9, timestamp: "Jan 15, 2024 9:02 AM", actor: "System", action: "Verification level set to: Fully Verified", type: "system" },
      { id: 10, timestamp: "Jan 15, 2024 9:05 AM", actor: "System", action: "Welcome email sent to provider", type: "system" },
    ],
    services: ["Plumbing repairs & installation", "Electrical troubleshooting", "Carpentry & furniture assembly", "Painting & wall repairs", "General home maintenance"],
    govIdType: "PhilSys National ID",
    govIdNumber: "PSN-2024-001234",
    ocrConfidence: 96,
  },
  "PRV-002": {
    id: "PRV-002",
    businessName: "Sparkle Clean Services",
    ownerName: "Maria Santos",
    category: "Domestic & Cleaning Services",
    location: "Quezon City, Metro Manila",
    phone: "+63 917 234 5678",
    email: "info@sparkleclean.ph",
    website: "https://sparkleclean.ph",
    rating: 4.9,
    totalBookings: 198,
    completionRate: 97,
    verificationLevel: "Premium",
    approvalDate: "Feb 20, 2024",
    approvedBy: "Admin User",
    joinDate: "Feb 20, 2024",
    nbiNumber: "NBI-2024-DC-005678",
    prcNumber: "N/A",
    tinNumber: "234-567-890-000",
    bgCheckStatus: "Passed",
    totalScore: 98,
    checklist: [
      { label: "Identity matches documents", checked: true },
      { label: "NBI verified", checked: true },
      { label: "PRC verified", checked: true },
      { label: "TIN verified", checked: true },
      { label: "All required documents submitted", checked: true },
    ],
    notes: [
      { id: 1, text: "Excellent application. All documents in order.", author: "Admin User", timestamp: "Feb 19, 2024 3:00 PM" },
      { id: 2, text: "Premium verification level granted due to exceptional records.", author: "Admin User", timestamp: "Feb 20, 2024 10:00 AM" },
    ],
    auditTrail: [
      { id: 1, timestamp: "Feb 15, 2024 9:00 AM", actor: "System", action: "Application submitted by provider", type: "system" },
      { id: 2, timestamp: "Feb 15, 2024 9:08 AM", actor: "System", action: "OCR processing completed – confidence score: 98%", type: "system" },
      { id: 3, timestamp: "Feb 16, 2024 11:00 AM", actor: "Admin User", action: "NBI Clearance verified", type: "admin" },
      { id: 4, timestamp: "Feb 19, 2024 3:00 PM", actor: "Admin User", action: "All verifications complete. Premium level approved.", type: "admin" },
      { id: 5, timestamp: "Feb 20, 2024 10:00 AM", actor: "Admin User", action: "Application approved. Provider onboarded.", type: "admin" },
      { id: 6, timestamp: "Feb 20, 2024 10:02 AM", actor: "System", action: "Verification level set to: Premium", type: "system" },
    ],
    services: ["Deep cleaning", "Regular housekeeping", "Office cleaning", "Move-in/move-out cleaning", "Post-construction cleaning"],
    govIdType: "Driver's License",
    govIdNumber: "DL-2024-005678",
    ocrConfidence: 98,
  },
};

const DEFAULT_PROVIDER = PROVIDERS["PRV-001"];

/* ─── SHARED CONSTANTS ───────────────────────────────────────────── */
const TABS = ["Overview", "Documents", "Portfolio", "References", "Background Check", "Activity Logs"];

const DOCUMENT_TYPES = [
  { id: "gov-id", name: "Government ID", file: "national-id-verified.jpg", date: "Jan 10, 2024", color: "bg-blue-100", iconColor: "text-blue-500" },
  { id: "nbi", name: "NBI Clearance", file: "nbi-clearance-verified.pdf", date: "Jan 10, 2024", color: "bg-green-100", iconColor: "text-green-500" },
  { id: "prc", name: "PRC License", file: "prc-license-verified.jpg", date: "Jan 10, 2024", color: "bg-purple-100", iconColor: "text-purple-500" },
  { id: "tin", name: "TIN Document", file: "bir-tin-verified.pdf", date: "Jan 10, 2024", color: "bg-teal-100", iconColor: "text-teal-500" },
  { id: "permit", name: "Business Permit", file: "business-permit-verified.pdf", date: "Jan 10, 2024", color: "bg-cyan-100", iconColor: "text-cyan-500" },
  { id: "address", name: "Proof of Address", file: "utility-bill-verified.jpg", date: "Jan 10, 2024", color: "bg-indigo-100", iconColor: "text-indigo-500" },
  { id: "insurance", name: "Insurance Certificate", file: "insurance-cert-verified.pdf", date: "Jan 10, 2024", color: "bg-pink-100", iconColor: "text-pink-500" },
];

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

const TAB_EMPTY_ICONS: Record<string, React.ReactNode> = {
  Portfolio: <ImageOff className="w-10 h-10 text-gray-200 mb-3" />,
  References: <Users className="w-10 h-10 text-gray-200 mb-3" />,
  "Background Check": <ShieldCheck className="w-10 h-10 text-gray-200 mb-3" />,
};

/* ─── MAIN COMPONENT ─────────────────────────────────────────────── */
export function ServiceProviderDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const provider = (id && PROVIDERS[id]) ? PROVIDERS[id] : DEFAULT_PROVIDER;

  const [activeTab, setActiveTab] = useState("Documents");
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<typeof DOCUMENT_TYPES[0] | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [rotation, setRotation] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);

  const openDocModal = (doc: typeof DOCUMENT_TYPES[0]) => {
    setSelectedDoc(doc);
    setRotation(0);
    setZoomLevel(100);
    setShowDocModal(true);
  };

  return (
    <div className="space-y-5">

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
              <button onClick={() => navigate("/service-providers")} className="text-gray-500 hover:text-gray-700 text-sm">Service Providers</button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-gray-900 text-sm">{provider.id}</BreadcrumbPage>
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

      {/* ─── TOP SUMMARY CARD (identical structure to ProviderApplicationReview) ─── */}
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
                  <p className="font-bold text-gray-900">{provider.completionRate}%</p>
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

      {/* ─── NAVIGATION TABS (identical to ProviderApplicationReview) ─── */}
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
                {provider.services.map((service, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />{service}
                  </li>
                ))}
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
                  { label: "Completion Rate", value: `${provider.completionRate}%`, color: "text-[#16A34A]" },
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

      {/* ─── DOCUMENTS TAB (same 7/5 grid as ProviderApplicationReview) ─── */}
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
                  <span className="ml-auto text-xs text-gray-400 font-normal">{DOCUMENT_TYPES.length}/{DOCUMENT_TYPES.length} Verified</span>
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
                          <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0] text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />Verified
                          </Badge>
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
                      <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Government ID Number</p>
                    <p className="text-sm font-mono font-medium text-gray-900 mt-1.5 flex items-center gap-2">
                      {provider.govIdNumber}
                      <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">OCR Confidence Score</p>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#16A34A] rounded-full" style={{ width: `${provider.ocrConfidence}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-[#16A34A]">{provider.ocrConfidence}%</span>
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
                      <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Background Check Status</p>
                  <div className="flex items-center justify-between">
                    {getBgCheckBadge(provider.bgCheckStatus)}
                    <Shield className="w-4 h-4 text-[#16A34A] shrink-0" />
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
                  <span className="ml-auto text-xs font-normal text-gray-500">{provider.checklist.length}/{provider.checklist.length} complete</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-[#16A34A] rounded-full" style={{ width: "100%" }} />
                </div>
                {provider.checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50">
                    <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span className="text-sm text-gray-900 flex-1">{item.label}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                  </div>
                ))}
                {/* Total Application Score */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="rounded-xl p-4 bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">Total Application Score</p>
                      <span className="text-2xl font-bold text-[#16A34A]">{provider.totalScore}<span className="text-sm font-normal text-gray-400">/100</span></span>
                    </div>
                    <div className="w-full h-2 bg-[#BBF7D0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#16A34A] rounded-full" style={{ width: `${provider.totalScore}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">Verification Level</p>
                      {getLevelBadge(provider.verificationLevel)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Notes (Read-only) */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#16A34A]" />
                  Admin Notes
                  <Badge className="ml-auto bg-gray-100 text-gray-500 border-gray-200 text-xs font-normal">Read-only</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                {provider.notes.map(note => (
                  <div key={note.id} className="bg-gray-50 rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">{note.author}</span>
                      <span className="text-xs text-gray-400">{note.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600">{note.text}</p>
                  </div>
                ))}
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
                {provider.auditTrail.map(entry => (
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
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── EMPTY STATE TABS ─── */}
      {activeTab !== "Overview" && activeTab !== "Documents" && activeTab !== "Activity Logs" && (
        <Card className="border-dashed border-gray-200">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            {TAB_EMPTY_ICONS[activeTab] ?? <FileText className="w-10 h-10 text-gray-200 mb-3" />}
            <p className="text-gray-400 text-sm font-medium">{activeTab}</p>
            <p className="text-gray-300 text-xs mt-1">No information available for this section yet</p>
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
              <Badge className="ml-1 bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0] text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />Verified
              </Badge>
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
              <Button size="sm" variant="outline" className="gap-1.5 text-xs shrink-0">
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
                <div className="text-center space-y-3 pointer-events-none select-none">
                  <FileText className={`w-24 h-24 ${selectedDoc?.iconColor} opacity-40 mx-auto`} />
                  <p className="text-xs text-gray-400 font-mono break-all px-4">{selectedDoc?.file}</p>
                </div>
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