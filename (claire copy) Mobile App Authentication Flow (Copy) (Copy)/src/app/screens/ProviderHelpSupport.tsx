import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import {
  ArrowLeft,
  Search,
  BookOpen,
  DollarSign,
  ShieldCheck,
  FileText,
  Mail,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  X,
} from "lucide-react";

// ─── FAQ Data ─────────────────────────────────────────────────
interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const FAQ_ARTICLES: FaqItem[] = [
  {
    id: 1,
    question: "How do I get paid?",
    answer:
      "Once a booking is completed and confirmed by the customer, your earnings are automatically credited to your registered payout method. Payouts are processed every Monday and Thursday. You can track all your earnings and payout history from the Earnings tab on your dashboard. Make sure your GCash, bank account, or e-wallet details are up to date under Payout Methods in Settings.",
    category: "Payments & Earnings",
  },
  {
    id: 2,
    question: "How do booking cancellations work?",
    answer:
      "If a customer cancels a booking more than 24 hours before the scheduled time, no cancellation fee applies. Cancellations within 24 hours may result in a partial payment to you as compensation for the late notice. If you need to cancel, please do so as early as possible through the Bookings tab — repeated provider cancellations may affect your rating and visibility on the platform.",
    category: "Managing Bookings",
  },
  {
    id: 3,
    question: "How does profile verification work?",
    answer:
      "Profile verification helps build trust with customers. You'll need to submit a valid Philippine government ID (e.g., PhilSys, Passport, Driver's License) and a clear selfie for identity matching. Verification is reviewed within 1–3 business days. Verified providers receive a badge on their profile and are prioritized in search results. You can check your verification status under Settings > Profile & Verification.",
    category: "Profile & Verification",
  },
  {
    id: 4,
    question: "How do I set or update my service rates?",
    answer:
      "Go to your Provider Dashboard, tap on Settings, then Service Configuration. From there you can update your base rate, price unit (per hour, per project, or per sqm), and estimated duration for each service. Changes take effect immediately and will be reflected on your public profile. We recommend keeping your rates competitive by checking similar providers in your area.",
    category: "Payments & Earnings",
  },
];

const FAQ_CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Payments", value: "Payments & Earnings" },
  { label: "Bookings", value: "Managing Bookings" },
  { label: "Verification", value: "Profile & Verification" },
];

