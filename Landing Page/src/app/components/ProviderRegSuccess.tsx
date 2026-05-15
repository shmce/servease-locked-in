import Link from "next/link";
import { CheckCircle, Home, Clock } from "lucide-react";

export function ProviderRegSuccess() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="w-24 h-24 bg-[#00BF63] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-white" size={56} />
          </div>

          {/* Success Message */}
          <h1 className="font-['Poppins',sans-serif] text-3xl md:text-4xl text-gray-900 mb-4">
            Registration Submitted Successfully!
          </h1>
          <p className="font-['Poppins',sans-serif] text-base md:text-lg text-gray-600 leading-relaxed mb-8 max-w-xl mx-auto">
            Thank you for applying to join ServEase as a service worker. Your application has been submitted and is currently under review.
          </p>

          {/* Account Details */}
          <div className="bg-[#00BF63]/5 border border-[#00BF63]/20 rounded-xl p-6 mb-8">
            <h3 className="font-['Poppins',sans-serif] text-sm text-gray-700 font-semibold mb-3">
              Account Information
            </h3>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="font-['Poppins',sans-serif] text-sm text-gray-600">Account Type:</span>
                <span className="font-['Poppins',sans-serif] text-sm text-gray-900 font-semibold">Service Worker</span>
              </div>
              <div className="flex justify-between">
                <span className="font-['Poppins',sans-serif] text-sm text-gray-600">Status:</span>
                <span className="font-['Poppins',sans-serif] text-sm text-orange-600 font-semibold flex items-center gap-1 justify-end">
                  <Clock size={14} />
                  Pending (Under Screening)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-['Poppins',sans-serif] text-sm text-gray-600">Registration Date:</span>
                <span className="font-['Poppins',sans-serif] text-sm text-gray-900 font-semibold">March 8, 2026</span>
              </div>
            </div>
          </div>

          {/* What's Next Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900 font-semibold mb-4 text-center">
              What Happens Next?
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#00BF63] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <p className="font-['Poppins',sans-serif] text-sm text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">Application Review:</strong> Our team will review your submitted documents and information.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#00BF63] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <p className="font-['Poppins',sans-serif] text-sm text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">Email Notification:</strong> You will receive an email notification once your application is approved.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#00BF63] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <p className="font-['Poppins',sans-serif] text-sm text-gray-700 leading-relaxed">
                  <strong className="text-gray-900\">Start Working:</strong> Once approved, you can start accepting bookings and offering your services.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/application-approved"
              className="inline-flex items-center justify-center gap-2 bg-[#00BF63] hover:bg-[#00a855] text-white font-['Poppins',sans-serif] font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              <Clock size={20} />
              View Approval Status
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-['Poppins',sans-serif] font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              <Home size={20} />
              Return Home
            </Link>
          </div>

          {/* Support Note */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
              Have questions about your application?{" "}
              <Link href="/contact" className="text-[#00BF63] hover:underline font-semibold">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
