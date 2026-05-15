import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, ChevronRight, DollarSign, CreditCard, Receipt, History, Wallet, Shield, AlertCircle, FileText, PlusCircle, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

export default function CustomerPaymentsHelp() {
  const navigate = useNavigate();

  const helpArticles = [
    {
      id: 1,
      icon: DollarSign,
      iconColor: "#56C490",
      iconBg: "#56C490",
      title: "How Service Payments Work",
      description: "Understanding the complete payment process from booking to completion",
      content: "Learn about payment methods, timing, and what happens after service completion"
    },
    {
      id: 2,
      icon: TrendingUp,
      iconColor: "#3B82F6",
      iconBg: "#3B82F6",
      title: "Platform Fees Explanation",
      description: "Breakdown of service fees and platform charges",
      content: "Understand how fees are calculated and what you're paying for"
    },
    {
      id: 3,
      icon: PlusCircle,
      iconColor: "#F59E0B",
      iconBg: "#F59E0B",
      title: "Requesting Additional Payments",
      description: "How providers request extra payment for additional work or materials",
      content: "Learn when and how to approve or decline additional payment requests"
    },
    {
      id: 4,
      icon: Receipt,
      iconColor: "#8B5CF6",
      iconBg: "#8B5CF6",
      title: "Viewing Receipts and Payment History",
      description: "Access your transaction records and download receipts",
      content: "Find past payments, view detailed invoices, and export for records"
    },
    {
      id: 5,
      icon: CreditCard,
      iconColor: "#EC4899",
      iconBg: "#EC4899",
      title: "Adding and Managing Payment Methods",
      description: "Link credit cards, debit cards, and digital wallets",
      content: "Add new payment options, set default method, and remove old cards"
    },
    {
      id: 6,
      icon: Wallet,
      iconColor: "#10B981",
      iconBg: "#10B981",
      title: "ServEase Wallet and Credits",
      description: "Using wallet balance and promotional credits for payments",
      content: "Top up your wallet, use credits, and track your balance"
    },
    {
      id: 7,
      icon: Shield,
      iconColor: "#06B6D4",
      iconBg: "#06B6D4",
      title: "Payment Security and Safety",
      description: "How ServEase protects your financial information",
      content: "Learn about encryption, secure transactions, and fraud protection"
    },
    {
      id: 8,
      icon: XCircle,
      iconColor: "#EF4444",
      iconBg: "#EF4444",
      title: "Refunds and Cancellation Charges",
      description: "Understanding refund policies and cancellation fees",
      content: "When you're eligible for refunds and how to request them"
    },
    {
      id: 9,
      icon: AlertCircle,
      iconColor: "#F97316",
      iconBg: "#F97316",
      title: "Payment Disputes and Issues",
      description: "What to do if there's a problem with your payment",
      content: "Report unauthorized charges, dispute fees, and resolve payment errors"
    },
    {
      id: 10,
      icon: CheckCircle,
      iconColor: "#14B8A6",
      iconBg: "#14B8A6",
      title: "Payment Confirmation and Notifications",
      description: "Receiving payment receipts and transaction alerts",
      content: "Understand payment notifications and confirmation messages"
    },
    {
      id: 11,
      icon: FileText,
      iconColor: "#A855F7",
      iconBg: "#A855F7",
      title: "Service Fee Breakdown",
      description: "Detailed explanation of what each fee covers",
      content: "Base price, service fee, taxes, and additional charges explained"
    },
    {
      id: 12,
      icon: History,
      iconColor: "#84CC16",
      iconBg: "#84CC16",
      title: "Tracking Payment Status",
      description: "Monitor pending, processing, and completed payments",
      content: "Check payment status in real-time and understand processing times"
    }
  ];

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] py-[12px] flex items-center gap-[16px] border-b border-[#F2F2F2] flex-shrink-0">
        <button
          onClick={() => navigate("/customer/help")}
          className="w-[40px] h-[40px] flex items-center justify-center -ml-[8px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-[24px] h-[24px] text-[#111827]" />
        </button>
        <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
          Payments Help
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        <div className="px-[24px] py-[20px]">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-[16px] p-[20px] mb-[24px]">
            <h2 className="font-['Nunito',sans-serif] text-[20px] text-white mb-[8px]">
              Payment Information 💳
            </h2>
            <p className="font-['Nunito',sans-serif] text-[14px] text-white/90 leading-[1.5]">
              Learn about payments, fees, refunds, and how to manage your payment methods securely on ServEase.
            </p>
          </div>

          {/* Help Articles */}
          <div className="mb-[24px]">
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
              Payment Guides
            </h3>
            
            <div className="space-y-[12px]">
              {helpArticles.map((article) => {
                const Icon = article.icon;
                return (
                  <button
                    key={article.id}
                    onClick={() => {
                      // In production, this would navigate to the full article page
                      console.log("Opening article:", article.title);
                    }}
                    className="w-full bg-white rounded-[16px] p-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-[#F2F2F2] transition-all active:scale-[0.98] hover:shadow-[0_4px_12px_rgba(86,196,144,0.15)] hover:border-[#56C490]/30"
                  >
                    <div className="flex items-start gap-[12px]">
                      {/* Icon */}
                      <div 
                        className="flex-shrink-0 w-[48px] h-[48px] rounded-[12px] flex items-center justify-center"
                        style={{ backgroundColor: `${article.iconBg}15` }}
                      >
                        <Icon 
                          className="w-[24px] h-[24px]" 
                          style={{ color: article.iconColor }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-left">
                        <h4 className="font-['Nunito',sans-serif] text-[15px] text-[#111827] mb-[4px] leading-[1.3]">
                          {article.title}
                        </h4>
                        <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.4] mb-[6px]">
                          {article.description}
                        </p>
                        <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] leading-[1.4]">
                          {article.content}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0 self-center">
                        <div className="w-[32px] h-[32px] rounded-full bg-[#F9FAFB] flex items-center justify-center">
                          <ChevronRight className="w-[18px] h-[18px] text-[#6B7280]" />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Tips */}
          <div className="bg-[#F9FAFB] rounded-[16px] p-[20px] border border-[#E5E7EB]">
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[12px]">
              Payment Tips 💡
            </h3>
            <ul className="space-y-[8px]">
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Always use secure payment methods available through the app
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Save your receipts for tax purposes or record keeping
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Review additional payment requests carefully before approving
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Contact support immediately if you notice unauthorized charges
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Keep your payment methods up to date to avoid payment failures
                </p>
              </li>
            </ul>
          </div>

          {/* Still Need Help Section */}
          <div className="mt-[24px] text-center">
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[12px]">
              Have questions about payments?
            </p>
            <button
              onClick={() => navigate("/customer/help")}
              className="font-['Nunito',sans-serif] text-[14px] text-[#56C490] transition-all active:scale-95"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
