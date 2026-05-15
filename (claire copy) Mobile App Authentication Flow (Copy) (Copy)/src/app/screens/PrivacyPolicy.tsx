import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

const sections = [
  {
    title: "1. Introduction",
    body: 'ServEase ("we", "our", "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our app.',
  },
  {
    title: "2. Information We Collect",
    body: "We collect the following information during registration and use:",
    list: [
      "Full name, email address, contact number",
      "Address and location data (city, province)",
      "Government-issued ID (for service workers only)",
      "Booking history and transaction records",
      "Device information and usage data",
    ],
  },
  {
    title: "3. How We Use Your Information",
    body: "We use your information to:",
    list: [
      "Create and manage your account",
      "Match customers with nearby service workers",
      "Process bookings and calculate transportation fees",
      "Send notifications about bookings and account updates",
      "Improve the ServEase platform and user experience",
      "Comply with legal obligations",
    ],
  },
  {
    title: "4. Location Data",
    body: "ServEase collects location information to:",
    list: [
      "Show customers nearby available service workers",
      "Calculate distance and transportation fees",
      "Define service worker coverage areas",
    ],
    footer:
      "Location data is only collected with your permission and is not sold to third parties.",
  },
  {
    title: "5. Data Sharing",
    body: "We do not sell your personal data. We may share information with:",
    list: [
      "Service workers (only name and contact details relevant to a confirmed booking)",
      "Payment processors for transaction handling",
      "Legal authorities when required by Philippine law",
    ],
  },
  {
    title: "6. Data Security",
    body: "We implement appropriate technical and security measures to protect your personal information from unauthorized access, disclosure, or misuse.",
  },
  {
    title: "7. Data Retention",
    body: "Your data is retained for as long as your account is active. You may request account deletion by contacting support@servease.ph. Some data may be retained for legal compliance purposes.",
  },
  {
    title: "8. Your Rights",
    body: "Under the Philippine Data Privacy Act of 2012 (RA 10173), you have the right to:",
    list: [
      "Access your personal data",
      "Correct inaccurate information",
      "Request deletion of your data",
      "Withdraw consent at any time",
    ],
  },
  {
    title: "9. Cookies & Analytics",
    body: "ServEase may use analytics tools to monitor app performance and usage patterns. No personally identifiable information is shared through analytics.",
  },
  {
    title: "10. Changes to This Policy",
    body: "We may update this Privacy Policy periodically. We will notify you of significant changes via email or in-app notification.",
  },
  {
    title: "11. Contact Us",
    body: "For privacy concerns or data requests, contact our Data Privacy Officer at: privacy@servease.ph",
  },
];

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="bg-white w-full h-screen flex flex-col overflow-hidden">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Fixed Header */}
      <div className="px-[16px] py-[12px] flex items-center bg-white flex-shrink-0 border-b border-[#F3F4F6] relative">
        <button
          onClick={() => navigate("/auth-gate")}
          className="w-[44px] h-[44px] flex items-center justify-center transition-all active:scale-90 z-20 -ml-[4px]"
        >
          <ArrowLeft className="w-[24px] h-[24px] text-[#1a1a1a]" />
        </button>
        <h2 className="absolute left-0 right-0 font-['Nunito',sans-serif] text-[18px] text-[#111827] text-center pointer-events-none">
          Privacy Policy
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[16px] pb-[32px]">
          <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF] mt-[12px] mb-[20px]">
            Last updated: March 2026
          </p>

          {sections.map((section, index) => (
            <div key={index}>
              <div className="py-[14px]">
                <h3 className="font-['Nunito',sans-serif] text-[15px] text-[#111827] mb-[8px]">
                  {section.title}
                </h3>
                {section.body && (
                  <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.7]">
                    {section.body}
                  </p>
                )}
                {section.list && (
                  <ul className="mt-[8px] space-y-[6px] pl-[16px]">
                    {section.list.map((item, i) => (
                      <li
                        key={i}
                        className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.7] list-disc"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {section.footer && (
                  <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.7] mt-[8px]">
                    {section.footer}
                  </p>
                )}
              </div>
              {index < sections.length - 1 && (
                <div className="h-[1px] bg-[#F3F4F6]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}