import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { BackButton } from "../components/BackButton";
import {
  Clock,
  Wallet,
  Zap,
  ShieldCheck,
  FileText,
  Lock,
  ArrowRight,
  Users,
  Star,
  TrendingUp,
  Wrench,
  Sparkles,
  Flower2,
  Briefcase,
  PawPrint,
  PartyPopper,
  Car,
  Truck,
  Banknote,
  X,
  ChevronRight,
} from "lucide-react";

// ─── Benefits Data ─────────────────────────────────────────────
const benefits = [
  {
    icon: Clock,
    title: "Flexible Hours",
    desc: "Choose when you want to work.",
  },
  {
    icon: Wallet,
    title: "Direct Payments",
    desc: "Keep 100% of your agreed service fee.",
  },
  {
    icon: Zap,
    title: "Simple Setup",
    desc: "No business registration needed to start.",
  },
  {
    icon: ShieldCheck,
    title: "Safety First",
    desc: "Verified customers only.",
  },
];

// ─── Service Categories (T&C Section 2) ────────────────────────
const serviceCategories = [
  {
    icon: Wrench,
    label: "Home Maintenance & Repair",
    color: "#56C490",
  },
  {
    icon: Flower2,
    label: "Beauty, Wellness & Personal Care",
    color: "#E879A8",
  },
  {
    icon: Briefcase,
    label: "Education & Professional Services",
    color: "#6366F1",
  },
  {
    icon: Sparkles,
    label: "Domestic & Cleaning Services",
    color: "#3B82F6",
  },
  {
    icon: PawPrint,
    label: "Pet Services",
    color: "#F59E0B",
  },
  {
    icon: PartyPopper,
    label: "Events & Entertainment",
    color: "#EC4899",
  },
  {
    icon: Car,
    label: "Automotive & Tech Support",
    color: "#8B5CF6",
  },
];

// ─── Stats Data ────────────────────────────────────────────────
const stats = [
  { label: "Active Providers", value: "5,200+", icon: Users },
  { label: "Average Rating", value: "4.8★", icon: Star },
  { label: "Monthly Bookings", value: "28K+", icon: TrendingUp },
];

// ─── Hero Images ───────────────────────────────────────────────
const heroImages = [
  {
    src: "https://images.unsplash.com/photo-1709980378474-d5c30c4edbd3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xvJTIwcGx1bWJlciUyMHdvcmtpbmclMjB0b29sc3xlbnwxfHx8fDE3NzM1NjQxOTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Solo plumber working with tools",
  },
  {
    src: "https://images.unsplash.com/photo-1562322140-8baeececf3df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xvJTIwZmVtYWxlJTIwaGFpcnN0eWxpc3QlMjB3b3JraW5nJTIwc2Fsb258ZW58MXx8fHwxNzczNTY0MTk2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Solo hairstylist at work",
  },
  {
    src: "https://images.unsplash.com/photo-1662845851419-9b727124f29c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRlcGVuZGVudCUyMGhhbmR5bWFuJTIwcmVwYWlyJTIwd29ya3xlbnwxfHx8fDE3NzM1NjQxOTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    alt: "Independent handyman doing repair work",
  },
];

