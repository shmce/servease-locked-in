import { X } from "lucide-react";

interface TermsConditionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsConditions({ isOpen, onClose }: TermsConditionsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="bg-[#00BF63] text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Terms &amp; Conditions
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">1. Acceptance of Terms</h3>
              <p>
                By accessing and using ServEase, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">2. Service Provider Registration</h3>
              <p>
                As a Service Worker on ServEase, you agree to:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Update your profile information to ensure accuracy</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Deliver services professionally and on time</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">3. Service Standards</h3>
              <p>
                Service Workers must:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Maintain professional conduct with all customers</li>
                <li>Provide services that meet or exceed customer expectations</li>
                <li>Be available within your specified service radius</li>
                <li>Respond to customer inquiries in a timely manner</li>
                <li>Complete all accepted service requests to the best of your ability</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">4. Verification and Background Checks</h3>
              <p>
                ServEase reserves the right to verify the identity and qualifications of all Service Workers. You agree to:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Provide valid identification documents</li>
                <li>Submit proof of skills, certifications, or experience as required</li>
                <li>Consent to background verification processes</li>
                <li>Keep all documents current and valid</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">5. Payment and Fees</h3>
              <p>
                ServEase may charge service fees or commissions on transactions completed through the platform. Payment terms include:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Service fees will be clearly disclosed before booking confirmation</li>
                <li>Payments are processed through secure payment gateways</li>
                <li>Refund policies apply as per our refund terms</li>
                <li>Service Workers will receive payment within the specified timeframe</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">6. Cancellation and Disputes</h3>
              <p>
                In case of service cancellations or disputes:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Service Workers should provide reasonable notice for cancellations</li>
                <li>Customers may file complaints through our dispute resolution system</li>
                <li>ServEase may mediate disputes between customers and Service Workers</li>
                <li>Repeated violations may result in account suspension or termination</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">7. Liability and Indemnification</h3>
              <p>
                Service Workers agree to indemnify and hold ServEase harmless from any claims, damages, or expenses arising from their services or conduct on the platform.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">8. Account Termination</h3>
              <p>
                ServEase reserves the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or fail to maintain service standards.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">9. Changes to Terms</h3>
              <p>
                ServEase may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated terms.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">10. Contact Information</h3>
              <p>
                For questions about these terms, please contact us at:
              </p>
              <p className="mt-2">
                Email: support@servease.com<br />
                Phone: +63 123 456 7890
              </p>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg mt-6">
              <p className="text-xs text-gray-600">
                Last Updated: March 9, 2026<br />
                Version 1.0
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-[#00BF63] hover:bg-[#00a855] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
