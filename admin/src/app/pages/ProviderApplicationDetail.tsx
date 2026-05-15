import { useParams, useNavigate } from "react-router";
import { useState } from "react";
import { applications } from "./ProviderApplications";
import { notifyBackendRequired } from "../utils/backendRequired";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  ChevronRight,
  CheckCircle,
  XCircle,
  Building2,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  FileText,
  Download,
  User,
  IdCard,
  Calendar,
  ExternalLink,
  Eye,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export function ProviderApplicationDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const application = applications.find((app) => app.applicationId === applicationId);

  const [internalNotes, setInternalNotes] = useState("");
  const [notes, setNotes] = useState([
    {
      id: 1,
      author: "Admin Maria Santos",
      timestamp: "2026-03-04 10:30 AM",
      content: "Initial review completed. All documents appear valid.",
    },
  ]);

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [decisionReason, setDecisionReason] = useState("");
  const [decisionComment, setDecisionComment] = useState("");
  const [showRejectValidation, setShowRejectValidation] = useState(false);

  // Verification Checklist for Company applications
  const [checklist, setChecklist] = useState({
    businessPermit: false,
    contactPersonDetails: false,
    validIdOfContactPerson: false,
    businessAddress: false,
    onlinePresence: false,
  });

  const toggleChecklistItem = (item: keyof typeof checklist) => {
    setChecklist((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  if (!application) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Application Not Found</h2>
          <p className="text-gray-500 mt-2">
            The application ID {applicationId} could not be found.
          </p>
          <Button
            onClick={() => navigate("/provider-applications")}
            className="mt-4 bg-[#00BF63] hover:bg-[#00A854]"
          >
            Back to Applications
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    if (status === "pending") {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-sm px-3 py-1">
          Pending Review
        </Badge>
      );
    }
    if (status === "approved") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 text-sm px-3 py-1">
          Approved
        </Badge>
      );
    }
    if (status === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200 text-sm px-3 py-1">
          Rejected
        </Badge>
      );
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const handleAddNote = () => {
    if (internalNotes.trim()) {
      setNotes([
        {
          id: notes.length + 1,
          author: "Current Admin",
          timestamp: new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          content: internalNotes,
        },
        ...notes,
      ]);
      setInternalNotes("");
    }
  };

  const handleApprove = () => {
    notifyBackendRequired(
      "Approving provider applications",
      "POST /v1/admin/provider-applications/:id/approve",
    );
  };

  const handleRejectClick = () => {
    // Open dialog
    setShowRejectDialog(true);
    setShowRejectValidation(false);
    setDecisionReason("");
    setDecisionComment("");
  };

  const handleRejectConfirm = () => {
    // Validate that reason and comment are provided
    if (!decisionReason) {
      setShowRejectValidation(true);
      return;
    }
    if (!decisionComment.trim()) {
      setShowRejectValidation(true);
      return;
    }

    notifyBackendRequired(
      "Rejecting provider applications",
      "POST /v1/admin/provider-applications/:id/reject",
    );
  };

  // Mock data for the application details
  const businessData = {
    businessName: application.businessName,
    category: application.category,
    description:
      "Professional home repair and maintenance services covering electrical work, plumbing, carpentry, painting, and general handyman services. We specialize in residential repairs with a focus on quality workmanship and customer satisfaction.",
    businessType: "Physical Location",
    address: {
      street: "123 Kamuning Road, Brgy. Kamuning",
      city: application.location.split(",")[0],
      province: "Metro Manila",
      fullAddress: "123 Kamuning Road, Brgy. Kamuning, " + application.location,
    },
  };

  const servicesData = {
    description:
      "We offer comprehensive home maintenance and repair services including electrical installations and repairs, plumbing services, carpentry work, interior and exterior painting, appliance repair, and general handyman services. All work is performed by licensed professionals with 5+ years of experience.",
  };

  const workingHours = {
    monday: { open: true, hours: "8:00 AM - 6:00 PM" },
    tuesday: { open: true, hours: "8:00 AM - 6:00 PM" },
    wednesday: { open: true, hours: "8:00 AM - 6:00 PM" },
    thursday: { open: true, hours: "8:00 AM - 6:00 PM" },
    friday: { open: true, hours: "8:00 AM - 6:00 PM" },
    saturday: { open: true, hours: "9:00 AM - 5:00 PM" },
    sunday: { open: false, hours: "Closed" },
  };

  const contactInfo = {
    phone: "+63 917 123 4567",
    email: "contact@handyfixhome.ph",
    website: "https://www.handyfixhome.ph",
  };

  const socialMedia = {
    facebook: "https://facebook.com/handyfixhome",
    instagram: "https://instagram.com/handyfixhome",
    twitter: "https://twitter.com/handyfixhome",
    linkedin: "",
  };

  const businessPermit = {
    fileName: "business-permit-2026.pdf",
    fileType: "PDF",
    uploadedDate: "2026-03-02",
  };

  const contactPerson = {
    fullName: "Michelle Anne Garcia",
    role: "Business Owner / General Manager",
    phone: "+63 917 123 4567",
    email: "michelle.garcia@handyfixhome.ph",
    idType: "Government ID",
    idNumber: "1234-5678-9012",
    idExpiry: "2028-12-31",
    idFileName: "valid-id-michelle-garcia.jpg",
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <button
          onClick={() => navigate("/provider-applications")}
          className="hover:text-[#00BF63] transition-colors"
        >
          Provider Applications
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{application.businessName}</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Review</h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <Badge variant="outline" className="font-mono text-sm">
              {application.applicationId}
            </Badge>
            <Badge variant="outline" className="text-sm">
              <Building2 className="w-3 h-3 mr-1" />
              Provider Type: Company
            </Badge>
            {getStatusBadge(application.status)}
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              Applied: {new Date(application.dateApplied).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons - Responsive */}
        <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="gap-2 border-red-200 text-red-700 hover:bg-red-50 w-full sm:w-auto"
            onClick={handleRejectClick}
          >
            <XCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Reject</span>
            <span className="sm:hidden">Reject</span>
          </Button>
          <Button
            className="gap-2 bg-[#00BF63] hover:bg-[#00A854] w-full sm:w-auto"
            onClick={handleApprove}
          >
            <CheckCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Approve</span>
            <span className="sm:hidden">Approve</span>
          </Button>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION A - Business Registration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#00BF63]" />
                Business Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Business Name */}
              <div>
                <label className="text-sm font-medium text-gray-700">Business Name</label>
                <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{businessData.businessName}</p>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{businessData.category}</p>
                </div>
              </div>

              {/* Business Description */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Business Description
                </label>
                <div className="mt-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 text-sm leading-relaxed">
                    {businessData.description}
                  </p>
                </div>
              </div>

              {/* Business Type */}
              <div>
                <label className="text-sm font-medium text-gray-700">Business Type</label>
                <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{businessData.businessType}</p>
                </div>
              </div>

              {/* Business Address */}
              {businessData.businessType === "Physical Location" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Business Address
                  </label>
                  <div className="mt-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-900">{businessData.address.street}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {businessData.address.city}, {businessData.address.province}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION B - Profile Completion */}
          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00BF63]" />
                Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Services Description
                </label>
                <div className="mt-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900 text-sm leading-relaxed">
                    {servicesData.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Working Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00BF63]" />
                Working Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(workingHours).map(([day, data]) => (
                  <div
                    key={day}
                    className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </span>
                    <span
                      className={`text-sm ${
                        data.open ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {data.hours}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#00BF63]" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{contactInfo.phone}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{contactInfo.email}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Website <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <a
                    href={contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00BF63] hover:underline flex items-center gap-1"
                  >
                    {contactInfo.website}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Presence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#00BF63]" />
                Social Media Presence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialMedia.facebook && (
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Facebook className="w-4 h-4" />
                    Facebook
                  </label>
                  <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <a
                      href={socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00BF63] hover:underline flex items-center gap-1"
                    >
                      {socialMedia.facebook}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
              {socialMedia.instagram && (
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Instagram
                  </label>
                  <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <a
                      href={socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00BF63] hover:underline flex items-center gap-1"
                    >
                      {socialMedia.instagram}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
              {socialMedia.twitter && (
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Twitter className="w-4 h-4" />
                    Twitter/X
                  </label>
                  <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <a
                      href={socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00BF63] hover:underline flex items-center gap-1"
                    >
                      {socialMedia.twitter}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
              {socialMedia.linkedin ? (
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </label>
                  <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <a
                      href={socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#00BF63] hover:underline flex items-center gap-1"
                    >
                      {socialMedia.linkedin}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn <span className="text-gray-400">(Optional)</span>
                  </label>
                  <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500 italic">Not provided</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Permit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00BF63]" />
                Business Permit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {businessPermit.fileName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Uploaded on{" "}
                        {new Date(businessPermit.uploadedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() =>
                        notifyBackendRequired(
                          "Previewing provider documents",
                          "GET /v1/admin/provider-applications/:id/documents/:documentId",
                        )
                      }
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() =>
                        notifyBackendRequired(
                          "Downloading provider documents",
                          "GET /v1/admin/provider-applications/:id/documents/:documentId/download",
                        )
                      }
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION C - Contact Person (Company Representative) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#00BF63]" />
                Contact Person (Company Representative)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Contact Person Full Name
                </label>
                <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{contactPerson.fullName}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Contact Person Role/Position
                </label>
                <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{contactPerson.role}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Contact Person Phone Number
                </label>
                <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{contactPerson.phone}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Contact Person Email Address
                </label>
                <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-900">{contactPerson.email}</p>
                </div>
              </div>

              {/* Valid ID */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Valid ID of Contact Person
                </label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IdCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {contactPerson.idFileName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {contactPerson.idType} • ID: {contactPerson.idNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                          notifyBackendRequired(
                            "Previewing provider documents",
                            "GET /v1/admin/provider-applications/:id/documents/:documentId",
                          )
                        }
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                          notifyBackendRequired(
                            "Downloading provider documents",
                            "GET /v1/admin/provider-applications/:id/documents/:documentId/download",
                          )
                        }
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  {/* ID Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">ID Type</label>
                      <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900 text-sm">{contactPerson.idType}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        ID Number <span className="text-gray-400">(Optional)</span>
                      </label>
                      <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900 text-sm font-mono">
                          {contactPerson.idNumber}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Expiry Date <span className="text-gray-400">(Optional)</span>
                      </label>
                      <div className="mt-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900 text-sm">
                          {new Date(contactPerson.idExpiry).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Review Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Verification Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#00BF63]" />
                Verification Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">
                Mark items as verified during your review
              </p>
              
              {/* Business Permit */}
              <div
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleChecklistItem("businessPermit")}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    checklist.businessPermit
                      ? "bg-[#00BF63] border-[#00BF63]"
                      : "border-gray-300"
                  }`}
                >
                  {checklist.businessPermit && (
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Business Permit
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Uploaded and verified
                  </p>
                </div>
              </div>

              {/* Contact Person Details */}
              <div
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleChecklistItem("contactPersonDetails")}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    checklist.contactPersonDetails
                      ? "bg-[#00BF63] border-[#00BF63]"
                      : "border-gray-300"
                  }`}
                >
                  {checklist.contactPersonDetails && (
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Contact Person Details
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Name, phone, email complete
                  </p>
                </div>
              </div>

              {/* Valid ID of Contact Person */}
              <div
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleChecklistItem("validIdOfContactPerson")}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    checklist.validIdOfContactPerson
                      ? "bg-[#00BF63] border-[#00BF63]"
                      : "border-gray-300"
                  }`}
                >
                  {checklist.validIdOfContactPerson && (
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Valid ID of Contact Person
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Uploaded and verified
                  </p>
                </div>
              </div>

              {/* Business Address (conditional - Physical Location) */}
              {businessData.businessType === "Physical Location" && (
                <div
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleChecklistItem("businessAddress")}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      checklist.businessAddress
                        ? "bg-[#00BF63] border-[#00BF63]"
                        : "border-gray-300"
                    }`}
                  >
                    {checklist.businessAddress && (
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Business Address
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Physical location verified
                    </p>
                  </div>
                </div>
              )}

              {/* Online Presence (conditional - Online Business) */}
              {businessData.businessType === "Online Business" && (
                <div
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleChecklistItem("onlinePresence")}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      checklist.onlinePresence
                        ? "bg-[#00BF63] border-[#00BF63]"
                        : "border-gray-300"
                    }`}
                  >
                    {checklist.onlinePresence && (
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Online Presence Details
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Website/social media verified
                    </p>
                  </div>
                </div>
              )}

              {/* Progress Indicator */}
              <div className="pt-4 border-t mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Progress
                  </span>
                  <span className="text-sm font-medium text-[#00BF63]">
                    {Object.values(checklist).filter(Boolean).length} /{" "}
                    {businessData.businessType === "Physical Location" ? 4 : businessData.businessType === "Online Business" ? 4 : 3}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#00BF63] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (Object.values(checklist).filter(Boolean).length /
                          (businessData.businessType === "Physical Location" ? 4 : businessData.businessType === "Online Business" ? 4 : 3)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card className="lg:sticky lg:top-6">
            <CardHeader>
              <CardTitle className="text-lg">Internal Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Textarea
                  placeholder="Add a note about this application..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
                  onClick={handleAddNote}
                  className="mt-2 w-full bg-[#00BF63] hover:bg-[#00A854]"
                  disabled={!internalNotes.trim()}
                >
                  Save Note
                </Button>
              </div>

              {/* Notes Timeline */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="text-xs font-medium text-gray-900">{note.author}</p>
                      <p className="text-xs text-gray-500">{note.timestamp}</p>
                    </div>
                    <p className="text-sm text-gray-700">{note.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this application? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={decisionReason} onValueChange={setDecisionReason}>
              <SelectTrigger className={`mt-1 ${showRejectValidation && !decisionReason ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incomplete-documents">
                  Incomplete Documents
                </SelectItem>
                <SelectItem value="invalid-permit">Invalid Business Permit</SelectItem>
                <SelectItem value="invalid-id">Invalid ID</SelectItem>
                <SelectItem value="incorrect-information">
                  Incorrect Information
                </SelectItem>
                <SelectItem value="duplicate-application">
                  Duplicate Application
                </SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {showRejectValidation && !decisionReason && (
              <p className="text-sm text-red-600 mt-1">Reason is required for rejection</p>
            )}
            <Textarea
              placeholder="Additional comments about the decision..."
              value={decisionComment}
              onChange={(e) => setDecisionComment(e.target.value)}
              className={`mt-1 min-h-[100px] ${showRejectValidation && !decisionComment.trim() ? 'border-red-500' : ''}`}
            />
            {showRejectValidation && !decisionComment.trim() && (
              <p className="text-sm text-red-600 mt-1">Comment is required for rejection</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="bg-gray-50 text-gray-900 hover:bg-gray-100"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-500 text-white hover:bg-red-600"
              onClick={handleRejectConfirm}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