// ─── Terms & Conditions Full Text ──────────────────────────────
const termsContent = `SERVEASE TERMS & CONDITIONS

Last Updated: March 15, 2026

Section 1: Acceptance of Terms
By registering as a Service Provider on the ServEase platform, you agree to be bound by these Terms & Conditions. If you do not agree, you may not use the platform.

Section 2: Service Categories
ServEase connects independent Service Providers with Customers across the following categories:
• Home Maintenance & Repair (Plumbing, Electrical, Carpentry, Painting)
• Beauty, Wellness & Personal Care (Hair Styling, Makeup, Massage, Nails)
• Education & Professional Services (Academic Tutor, Language, Music Lessons)
• Domestic & Cleaning Services (House Cleaning, Laundry, Ironing, Deep Clean)
• Pet Services (Pet Grooming, Dog Walking, Pet Sitting)
• Events & Entertainment (Photography, Hosting/MC, Catering, DJ/Music)
• Automotive & Tech Support (Car Repair, Car Wash, IT/Gadget Repair)

Section 3: Eligibility
You must be at least 18 years old and legally authorized to provide services in the Philippines. You must provide valid government-issued identification during the registration process.

Section 4: Independent Contractor Status
You are an independent contractor, not an employee of ServEase. You maintain full control over your work schedule, methods, and the clients you choose to accept. ServEase does not direct or control the manner in which you perform services. You are solely responsible for your own taxes, insurance, and compliance with local regulations.

Section 5: Service Fees & Payments
You are entitled to keep 100% of the agreed-upon service fee negotiated between you and the Customer. ServEase does not deduct commissions from your service fees. Payment is processed through the platform and transferred to your registered payout method within 1–3 business days after service completion.

Section 6: Transport & Additional Fees
Additional transport fees may apply for services rendered beyond a 10-kilometer radius from your registered service area. These fees must be disclosed to and agreed upon by the Customer before the service begins. Any additional charges (e.g., materials, emergency surcharges) must be communicated and approved in advance.

Section 7: Cancellation Policy
Cancellations made within 24 hours of the scheduled service may incur a cancellation fee. Repeated no-shows or last-minute cancellations may result in account suspension.

Section 8: Code of Conduct
Providers must maintain professionalism, arrive on time, and deliver services as described. Any form of harassment, discrimination, or fraudulent behavior will result in immediate account termination.

Section 9: Dispute Resolution
Disputes between Providers and Customers will be mediated by ServEase support. Both parties agree to cooperate in good faith to resolve issues promptly.

Section 10: Termination
ServEase reserves the right to suspend or terminate your account for violation of these terms, fraudulent activity, or conduct that harms the platform's reputation.`;

const privacyContent = `SERVEASE PRIVACY POLICY

Last Updated: March 15, 2026

Section 1: Information We Collect
We collect personal information you provide during registration, including your full name, email address, phone number, government-issued ID, and service area preferences.

Section 2: How We Use Your Information
Your information is used to:
• Verify your identity and eligibility
• Connect you with nearby Customers
• Process payments and payouts
• Send service-related notifications
• Improve platform functionality and user experience

Section 3: Data Sharing
We do not sell your personal information to third parties. Your data may be shared with:
• Customers (limited to your name, rating, and service details)
• Payment processors for transaction handling
• Law enforcement when required by Philippine law

Section 4: Location Data Usage
Your location is only used to find nearby jobs and connect you with customers in your service area. Location data is never sold to third parties and is only active when you are online and available for bookings. You can disable location sharing at any time through your device settings, though this may limit your ability to receive nearby service requests.

Section 5: Data Security
We employ industry-standard encryption (256-bit SSL) and security measures to protect your personal information. Access to your data is restricted to authorized personnel only.

Section 6: Data Retention
Your data is retained for the duration of your active account and for up to 5 years after account closure for legal and regulatory compliance.

Section 7: Your Rights
Under the Philippine Data Privacy Act of 2012 (RA 10173), you have the right to:
• Access your personal data
• Correct inaccurate information
• Request deletion of your data
• Object to data processing
• File a complaint with the National Privacy Commission

Section 8: Cookies & Analytics
We use cookies and analytics tools to improve the platform experience. You can manage cookie preferences through your browser settings.

Section 9: Updates to This Policy
We may update this Privacy Policy from time to time. You will be notified of significant changes through the app or via email.

Section 10: Contact Us
For privacy-related concerns, contact our Data Protection Officer at privacy@servease.ph.`;

