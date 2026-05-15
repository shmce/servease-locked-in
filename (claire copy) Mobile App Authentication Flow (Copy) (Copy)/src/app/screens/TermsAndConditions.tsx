import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By downloading, accessing, or using ServEase, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the app.",
  },
  {
    title: "2. About ServEase",
    body: "ServEase is a Philippine-based service marketplace that connects customers with independent service workers across the following categories:",
    list: [
      "Home Maintenance and Repair",
      "Beauty, Wellness & Personal Care",
      "Education & Professional Services",
      "Domestic & Cleaning Services",
      "Pet Services",
      "Events & Entertainment",
      "Automotive & Tech Support",
    ],
  },
  {
    title: "3. User Accounts",
    list: [
      "You must provide accurate and complete information during registration.",
      "You are responsible for maintaining the confidentiality of your account credentials.",
      "You must be at least 18 years old to use ServEase.",
      "ServEase reserves the right to suspend or terminate accounts that violate these terms.",
    ],
  },
  {
    title: "4. Service Workers",
    list: [
      "Service workers are independent contractors, not employees of ServEase.",
      "ServEase does not guarantee the quality, safety, or legality of services offered.",
      "Workers must complete identity verification before being approved on the platform.",
      "ServEase reserves the right to remove any worker who violates platform policies.",
    ],
  },
  {
    title: "5. Bookings & Payments",
    list: [
      "Customers agree to pay the agreed service fee upon booking confirmation.",
      "Additional transportation fees may apply if the service location is beyond the worker's set service radius.",
      "Cancellations must be made within the allowed cancellation window as stated at the time of booking.",
    ],
  },
  {
    title: "6. Transportation Fee Policy",
    body: "If a customer's location is beyond the service worker's maximum service radius, an additional transportation fee will be calculated and added to the total booking cost. This fee will be clearly shown before booking confirmation.",
  },
  {
    title: "7. Prohibited Activities",
    body: "Users must not:",
    list: [
      "Use ServEase for any illegal or unauthorized purpose",
      "Harass, abuse, or harm other users or service workers",
      "Post false, misleading, or fraudulent information",
      "Attempt to bypass or manipulate the platform's systems",
    ],
  },
  {
    title: "8. Limitation of Liability",
    body: "ServEase is not liable for any damages, losses, or disputes arising from services booked through the platform. Users engage with service workers at their own discretion.",
  },
  {
    title: "9. Changes to Terms",
    body: "ServEase reserves the right to update these Terms & Conditions at any time. Continued use of the app after changes constitutes acceptance of the new terms.",
  },
  {
    title: "10. Contact Us",
    body: "For questions or concerns, contact us at: support@servease.ph",
  },
];

export default function TermsAndConditions() {
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
          Terms &amp; Conditions
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