// ─── Component ────────────────────────────────────────────────
export default function ProviderHelpSupport() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  // Filter articles based on search + category
  const filteredArticles = useMemo(() => {
    return FAQ_ARTICLES.filter((faq) => {
      const matchesCategory =
        activeCategory === "all" || faq.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, activeCategory]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Payments & Earnings":
        return <DollarSign className="w-[14px] h-[14px]" />;
      case "Managing Bookings":
        return <BookOpen className="w-[14px] h-[14px]" />;
      case "Profile & Verification":
        return <ShieldCheck className="w-[14px] h-[14px]" />;
      default:
        return <FileText className="w-[14px] h-[14px]" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Payments & Earnings":
        return "#F59E0B";
      case "Managing Bookings":
        return "#3B82F6";
      case "Profile & Verification":
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-[#56C490] px-[24px] pt-[16px] pb-[24px] flex-shrink-0">
        <div className="flex items-center gap-[16px] mb-[20px]">
          <button
            onClick={() =>
              navigate("/provider/home", { state: { activeTab: "more" } })
            }
            className="w-[40px] h-[40px] rounded-full bg-white/15 flex items-center justify-center transition-all active:scale-95"
          >
            <ArrowLeft className="w-[20px] h-[20px] text-white" />
          </button>
          <h1 className="font-['Nunito',sans-serif] text-[20px] text-white">
            Help Center
          </h1>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search help articles..."
            className="w-full h-[48px] pl-[48px] pr-[44px] rounded-[12px] bg-white border-none outline-none font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-[14px] top-1/2 -translate-y-1/2 w-[24px] h-[24px] rounded-full bg-[#f0f0f0] flex items-center justify-center transition-all active:scale-90"
            >
              <X className="w-[14px] h-[14px] text-[#666]" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-[24px] pt-[20px] pb-[32px]">
          {/* Category Filter Pills */}
          <div className="flex gap-[8px] mb-[24px] overflow-x-auto pb-[4px] -mx-[24px] px-[24px]">
            {FAQ_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-[16px] py-[8px] rounded-[20px] font-['Nunito',sans-serif] text-[13px] whitespace-nowrap transition-all active:scale-95 flex-shrink-0 ${
                  activeCategory === cat.value
                    ? "bg-[#56C490] text-white"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Section: Frequently Asked Questions */}
          <div className="mb-[36px]">
            <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827] mb-[4px]">
              Frequently Asked Questions
            </h2>
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[16px]">
              Tap a question to see the answer
            </p>

            {filteredArticles.length === 0 ? (
              <div className="text-center py-[40px]">
                <Search className="w-[36px] h-[36px] text-[#d1d5db] mx-auto mb-[12px]" />
                <p className="font-['Nunito',sans-serif] text-[15px] text-[#6B7280] mb-[4px]">
                  No results found
                </p>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF]">
                  Try a different search term or category
                </p>
              </div>
            ) : (
              <div className="space-y-[10px]">
                {filteredArticles.map((faq) => {
                  const isExpanded = expandedId === faq.id;
                  const catColor = getCategoryColor(faq.category);
                  return (
                    <div
                      key={faq.id}
                      className={`border-2 rounded-[14px] transition-all duration-200 overflow-hidden ${
                        isExpanded
                          ? "border-[#56C490] bg-[#FAFFFE]"
                          : "border-[#E5E7EB] bg-white"
                      }`}
                    >
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : faq.id)
                        }
                        className="w-full px-[16px] py-[16px] flex items-start gap-[12px] transition-all active:bg-[#f9fafb]"
                      >
                        <div
                          className="w-[32px] h-[32px] rounded-[8px] flex items-center justify-center flex-shrink-0 mt-[1px]"
                          style={{ backgroundColor: `${catColor}15`, color: catColor }}
                        >
                          {getCategoryIcon(faq.category)}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827] leading-[1.4]">
                            {faq.question}
                          </p>
                          <span
                            className="inline-block mt-[6px] px-[8px] py-[2px] rounded-[6px] font-['Nunito',sans-serif] text-[11px]"
                            style={{
                              backgroundColor: `${catColor}12`,
                              color: catColor,
                            }}
                          >
                            {faq.category}
                          </span>
                        </div>
                        <div className="flex-shrink-0 mt-[4px]">
                          {isExpanded ? (
                            <ChevronUp className="w-[20px] h-[20px] text-[#56C490]" />
                          ) : (
                            <ChevronDown className="w-[20px] h-[20px] text-[#9CA3AF]" />
                          )}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-[16px] pb-[16px] pt-[0px]">
                          <div className="ml-[44px] border-t border-[#E5E7EB] pt-[12px]">
                            <p className="font-['Nunito',sans-serif] text-[13px] text-[#4B5563] leading-[1.7]">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-[1px] bg-[#E5E7EB] mb-[28px]" />

          {/* Section: Contact Support */}
          <div className="mb-[24px]">
            <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827] mb-[4px]">
              Still need help?
            </h2>
            <p className="font-['Nunito',sans-serif] text-[13px] text-[#9CA3AF] mb-[16px]">
              Our team typically responds within 24 hours
            </p>

            {/* Email Support */}
            <a
              href="mailto:support@servease.ph"
              className="block w-full bg-white border-2 border-[#E5E7EB] p-[16px] rounded-[14px] transition-all active:scale-[0.98] hover:border-[#56C490] mb-[12px]"
            >
              <div className="flex items-center gap-[14px]">
                <div className="w-[44px] h-[44px] rounded-[12px] bg-[#56C490]/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-[22px] h-[22px] text-[#56C490]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-['Nunito',sans-serif] text-[15px] text-[#111827]">
                    Email Support
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[13px] text-[#56C490]">
                    support@servease.ph
                  </p>
                </div>
                <ExternalLink className="w-[18px] h-[18px] text-[#9CA3AF] flex-shrink-0" />
              </div>
            </a>

            {/* Message on Facebook */}
            <a
              href="https://m.me/servease.ph"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white border-2 border-[#E5E7EB] p-[16px] rounded-[14px] transition-all active:scale-[0.98] hover:border-[#1877F2]"
            >
              <div className="flex items-center gap-[14px]">
                <div className="w-[44px] h-[44px] rounded-[12px] bg-[#1877F2]/10 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-[22px] h-[22px]"
                    viewBox="0 0 24 24"
                    fill="#1877F2"
                  >
                    <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.52 1.49-3.93 3.78-3.93 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-['Nunito',sans-serif] text-[15px] text-[#111827]">
                    Message us on Facebook
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280]">
                    Usually replies within a few hours
                  </p>
                </div>
                <ExternalLink className="w-[18px] h-[18px] text-[#9CA3AF] flex-shrink-0" />
              </div>
            </a>
          </div>

          {/* Footer Note */}
          <p className="text-center font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] leading-[1.6] mt-[8px]">
            ServEase Help Center v1.0
          </p>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}