// ─── Component ─────────────────────────────────────────────────
export default function ProviderInfoLanding() {
  const navigate = useNavigate();
  const [activeModal, setActiveModal] = useState<"terms" | "privacy" | null>(
    null
  );

  return (
    <div className="bg-white w-full h-screen flex flex-col relative">
      {/* iOS Status Bar */}
      <div className="bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* ── Top Header ── */}
      <div className="flex items-center px-[24px] py-[10px] flex-shrink-0">
        <BackButton />
      </div>

      {/* ── Scrollable Content ── */}
      <div
        className="flex-1 overflow-y-auto pb-[110px]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* ── Hero Section ── */}
        <div className="px-[24px] pt-[4px] pb-[24px]">
          <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] tracking-[-0.5px] leading-[1.15] mb-[8px]">
            Be Your Own Boss
          </h1>
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.55]">
            Your reliable partner for every service need.
          </p>
        </div>

        {/* ── Photo Strip ── */}
        <div className="px-[24px] mb-[28px]">
          <div className="flex gap-[8px] h-[170px] rounded-[18px] overflow-hidden">
            <div className="flex-[1.4] relative rounded-[14px] overflow-hidden">
              <img
                src={heroImages[0].src}
                alt={heroImages[0].alt}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div className="flex-1 flex flex-col gap-[8px]">
              <div className="flex-1 relative rounded-[14px] overflow-hidden">
                <img
                  src={heroImages[1].src}
                  alt={heroImages[1].alt}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 relative rounded-[14px] overflow-hidden">
                <img
                  src={heroImages[2].src}
                  alt={heroImages[2].alt}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Independent Contractor Status (T&C Section 4) ── */}
        <div className="px-[24px] mb-[28px]">
          <div className="bg-[#F0FFF6] rounded-[18px] p-[20px] border border-[#D1FAE5]">
            <div className="flex items-center gap-[10px] mb-[12px]">
              <div className="w-[36px] h-[36px] rounded-[10px] bg-[#56C490] flex items-center justify-center flex-shrink-0">
                <ShieldCheck
                  className="w-[18px] h-[18px] text-white"
                  strokeWidth={2}
                />
              </div>
              <div>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                  Independent Contractor
                </p>
                <p className="font-['Nunito',sans-serif] text-[10px] text-[#047857] mt-[1px]">
                  T&C Section 4
                </p>
              </div>
            </div>
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#374151] leading-[1.6]">
              You are an independent contractor, not an employee of ServEase.
              You maintain{" "}
              <span className="font-['Nunito',sans-serif] text-[#111827]">
                full control
              </span>{" "}
              over your work schedule, methods, and the clients you choose to
              accept.
            </p>
          </div>
        </div>

        {/* ── Key Benefits Grid ── */}
        <div className="px-[24px] mb-[28px]">
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] tracking-[0.8px] mb-[12px]">
            WHY JOIN SERVEASE
          </p>
          <div className="grid grid-cols-2 gap-[10px]">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-[#F9FAFB] rounded-[16px] p-[16px] flex flex-col"
              >
                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#ECFDF5] flex items-center justify-center mb-[10px]">
                  <b.icon
                    className="w-[18px] h-[18px] text-[#56C490]"
                    strokeWidth={1.75}
                  />
                </div>
                <h3 className="font-['Nunito',sans-serif] text-[13px] text-[#111827] mb-[3px]">
                  {b.title}
                </h3>
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280] leading-[1.45]">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Service Categories (T&C Section 2) ── */}
        <div className="px-[24px] mb-[28px]">
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] tracking-[0.8px] mb-[4px]">
            SERVICE CATEGORIES
          </p>
          <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF] mb-[12px]">
            7 categories available for individuals to join (T&C Section 2)
          </p>
          <div className="space-y-[6px]">
            {serviceCategories.map((cat) => (
              <div
                key={cat.label}
                className="flex items-center gap-[12px] bg-[#F9FAFB] rounded-[12px] px-[14px] py-[12px]"
              >
                <div
                  className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${cat.color}12` }}
                >
                  <cat.icon
                    className="w-[16px] h-[16px]"
                    style={{ color: cat.color }}
                    strokeWidth={1.75}
                  />
                </div>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#111827]">
                  {cat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Earnings & Fees (T&C Section 5 & 6) ── */}
        <div className="px-[24px] mb-[28px]">
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] tracking-[0.8px] mb-[12px]">
            EARNINGS & FEES
          </p>
          <div className="space-y-[10px]">
            {/* Keep your fees */}
            <div className="bg-[#F9FAFB] rounded-[16px] p-[16px] border border-[#F3F4F6]">
              <div className="flex items-start gap-[12px]">
                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#ECFDF5] flex items-center justify-center flex-shrink-0 mt-[2px]">
                  <Banknote
                    className="w-[18px] h-[18px] text-[#56C490]"
                    strokeWidth={1.75}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-['Nunito',sans-serif] text-[13px] text-[#111827] mb-[4px]">
                    Keep Your Service Fees
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280] leading-[1.5]">
                    You keep{" "}
                    <span className="font-['Nunito',sans-serif] text-[#56C490]">
                      100%
                    </span>{" "}
                    of the agreed-upon service fee. Payment is transferred to
                    your payout method within 1–3 business days.
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[10px] text-[#9CA3AF] mt-[6px]">
                    T&C Section 5
                  </p>
                </div>
              </div>
            </div>

            {/* Transport fees */}
            <div className="bg-[#F9FAFB] rounded-[16px] p-[16px] border border-[#F3F4F6]">
              <div className="flex items-start gap-[12px]">
                <div className="w-[38px] h-[38px] rounded-[10px] bg-[#FEF3C7] flex items-center justify-center flex-shrink-0 mt-[2px]">
                  <Truck
                    className="w-[18px] h-[18px] text-[#F59E0B]"
                    strokeWidth={1.75}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-['Nunito',sans-serif] text-[13px] text-[#111827] mb-[4px]">
                    Transport Fees May Apply
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280] leading-[1.5]">
                    Additional transport fees may apply for services beyond a
                    10km radius from your registered area. These must be
                    disclosed and agreed upon by the Customer before the service
                    begins.
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[10px] text-[#9CA3AF] mt-[6px]">
                    T&C Section 6
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Community Stats ── */}
        <div className="px-[24px] mb-[28px]">
          <div className="bg-[#111827] rounded-[18px] p-[20px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[100px] h-[100px] bg-[#56C490]/10 rounded-full -translate-y-1/3 translate-x-1/3" />
            <p className="font-['Nunito',sans-serif] text-[11px] text-white/50 tracking-[0.8px] mb-[16px] relative z-10">
              JOIN A GROWING COMMUNITY
            </p>
            <div className="flex items-center justify-between relative z-10">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center flex-1"
                >
                  <s.icon
                    className="w-[16px] h-[16px] text-[#56C490] mb-[6px]"
                    strokeWidth={1.75}
                  />
                  <p className="font-['Nunito',sans-serif] text-[17px] text-white leading-[1]">
                    {s.value}
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[10px] text-white/50 mt-[4px] text-center">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Legal Links (Full Modal) ── */}
        <div className="px-[24px] mb-[28px]">
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] tracking-[0.8px] mb-[12px]">
            LEGAL
          </p>
          <div className="space-y-[10px]">
            {/* Terms Button */}
            <button
              onClick={() => setActiveModal("terms")}
              className="w-full flex items-center gap-[14px] bg-[#F9FAFB] rounded-[16px] p-[16px] border border-[#F3F4F6] transition-all active:bg-[#F3F4F6] text-left"
            >
              <div className="w-[40px] h-[40px] rounded-[12px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex items-center justify-center flex-shrink-0">
                <FileText
                  className="w-[18px] h-[18px] text-[#374151]"
                  strokeWidth={1.75}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                  View Terms & Conditions
                </p>
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF] mt-[2px]">
                  Independent contractor status, fees & policies
                </p>
              </div>
              <ChevronRight className="w-[18px] h-[18px] text-[#9CA3AF] flex-shrink-0" />
            </button>

            {/* Privacy Button */}
            <button
              onClick={() => setActiveModal("privacy")}
              className="w-full flex items-center gap-[14px] bg-[#F9FAFB] rounded-[16px] p-[16px] border border-[#F3F4F6] transition-all active:bg-[#F3F4F6] text-left"
            >
              <div className="w-[40px] h-[40px] rounded-[12px] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] flex items-center justify-center flex-shrink-0">
                <Lock
                  className="w-[18px] h-[18px] text-[#374151]"
                  strokeWidth={1.75}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827]">
                  View Privacy Policy
                </p>
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#9CA3AF] mt-[2px]">
                  Location data, security & your rights
                </p>
              </div>
              <ChevronRight className="w-[18px] h-[18px] text-[#9CA3AF] flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* ── Testimonial ── */}
        <div className="px-[24px] mb-[24px]">
          <div className="bg-[#F9FAFB] rounded-[18px] p-[20px] border border-[#F3F4F6]">
            <div className="flex items-center gap-[2px] mb-[10px]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="w-[13px] h-[13px] text-[#F59E0B] fill-[#F59E0B]"
                />
              ))}
            </div>
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#374151] leading-[1.6] mb-[14px] italic">
              "I used to struggle finding clients. Now I get 3–5 bookings a day
              without leaving home to look for work. ServEase changed everything
              for me."
            </p>
            <div className="flex items-center gap-[10px]">
              <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-[#56C490] to-[#00A050] flex items-center justify-center flex-shrink-0">
                <span className="font-['Nunito',sans-serif] text-[14px] text-white">
                  R
                </span>
              </div>
              <div>
                <p className="font-['Nunito',sans-serif] text-[12px] text-[#111827]">
                  Rico M.
                </p>
                <p className="font-['Nunito',sans-serif] text-[10px] text-[#9CA3AF]">
                  Aircon Technician · Makati City
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom CTA ── */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#F2F2F2] z-50">
        <div className="px-[24px] pt-[14px] pb-[12px]">
          <button
            onClick={() => navigate("/provider/signup/step1")}
            className="w-full h-[52px] bg-[#56C490] rounded-[50px] flex items-center justify-center gap-[8px] transition-all active:scale-[0.97] shadow-[0_6px_20px_rgba(86,196,144,0.35)]"
          >
            <span className="font-['Nunito',sans-serif] text-[16px] text-white">
              Apply to be a Provider
            </span>
            <ArrowRight className="w-[18px] h-[18px] text-white" />
          </button>
        </div>
        {/* Home Indicator */}
        <div className="h-[34px] relative">
          <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          LEGAL MODAL — Full-screen overlay
          ═══════════════════════════════════════════════════════ */}
      {activeModal && (
        <div className="absolute inset-0 z-[100] bg-white flex flex-col">
          {/* Modal Status Bar */}
          <div className="flex-shrink-0">
            <StatusBar />
          </div>

          {/* Modal Header */}
          <div className="flex items-center justify-between px-[24px] py-[14px] border-b border-[#F3F4F6] flex-shrink-0">
            <h2 className="font-['Nunito',sans-serif] text-[16px] text-[#111827]">
              {activeModal === "terms"
                ? "Terms & Conditions"
                : "Privacy Policy"}
            </h2>
            <button
              onClick={() => setActiveModal(null)}
              className="w-[36px] h-[36px] rounded-full bg-[#F3F4F6] flex items-center justify-center transition-all active:scale-90"
            >
              <X className="w-[18px] h-[18px] text-[#374151]" />
            </button>
          </div>

          {/* Modal Body */}
          <div
            className="flex-1 overflow-y-auto px-[24px] py-[20px]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <pre className="font-['Nunito',sans-serif] text-[12px] text-[#374151] leading-[1.7] whitespace-pre-wrap">
              {activeModal === "terms" ? termsContent : privacyContent}
            </pre>
          </div>

          {/* Modal Bottom */}
          <div className="flex-shrink-0 px-[24px] pt-[12px] pb-[12px] border-t border-[#F3F4F6]">
            <button
              onClick={() => setActiveModal(null)}
              className="w-full h-[48px] bg-[#F3F4F6] rounded-[50px] flex items-center justify-center transition-all active:scale-[0.97]"
            >
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
                Close
              </span>
            </button>
          </div>
          {/* Home Indicator */}
          <div className="h-[34px] relative flex-shrink-0">
            <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
          </div>
        </div>
      )}
    </div>
  );
}
