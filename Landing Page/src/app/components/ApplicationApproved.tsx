import Link from "next/link";
import { CheckCircle2, Home, Mail } from "lucide-react";

export function ApplicationApproved() {
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Approval Card */}
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12 text-center">
          {/* Approval Icon */}
          <div className="w-24 h-24 bg-[#00BF63] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-white" size={56} />
          </div>

          {/* Approval Message */}
          <h1 className="font-['Poppins',sans-serif] text-3xl md:text-4xl text-gray-900 mb-4">
            Application Approved! 🎉
          </h1>
          <p className="font-['Poppins',sans-serif] text-base md:text-lg text-gray-600 leading-relaxed mb-8 max-w-xl mx-auto">
            Congratulations! Your application has been approved by our admin team. You are now an official ServEase service worker and can start accepting bookings.
          </p>

          {/* Account Status Details */}
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
                <span className="font-['Poppins',sans-serif] text-sm text-[#00BF63] font-semibold flex items-center gap-1 justify-end">
                  <CheckCircle2 size={14} />
                  Approved - Active
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-['Poppins',sans-serif] text-sm text-gray-600">Registration Date:</span>
                <span className="font-['Poppins',sans-serif] text-sm text-gray-900 font-semibold">March 8, 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="font-['Poppins',sans-serif] text-sm text-gray-600">Approval Date:</span>
                <span className="font-['Poppins',sans-serif] text-sm text-gray-900 font-semibold">March 8, 2026</span>
              </div>
            </div>
          </div>

          {/* Notification Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 flex items-start gap-3 text-left">
            <Mail className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-['Poppins',sans-serif] text-sm text-blue-900 font-semibold mb-1">
                Email Confirmation Sent
              </h4>
              <p className="font-['Poppins',sans-serif] text-xs text-blue-700 leading-relaxed">
                We've sent a confirmation email with your account details and next steps. Please check your inbox.
              </p>
            </div>
          </div>

          {/* What's Next Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="font-['Poppins',sans-serif] text-xl text-gray-900 font-semibold mb-4 text-center">
              What's Next?
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#00BF63] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <p className="font-['Poppins',sans-serif] text-sm text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">Complete Your Profile:</strong> Add your profile photo, detailed service descriptions, and pricing information.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#00BF63] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <p className="font-['Poppins',sans-serif] text-sm text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">Set Your Availability:</strong> Configure your working hours, service areas, and calendar.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#00BF63] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <p className="font-['Poppins',sans-serif] text-sm text-gray-700 leading-relaxed">
                  <strong className="text-gray-900">Start Accepting Bookings:</strong> Customers can now find and book your services through the ServEase app.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-[#00BF63] hover:bg-[#00a855] text-white font-['Poppins',sans-serif] font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              <Home size={20} />
              Return Home
            </Link>
          </div>

          {/* Support Note */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="font-['Poppins',sans-serif] text-sm text-gray-600">
              Need help getting started?{" "}
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
