import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Star,
  MapPin,
  Mail,
  User,
  Building2,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import type { ServiceProvider, ProviderStatus } from "../../types";

interface ProviderDetailsDrawerProps {
  provider: ServiceProvider | null;
  isOpen: boolean;
  onClose: () => void;
  categoryName: string;
  onToggleStatus: (providerId: string, newStatus: ProviderStatus) => void;
}

const providerMapPoints = [
  { key: "makati", left: "55%", top: "58%" },
  { key: "quezon", left: "72%", top: "22%" },
  { key: "taguig", left: "76%", top: "64%" },
  { key: "pasig", left: "82%", top: "48%" },
  { key: "manila", left: "30%", top: "52%" },
  { key: "pasay", left: "35%", top: "72%" },
  { key: "mandaluyong", left: "62%", top: "48%" },
  { key: "paranaque", left: "45%", top: "82%" },
  { key: "malabon", left: "38%", top: "18%" },
  { key: "valenzuela", left: "52%", top: "10%" },
];

function getProviderMapPoint(location: string) {
  const normalizedLocation = location.toLowerCase();

  return (
    providerMapPoints.find((point) => normalizedLocation.includes(point.key)) ?? {
      left: "50%",
      top: "50%",
    }
  );
}

export function ProviderDetailsDrawer({
  provider,
  isOpen,
  onClose,
  categoryName,
  onToggleStatus,
}: ProviderDetailsDrawerProps) {
  if (!provider) return null;

  const getStatusBadge = (status: ProviderStatus) => {
    switch (status) {
      case "Active":
        return (
          <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "Inactive":
        return (
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      case "Suspended":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        );
    }
  };

  const getCompletionRateBadge = (rate: number) => {
    if (rate >= 95) {
      return (
        <Badge className="bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]">
          {rate}%
        </Badge>
      );
    } else if (rate >= 90) {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          {rate}%
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">{rate}%</Badge>
      );
    }
  };

  const handleToggleStatus = () => {
    const newStatus: ProviderStatus = provider.status === "Active" ? "Suspended" : "Active";
    onToggleStatus(provider.id, newStatus);
  };
  const providerMapPoint = getProviderMapPoint(provider.location);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto p-0">
        <div className="p-6">
          <SheetHeader className="border-b pb-4 mb-6">
            <SheetTitle className="text-2xl">Service Provider Details</SheetTitle>
            <SheetDescription>
              Complete information about this service provider
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 pb-6">
            {/* Section 1: Provider Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00BF63]" />
                Provider Information
              </h3>
              <div className="space-y-3 pl-6">
                <div>
                  <p className="text-sm text-gray-500">Business Name</p>
                  <p className="font-semibold text-gray-900 mt-1">
                    {provider.businessName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Provider ID</p>
                  <p className="font-mono font-semibold text-[#00BF63] mt-1">
                    {provider.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium text-gray-900 mt-1">{categoryName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(provider.status)}</div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.floor(provider.rating)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900">
                      {provider.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-gray-900 mt-1">
                    {new Date(provider.joinedDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 2: Contact Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-[#00BF63]" />
                Contact Details
              </h3>
              <div className="space-y-3 pl-6">
                <div>
                  <p className="text-sm text-gray-500">Contact Person</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {provider.contactPerson}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a
                      href={`mailto:${provider.email}`}
                      className="text-[#00BF63] hover:underline"
                    >
                      {provider.email}
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="text-gray-900 mt-1">{provider.phone}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 3: Location */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00BF63]" />
                Location
              </h3>
              <div className="space-y-3 pl-6">
                <div>
                  <p className="text-sm text-gray-500">Service Area</p>
                  <p className="text-gray-900 mt-1">{provider.location}</p>
                </div>
                <div className="relative h-44 overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-sky-50 via-emerald-50 to-slate-100">
                  <div className="absolute inset-x-0 top-1/3 h-px bg-white/80" />
                  <div className="absolute inset-x-0 top-2/3 h-px bg-white/80" />
                  <div className="absolute inset-y-0 left-1/3 w-px bg-white/80" />
                  <div className="absolute inset-y-0 left-2/3 w-px bg-white/80" />
                  <div
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={providerMapPoint}
                  >
                    <div className="relative">
                      <div className="absolute inset-0 h-12 w-12 -translate-x-3 -translate-y-3 rounded-full bg-[#00BF63]/15" />
                      <div className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#00BF63] shadow-md">
                        <MapPin className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 rounded-md bg-white/90 px-3 py-2 shadow-sm">
                    <p className="text-xs font-medium text-gray-900">
                      Approximate service area
                    </p>
                    <p className="text-xs text-gray-500">{provider.location}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 4: Performance Metrics */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00BF63]" />
                Performance Metrics
              </h3>
              <div className="space-y-3 pl-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium">
                      Total Bookings
                    </p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {provider.totalBookings}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <p className="text-xs text-green-600 font-medium">
                      Completed
                    </p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {provider.completedBookings}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completion Rate</p>
                  <div className="mt-1">
                    {getCompletionRateBadge(provider.completionRate)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Average Rating</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-gray-900">
                      {provider.rating.toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    ₱{provider.totalRevenue.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Earnings</p>
                  <p className="text-lg font-semibold text-[#00BF63] mt-1">
                    ₱{provider.totalEarnings.toLocaleString("en-PH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Section 5: Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Actions</h3>
              <div className="space-y-2">
                <Button
                  onClick={handleToggleStatus}
                  variant={provider.status === "Active" ? "destructive" : "default"}
                  className={
                    provider.status === "Active"
                      ? ""
                      : "bg-[#00BF63] hover:bg-[#00A855] text-white"
                  }
                >
                  {provider.status === "Active" ? (
                    <>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Suspend Provider
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Activate Provider
                    </>
                  )}
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View Reviews & Ratings
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
