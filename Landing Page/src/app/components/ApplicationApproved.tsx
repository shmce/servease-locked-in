"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Home,
  Loader2,
  LogIn,
  XCircle,
} from "lucide-react";
import { createSupabaseBrowserClient } from "../lib/supabase-browser";
import {
  getProviderApplicationStatus,
  type ProviderApplicationStatus,
} from "../lib/provider-application-status";

type LoadState = "loading" | "ready" | "signed-out" | "error";

export function ApplicationApproved() {
  const [status, setStatus] = useState<ProviderApplicationStatus | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        const accessToken = data.session?.access_token;

        if (!accessToken) {
          if (isMounted) {
            setLoadState("signed-out");
          }
          return;
        }

        const application = await getProviderApplicationStatus(accessToken);

        if (isMounted) {
          setStatus(application);
          setLoadState("ready");
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load provider application status.",
          );
          setLoadState("error");
        }
      }
    }

    void loadStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const statusView = useMemo(() => {
    if (!status) {
      return null;
    }

    switch (status.verificationStatus) {
      case "approved":
        return {
          icon: <CheckCircle2 className="text-white" size={56} />,
          iconBackground: "bg-[#00BF63]",
          title: "Application Approved",
          description:
            "Your provider account has been approved. You can now complete your provider profile and start accepting bookings.",
          statusLabel: "Approved - Active",
          statusClass: "text-[#00BF63]",
          statusIcon: <CheckCircle2 size={14} />,
          noticeClass: "bg-[#00BF63]/5 border-[#00BF63]/20 text-[#065F46]",
          noticeTitle: "Approval Complete",
        };
      case "rejected":
        return {
          icon: <XCircle className="text-white" size={56} />,
          iconBackground: "bg-red-600",
          title: "Application Needs Review",
          description:
            "Your application was not approved in its current form. Review the admin note below and contact support for the next step.",
          statusLabel: "Rejected",
          statusClass: "text-red-600",
          statusIcon: <XCircle size={14} />,
          noticeClass: "bg-red-50 border-red-200 text-red-800",
          noticeTitle: "Admin Decision",
        };
      case "pending":
      default:
        return {
          icon: <Clock className="text-white" size={56} />,
          iconBackground: "bg-amber-500",
          title: "Application Under Review",
          description:
            "Your application is in the admin review queue. This page will update when the review status changes.",
          statusLabel: "Pending Review",
          statusClass: "text-amber-600",
          statusIcon: <Clock size={14} />,
          noticeClass: "bg-amber-50 border-amber-200 text-amber-800",
          noticeTitle: status.latestDecisionReason
            ? "More Information Requested"
            : "Review In Progress",
        };
    }
  }, [status]);

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12 text-center">
          {loadState === "loading" && (
            <StatusPlaceholder
              icon={<Loader2 className="text-white animate-spin" size={48} />}
              title="Loading Application Status"
              description="Checking the latest provider application record from ServEase."
            />
          )}

          {loadState === "signed-out" && (
            <StatusPlaceholder
              icon={<LogIn className="text-white" size={48} />}
              title="Sign In Required"
              description="Sign in with the provider account you used during registration to view the latest application status."
            />
          )}

          {loadState === "error" && (
            <StatusPlaceholder
              icon={<AlertCircle className="text-white" size={48} />}
              title="Status Unavailable"
              description={
                errorMessage ?? "Could not load provider application status."
              }
              tone="error"
            />
          )}

          {loadState === "ready" && status && statusView && (
            <>
              <div
                className={`w-24 h-24 ${statusView.iconBackground} rounded-full flex items-center justify-center mx-auto mb-6`}
              >
                {statusView.icon}
              </div>

              <h1 className="font-['Poppins',sans-serif] text-3xl md:text-4xl text-gray-900 mb-4">
                {statusView.title}
              </h1>
              <p className="font-['Poppins',sans-serif] text-base md:text-lg text-gray-600 leading-relaxed mb-8 max-w-xl mx-auto">
                {statusView.description}
              </p>

              <div className="bg-[#00BF63]/5 border border-[#00BF63]/20 rounded-xl p-6 mb-8">
                <h3 className="font-['Poppins',sans-serif] text-sm text-gray-700 font-semibold mb-3">
                  Application Information
                </h3>
                <div className="space-y-2 text-left">
                  <InfoRow label="Reference" value={status.applicationReference} />
                  <InfoRow
                    label="Business"
                    value={status.businessName ?? "Provider application"}
                  />
                  <InfoRow
                    label="Service Area"
                    value={status.serviceArea ?? "Not provided"}
                  />
                  <div className="flex justify-between gap-4">
                    <span className="font-['Poppins',sans-serif] text-sm text-gray-600">
                      Status:
                    </span>
                    <span
                      className={`font-['Poppins',sans-serif] text-sm font-semibold flex items-center gap-1 justify-end ${statusView.statusClass}`}
                    >
                      {statusView.statusIcon}
                      {statusView.statusLabel}
                    </span>
                  </div>
                  <InfoRow
                    label="Submitted"
                    value={formatDate(status.createdAt)}
                  />
                  <InfoRow
                    label="Last Updated"
                    value={formatDate(status.updatedAt)}
                  />
                </div>
              </div>

              <div
                className={`border rounded-xl p-5 mb-8 text-left ${statusView.noticeClass}`}
              >
                <h4 className="font-['Poppins',sans-serif] text-sm font-semibold mb-1">
                  {statusView.noticeTitle}
                </h4>
                <p className="font-['Poppins',sans-serif] text-xs leading-relaxed">
                  {status.latestDecisionReason ??
                    "No admin note has been added yet."}
                </p>
              </div>
            </>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {loadState === "signed-out" && (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-[#00BF63] hover:bg-[#00a855] text-white font-['Poppins',sans-serif] font-semibold px-8 py-3 rounded-lg transition-colors"
              >
                <LogIn size={20} />
                Sign In
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-['Poppins',sans-serif] font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              <Home size={20} />
              Return Home
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
              Need help with your application?{" "}
              <Link
                href="/contact"
                className="text-[#00BF63] hover:underline font-semibold"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPlaceholder({
  icon,
  title,
  description,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone?: "neutral" | "error";
}) {
  return (
    <>
      <div
        className={`w-24 h-24 ${
          tone === "error" ? "bg-red-600" : "bg-[#00BF63]"
        } rounded-full flex items-center justify-center mx-auto mb-6`}
      >
        {icon}
      </div>
      <h1 className="font-['Poppins',sans-serif] text-3xl md:text-4xl text-gray-900 mb-4">
        {title}
      </h1>
      <p className="font-['Poppins',sans-serif] text-base md:text-lg text-gray-600 leading-relaxed mb-8 max-w-xl mx-auto">
        {description}
      </p>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="font-['Poppins',sans-serif] text-sm text-gray-600">
        {label}:
      </span>
      <span className="font-['Poppins',sans-serif] text-sm text-gray-900 font-semibold text-right">
        {value}
      </span>
    </div>
  );
}

function formatDate(value: string | null): string {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
