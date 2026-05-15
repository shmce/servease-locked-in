import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { 
  ArrowLeft, 
  Wallet,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  Home,
  MessageCircle,
  MoreHorizontal,
  Building2,
  Smartphone,
  ExternalLink
} from "lucide-react";

type PayoutMethod = "bank" | "gcash" | "paymaya" | null;
type AccountType = "savings" | "checking";

export default function ProviderPayoutManagement() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod>("bank");
  const [accountType, setAccountType] = useState<AccountType>("savings");
  const [isPrimary, setIsPrimary] = useState(true);

  // Sample payout history
  const payoutHistory = [
    {
      id: "PO-789456",
      date: "Mar 5, 2026",
      amount: 8450,
      status: "Completed",
      method: "Bank Transfer"
    },
    {
      id: "PO-789421",
      date: "Feb 26, 2026",
      amount: 7820,
      status: "Completed",
      method: "Bank Transfer"
    },
    {
      id: "PO-789389",
      date: "Feb 19, 2026",
      amount: 6950,
      status: "Completed",
      method: "Bank Transfer"
    },
    {
      id: "PO-789352",
      date: "Feb 12, 2026",
      amount: 5430,
      status: "Processing",
      method: "Bank Transfer"
    },
  ];

  const availableBalance = 1530;
  const processingBalance = 850;
  const nextPayoutDate = "March 20, 2026";
  const estimatedAmount = 1530;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-[#56C490]/10 text-[#56C490]";
      case "Processing":
        return "bg-[#F59E0B]/10 text-[#F59E0B]";
      case "Failed":
        return "bg-[#EF4444]/10 text-[#EF4444]";
      default:
        return "bg-[#6B7280]/10 text-[#6B7280]";
    }
  };

  return (
    <div className="bg-[#F9FAFB] w-full h-screen flex flex-col">
      {/* Fixed iOS Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex-shrink-0">
        <StatusBar />
      </div>

      {/* Fixed Header */}
      <div className="fixed top-[47px] left-0 right-0 z-40 bg-white border-b border-[#E5E7EB] px-[24px] py-[12px] flex-shrink-0">
        <div className="flex items-center gap-[12px]">
          <button
            onClick={() => navigate(-1)}
            className="w-[40px] h-[40px] rounded-full flex items-center justify-center -ml-[8px] transition-all active:scale-90"
          >
            <ArrowLeft className="w-[22px] h-[22px] text-[#111827]" />
          </button>
          <h1 className="font-semibold text-[18px] text-[#111827]">
            Payout Management
          </h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="mt-[106px] mb-[147px] overflow-y-scroll">
        {/* Available Balance Card - Mint Green */}
        <div className="px-[24px] pt-[20px] pb-[16px]">
          <div className="bg-[#E8F5E9] border border-[#56C490]/20 rounded-[16px] p-[20px]">
            <div className="flex items-center gap-[12px] mb-[12px]">
              <div className="w-[44px] h-[44px] rounded-[12px] bg-[#56C490]/10 flex items-center justify-center">
                <Wallet className="w-[22px] h-[22px] text-[#56C490]" />
              </div>
              <div>
                <p className="text-[13px] text-[#374151] mb-[2px]">Available for Payout</p>
                <h2 className="font-bold text-[32px] text-[#111827] leading-none">
                  ₱{availableBalance.toLocaleString()}
                </h2>
              </div>
            </div>
            
            {/* Processing Balance Info */}
            <div className="flex items-center gap-[6px] px-[12px] py-[8px] bg-white/60 rounded-[8px] mb-[16px]">
              <Clock className="w-[14px] h-[14px] text-[#F59E0B]" />
              <span className="text-[12px] text-[#6B7280]">
                ₱{processingBalance.toLocaleString()} currently processing
              </span>
            </div>

            {/* Request Early Payout Button */}
            <button 
              onClick={() => navigate("/provider/request-payout")}
              className="w-full bg-[#56C490] py-[14px] rounded-[12px] flex items-center justify-center gap-[8px] shadow-[0_2px_8px_rgba(86,196,144,0.3)] transition-all active:scale-95 mb-[8px]"
            >
              <Wallet className="w-[18px] h-[18px] text-white" />
              <span className="font-semibold text-[16px] text-white">Request Payout</span>
            </button>
            <p className="text-center text-[11px] text-[#6B7280]">
              <AlertCircle className="w-[12px] h-[12px] inline-block mr-[4px]" />
              Processing time: 1-3 business days
            </p>
          </div>
        </div>

        {/* Payout Method on File */}
        <div className="px-[24px] pb-[16px]">
          <h3 className="font-semibold text-[16px] text-[#111827] mb-[12px]">
            Payout Method
          </h3>
          <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[16px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[12px]">
                <div className="w-[40px] h-[40px] rounded-[10px] bg-[#F3F4F6] flex items-center justify-center">
                  <Building2 className="w-[20px] h-[20px] text-[#6B7280]" />
                </div>
                <div>
                  <p className="font-medium text-[14px] text-[#111827] mb-[2px]">
                    Bank Account
                  </p>
                  <p className="text-[12px] text-[#6B7280]">
                    BDO •••• 1234
                  </p>
                </div>
              </div>
              <button className="text-[#56C490] font-semibold text-[14px] transition-all active:opacity-70">
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Schedule Details */}
        <div className="px-[24px] pb-[16px]">
          <h3 className="font-semibold text-[16px] text-[#111827] mb-[12px]">
            Payout Schedule
          </h3>
          <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[16px] space-y-[14px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[10px]">
                <div className="w-[36px] h-[36px] rounded-[8px] bg-[#EEF2FF] flex items-center justify-center">
                  <Calendar className="w-[18px] h-[18px] text-[#6366F1]" />
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-[2px]">Frequency</p>
                  <p className="font-semibold text-[14px] text-[#111827]">Weekly</p>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-[#F3F4F6]" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[10px]">
                <div className="w-[36px] h-[36px] rounded-[8px] bg-[#FEF3C7] flex items-center justify-center">
                  <Clock className="w-[18px] h-[18px] text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-[2px]">Next Payout Date</p>
                  <p className="font-semibold text-[14px] text-[#111827]">{nextPayoutDate}</p>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-[#F3F4F6]" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[10px]">
                <div className="w-[36px] h-[36px] rounded-[8px] bg-[#D1FAE5] flex items-center justify-center">
                  <Wallet className="w-[18px] h-[18px] text-[#56C490]" />
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] mb-[2px]">Estimated Amount</p>
                  <p className="font-semibold text-[14px] text-[#111827]">₱{estimatedAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payout Setup Section */}
        <div className="px-[24px] pb-[16px]">
          <h3 className="font-semibold text-[16px] text-[#111827] mb-[12px]">
            Add/Update Payout Method
          </h3>
          
          {/* Method Selection - Radio Buttons */}
          <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[16px] mb-[12px]">
            <p className="font-medium text-[14px] text-[#374151] mb-[12px]">Select Payout Method</p>
            
            <div className="space-y-[10px]">
              {/* Bank Transfer */}
              <button
                onClick={() => setSelectedMethod("bank")}
                className={`w-full flex items-center gap-[12px] p-[12px] rounded-[10px] border-2 transition-all ${
                  selectedMethod === "bank"
                    ? "bg-[#56C490]/5 border-[#56C490]"
                    : "bg-white border-[#E5E7EB]"
                }`}
              >
                <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === "bank"
                    ? "border-[#56C490]"
                    : "border-[#D1D5DB]"
                }`}>
                  {selectedMethod === "bank" && (
                    <div className="w-[10px] h-[10px] rounded-full bg-[#56C490]" />
                  )}
                </div>
                <Building2 className="w-[20px] h-[20px] text-[#6B7280]" />
                <span className="font-medium text-[14px] text-[#111827]">Bank Transfer</span>
              </button>

              {/* GCash */}
              <button
                onClick={() => setSelectedMethod("gcash")}
                className={`w-full flex items-center gap-[12px] p-[12px] rounded-[10px] border-2 transition-all ${
                  selectedMethod === "gcash"
                    ? "bg-[#56C490]/5 border-[#56C490]"
                    : "bg-white border-[#E5E7EB]"
                }`}
              >
                <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === "gcash"
                    ? "border-[#56C490]"
                    : "border-[#D1D5DB]"
                }`}>
                  {selectedMethod === "gcash" && (
                    <div className="w-[10px] h-[10px] rounded-full bg-[#56C490]" />
                  )}
                </div>
                <Smartphone className="w-[20px] h-[20px] text-[#6B7280]" />
                <span className="font-medium text-[14px] text-[#111827]">GCash</span>
              </button>

              {/* PayMaya */}
              <button
                onClick={() => setSelectedMethod("paymaya")}
                className={`w-full flex items-center gap-[12px] p-[12px] rounded-[10px] border-2 transition-all ${
                  selectedMethod === "paymaya"
                    ? "bg-[#56C490]/5 border-[#56C490]"
                    : "bg-white border-[#E5E7EB]"
                }`}
              >
                <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === "paymaya"
                    ? "border-[#56C490]"
                    : "border-[#D1D5DB]"
                }`}>
                  {selectedMethod === "paymaya" && (
                    <div className="w-[10px] h-[10px] rounded-full bg-[#56C490]" />
                  )}
                </div>
                <CreditCard className="w-[20px] h-[20px] text-[#6B7280]" />
                <span className="font-medium text-[14px] text-[#111827]">PayMaya</span>
              </button>
            </div>
          </div>

          {/* Bank Transfer Form */}
          {selectedMethod === "bank" && (
            <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[16px] space-y-[14px]">
              <h4 className="font-semibold text-[14px] text-[#111827]">Bank Account Details</h4>
              
              {/* Bank Name Dropdown */}
              <div>
                <label className="block font-medium text-[14px] text-[#374151] mb-[6px]">
                  Bank Name <span className="text-[#EF4444]">*</span>
                </label>
                <select className="w-full px-[14px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20">
                  <option value="">Select your bank</option>
                  <option value="bdo">BDO Unibank</option>
                  <option value="bpi">BPI (Bank of the Philippine Islands)</option>
                  <option value="metrobank">Metrobank</option>
                  <option value="security">Security Bank</option>
                  <option value="landbank">LandBank</option>
                  <option value="unionbank">UnionBank</option>
                  <option value="pnb">Philippine National Bank</option>
                  <option value="rcbc">RCBC</option>
                </select>
              </div>

              {/* Account Name */}
              <div>
                <label className="block font-medium text-[14px] text-[#374151] mb-[6px]">
                  Account Name <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Juan dela Cruz"
                  className="w-full px-[14px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                />
              </div>

              {/* Account Number */}
              <div>
                <label className="block font-medium text-[14px] text-[#374151] mb-[6px]">
                  Account Number <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="0123456789"
                  className="w-full px-[14px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                />
              </div>

              {/* Account Type */}
              <div>
                <label className="block font-medium text-[14px] text-[#374151] mb-[8px]">
                  Account Type <span className="text-[#EF4444]">*</span>
                </label>
                <div className="flex gap-[12px]">
                  <button
                    onClick={() => setAccountType("savings")}
                    className={`flex-1 py-[10px] px-[16px] rounded-[8px] border-2 font-medium text-[14px] transition-all ${
                      accountType === "savings"
                        ? "bg-[#56C490]/5 border-[#56C490] text-[#56C490]"
                        : "bg-white border-[#E5E7EB] text-[#6B7280]"
                    }`}
                  >
                    Savings
                  </button>
                  <button
                    onClick={() => setAccountType("checking")}
                    className={`flex-1 py-[10px] px-[16px] rounded-[8px] border-2 font-medium text-[14px] transition-all ${
                      accountType === "checking"
                        ? "bg-[#56C490]/5 border-[#56C490] text-[#56C490]"
                        : "bg-white border-[#E5E7EB] text-[#6B7280]"
                    }`}
                  >
                    Checking
                  </button>
                </div>
              </div>

              {/* Branch */}
              <div>
                <label className="block font-medium text-[14px] text-[#374151] mb-[6px]">
                  Branch (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Makati Avenue Branch"
                  className="w-full px-[14px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                />
              </div>
            </div>
          )}

          {/* E-Wallet Forms (GCash/PayMaya) */}
          {(selectedMethod === "gcash" || selectedMethod === "paymaya") && (
            <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[16px] space-y-[14px]">
              <h4 className="font-semibold text-[14px] text-[#111827]">
                {selectedMethod === "gcash" ? "GCash" : "PayMaya"} Account Details
              </h4>
              
              {/* Mobile Number */}
              <div>
                <label className="block font-medium text-[14px] text-[#374151] mb-[6px]">
                  Mobile Number <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+63 912 345 6789"
                  className="w-full px-[14px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                />
              </div>

              {/* Account Name */}
              <div>
                <label className="block font-medium text-[14px] text-[#374151] mb-[6px]">
                  Account Name <span className="text-[#EF4444]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Juan dela Cruz"
                  className="w-full px-[14px] py-[12px] bg-white border border-[#D1D5DB] rounded-[8px] text-[14px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:ring-2 focus:ring-[#56C490]/20"
                />
              </div>
            </div>
          )}

          {/* Set as Primary Checkbox */}
          {selectedMethod && (
            <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[16px]">
              <label className="flex items-center gap-[10px] cursor-pointer">
                <button
                  onClick={() => setIsPrimary(!isPrimary)}
                  className={`w-[20px] h-[20px] rounded-[6px] border-2 flex items-center justify-center transition-all ${
                    isPrimary
                      ? "bg-[#56C490] border-[#56C490]"
                      : "bg-white border-[#D1D5DB]"
                  }`}
                >
                  {isPrimary && (
                    <CheckCircle className="w-[14px] h-[14px] text-white" strokeWidth={3} />
                  )}
                </button>
                <span className="font-medium text-[14px] text-[#374151]">
                  Set as primary payout method
                </span>
              </label>
            </div>
          )}

          {/* Payout Schedule Info */}
          <div className="bg-[#EFF6FF] border border-[#3B82F6]/20 rounded-[12px] p-[14px]">
            <div className="flex gap-[10px]">
              <Calendar className="w-[18px] h-[18px] text-[#3B82F6] flex-shrink-0 mt-[2px]" />
              <div>
                <p className="font-semibold text-[13px] text-[#111827] mb-[4px]">Payout Schedule</p>
                <p className="text-[12px] text-[#374151] leading-[1.5]">
                  Choose your preferred schedule: <span className="font-semibold text-[#3B82F6]">Weekly</span> (every Friday) or <span className="font-semibold text-[#3B82F6]">Bi-weekly</span> (1st and 15th of the month).
                </p>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button className="w-full bg-[#56C490] py-[14px] rounded-[12px] font-semibold text-[16px] text-white shadow-[0_2px_8px_rgba(86,196,144,0.25)] transition-all active:scale-95">
            Continue
          </button>
        </div>

        {/* Payout History */}
        <div className="px-[24px] pb-[24px]">
          <h3 className="font-semibold text-[16px] text-[#111827] mb-[12px]">
            Payout History
          </h3>
          
          <div className="bg-white border border-[#E5E7EB] rounded-[12px] overflow-hidden">
            {payoutHistory.map((payout, index) => (
              <div
                key={payout.id}
                className={`p-[16px] ${
                  index !== payoutHistory.length - 1 ? "border-b border-[#F3F4F6]" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-[10px]">
                  <div className="flex-1">
                    <div className="flex items-center gap-[8px] mb-[4px]">
                      <p className="font-semibold text-[14px] text-[#111827]">
                        ₱{payout.amount.toLocaleString()}
                      </p>
                      <span
                        className={`px-[8px] py-[2px] rounded-[12px] font-semibold text-[10px] ${getStatusColor(
                          payout.status
                        )}`}
                      >
                        {payout.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#6B7280] mb-[2px]">{payout.date}</p>
                    <p className="text-[11px] text-[#9CA3AF]">ID: {payout.id}</p>
                  </div>
                  <button className="flex items-center gap-[4px] text-[#56C490] text-[12px] font-semibold transition-all active:opacity-70 mt-[2px]">
                    View Details
                    <ChevronRight className="w-[14px] h-[14px]" />
                  </button>
                </div>
                <div className="flex items-center gap-[6px] text-[11px] text-[#6B7280]">
                  <Building2 className="w-[12px] h-[12px]" />
                  <span>{payout.method}</span>
                </div>
              </div>
            ))}
          </div>

          {/* View All History Link */}
          <button className="w-full mt-[12px] py-[12px] text-center font-semibold text-[14px] text-[#56C490] transition-all active:opacity-70">
            View All Transaction History
          </button>
        </div>

        {/* Bottom Spacer */}
        <div className="h-[40px]" />
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e5e5] flex-shrink-0 z-30">
        <div className="flex justify-around items-center px-[24px] pt-[12px]">
          <button
            onClick={() => navigate("/provider/home")}
            className="flex flex-col items-center gap-[4px] py-[8px] flex-1 transition-all active:scale-90"
          >
            <Home className="w-[24px] h-[24px] text-[#5d5d5d]" />
            <span className="font-medium text-[10px] tracking-[-0.2px] text-[#5d5d5d]">
              Home
            </span>
          </button>

          <button
            className="flex flex-col items-center gap-[4px] py-[8px] flex-1 transition-all active:scale-90"
          >
            <Calendar className="w-[24px] h-[24px] text-[#5d5d5d]" />
            <span className="font-medium text-[10px] tracking-[-0.2px] text-[#5d5d5d]">
              Jobs
            </span>
          </button>

          <button
            className="flex flex-col items-center gap-[4px] py-[8px] flex-1 transition-all active:scale-90"
          >
            <MessageCircle className="w-[24px] h-[24px] text-[#5d5d5d]" />
            <span className="font-medium text-[10px] tracking-[-0.2px] text-[#5d5d5d]">
              Messages
            </span>
          </button>

          <button
            onClick={() => navigate("/provider/settings")}
            className="flex flex-col items-center gap-[4px] py-[8px] flex-1 transition-all active:scale-90"
          >
            <MoreHorizontal className="w-[24px] h-[24px] text-[#56C490]" />
            <span className="font-medium text-[10px] tracking-[-0.2px] text-[#56C490]">
              More
            </span>
          </button>
        </div>
        
        {/* Home Indicator */}
        <div className="h-[34px] bg-white relative">
          <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
        </div>
      </div>
    </div>
  );
}