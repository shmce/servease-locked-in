import { X } from "lucide-react";

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="bg-[#00BF63] text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            Privacy Policy
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
              <h3 className="font-semibold text-base text-gray-900 mb-2">1. Introduction</h3>
              <p>
                ServEase is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service marketplace platform.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">2. Information We Collect</h3>
              <p className="mb-2">We collect the following types of information:</p>
              
              <h4 className="font-semibold text-sm text-gray-900 mt-3 mb-1">Personal Information:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Full name and email address</li>
                <li>Contact number and address</li>
                <li>Government-issued identification documents</li>
                <li>Profile photos and selfies</li>
                <li>Professional certifications and proof of skills</li>
              </ul>

              <h4 className="font-semibold text-sm text-gray-900 mt-3 mb-1">Service Information:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Service categories and specializations</li>
                <li>Experience level and work history</li>
                <li>Service area and radius preferences</li>
                <li>Pricing and availability information</li>
              </ul>

              <h4 className="font-semibold text-sm text-gray-900 mt-3 mb-1">Usage Information:</h4>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Device information and IP address</li>
                <li>Browser type and operating system</li>
                <li>Pages visited and time spent on the platform</li>
                <li>Search queries and preferences</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">3. How We Use Your Information</h3>
              <p className="mb-2">We use your information to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Create and manage your Service Worker account</li>
                <li>Verify your identity and qualifications</li>
                <li>Match you with potential customers</li>
                <li>Process payments and transactions</li>
                <li>Communicate important updates and notifications</li>
                <li>Improve our platform and services</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">4. Information Sharing and Disclosure</h3>
              <p className="mb-2">We may share your information with:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Customers:</strong> Basic profile information visible to customers seeking services</li>
                <li><strong>Service Providers:</strong> Third-party services for payment processing and identity verification</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
              </ul>
              <p className="mt-2">
                We do not sell your personal information to third parties.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">5. Data Security</h3>
              <p>
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication mechanisms</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and monitoring</li>
                <li>Secure data storage facilities</li>
              </ul>
              <p className="mt-2">
                However, no method of transmission over the internet is 100% secure.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">6. Your Rights and Choices</h3>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">7. Data Retention</h3>
              <p>
                We retain your information for as long as your account is active or as needed to provide services.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">8. Children&apos;s Privacy</h3>
              <p>
                ServEase is not intended for users under the age of 18. We do not knowingly collect personal information from children.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">9. Changes to This Privacy Policy</h3>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through the platform.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-base text-gray-900 mb-2">10. Contact Us</h3>
              <p>
                For questions or concerns about this Privacy Policy, please contact us:
              </p>
              <p className="mt-2">
                Email: privacy@servease.com<br />
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
