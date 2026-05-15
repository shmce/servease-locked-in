import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import {
  ArrowLeft,
  Info,
  ChevronRight,
  Home,
  Calendar,
  MessageCircle,
  BarChart3,
  MoreHorizontal,
} from "lucide-react";

// Import the Request Payout image
import requestPayoutIcon from "figma:asset/1b2c64e6030c6e7657548538beeb6387a6aa4bb3.png";

export default function ProviderRequestPayout() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("earnings");
  const [amount, setAmount] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("visa-1234");

  const availableBalance = 4500.0;
  const withdrawalFee = amount ? (parseFloat(amount) > 1000 ? 15.0 : 0.0) : 0.0;
  const amountToReceive = amount
    ? parseFloat(amount) - withdrawalFee
    : 0.0;

  const payoutMethods = [
    {
      id: "visa-1234",
      type: "Bank Transfer",
      name: "Visa ending in 1234",
      icon: "💳",
    },
    {
      id: "gcash-9876",
      type: "E-Wallet",
      name: "GCash - 09171234567",
      icon: "📱",
    },
    {
      id: "bdo-5678",
      type: "Bank Transfer",
      name: "BDO - Account ending in 5678",
      icon: "🏦",
    },
  ];

  const selectedMethodDetails = payoutMethods.find(
    (m) => m.id === selectedMethod
  );

  const handleWithdrawFull = () => {
    setAmount(availableBalance.toString());
  };

  const handleRequestPayout = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > availableBalance) {
      alert("Insufficient balance");
      return;
    }

    if (!agreeToTerms) {
      alert("Please accept the terms and conditions");
      return;
    }

    // Success - show confirmation
    alert(
      `Payout request submitted!\n\nAmount: ₱${parseFloat(amount).toFixed(
        2
      )}\nFee: ₱${withdrawalFee.toFixed(2)}\nYou'll receive: ₱${amountToReceive.toFixed(
        2
      )}\n\nProcessing time: 1-3 business days`
    );
    navigate("/provider/payout-management");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    if (tab === "home") {
      navigate("/provider/home");
    } else if (tab === "bookings") {
      navigate("/provider/my-bookings");
    } else if (tab === "messages") {
      navigate("/provider/messages/all");
    } else if (tab === "more") {
      navigate("/provider/settings");
    }
  };

  return (
    <div className="bg-[#F9FAFB] w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>

      {/* Header */}
      <div className="bg-white px-[24px] py-[12px] border-b border-[#E5E7EB] flex-shrink-0">
        <div className="flex items-center gap-[12px]">
          <button
            onClick={() => navigate(-1)}
            className="w-[40px] h-[40px] rounded-full flex items-center justify-center -ml-[8px] transition-all active:scale-90"
          >
            <ArrowLeft className="w-[22px] h-[22px] text-[#111827]" />
          </button>
          <h1 className="font-semibold text-[18px] text-[#111827]">
            Request Payout
          </h1>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        {/* Available Balance Section */}
        <div className="bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] px-[24px] py-[32px] text-center">
          <p className="text-white/80 text-[14px] mb-[8px]">
            Available Balance
          </p>
          <h2 className="text-white text-[42px] font-bold tracking-tight">
            ₱{availableBalance.toFixed(2)}
          </h2>
        </div>

        {/* Amount Input Section */}
        <div className="px-[24px] pt-[24px] pb-[16px]">
          <label className="block text-[#374151] text-[14px] font-medium mb-[8px]">
            Amount to Withdraw
          </label>
          <div className="relative">
            <span className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[#6B7280] text-[18px] font-medium">
              ₱
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-[40px] pr-[16px] py-[14px] bg-white border-2 border-[#E5E7EB] rounded-[12px] text-[20px] font-semibold text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:border-[#2E7D32] focus:ring-4 focus:ring-[#2E7D32]/10 transition-all"
            />
          </div>
          <button
            onClick={handleWithdrawFull}
            className="mt-[8px] text-[#2E7D32] text-[14px] font-semibold transition-all active:opacity-70"
          >
            Withdraw full amount
          </button>
        </div>

        {/* Fee & Total Breakdown */}
        {amount && parseFloat(amount) > 0 && (
          <div className="px-[24px] pb-[20px]">
            <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-[20px]">
              <div className="flex items-center justify-between mb-[12px]">
                <span className="text-[#6B7280] text-[14px]">
                  Withdrawal Amount
                </span>
                <span className="text-[#111827] text-[14px] font-medium">
                  ₱{parseFloat(amount).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between mb-[16px]">
                <span className="text-[#6B7280] text-[14px]">
                  Withdrawal Fee
                </span>
                <span className="text-[#111827] text-[14px] font-medium">
                  {withdrawalFee > 0 ? `-₱${withdrawalFee.toFixed(2)}` : "₱0.00"}
                </span>
              </div>

              <div className="h-[1px] bg-[#E5E7EB] mb-[16px]" />

              <div className="flex items-center justify-between mb-[16px]">
                <span className="text-[#111827] text-[16px] font-semibold">
                  Amount You'll Receive
                </span>
                <span className="text-[#2E7D32] text-[20px] font-bold">
                  ₱{amountToReceive.toFixed(2)}
                </span>
              </div>

              {/* Processing Info */}
              <div className="flex items-start gap-[8px] bg-[#EFF6FF] border border-[#BFDBFE] rounded-[8px] px-[12px] py-[10px]">
                <Info className="w-[16px] h-[16px] text-[#3B82F6] flex-shrink-0 mt-[1px]" />
                <p className="text-[#1E40AF] text-[12px] leading-[1.5]">
                  <strong>Processing time:</strong> 1–3 business days
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payout Method Selector */}
        <div className="px-[24px] pb-[20px]">
          <label className="block text-[#374151] text-[14px] font-medium mb-[8px]">
            Payout Method
          </label>
          <button
            onClick={() => {
              // In a real app, this would open a modal to select method
              const nextIndex =
                (payoutMethods.findIndex((m) => m.id === selectedMethod) + 1) %
                payoutMethods.length;
              setSelectedMethod(payoutMethods[nextIndex].id);
            }}
            className="w-full bg-white border-2 border-[#E5E7EB] rounded-[12px] px-[16px] py-[14px] flex items-center justify-between transition-all active:scale-[0.98] hover:border-[#2E7D32]/30"
          >
            <div className="flex items-center gap-[12px]">
              <span className="text-[24px]">{selectedMethodDetails?.icon}</span>
              <div className="text-left">
                <p className="text-[#111827] text-[14px] font-semibold">
                  {selectedMethodDetails?.name}
                </p>
                <p className="text-[#9CA3AF] text-[12px]">
                  {selectedMethodDetails?.type}
                </p>
              </div>
            </div>
            <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
          </button>
          <button
            onClick={() => navigate("/provider/add-payment-method")}
            className="mt-[8px] text-[#2E7D32] text-[14px] font-semibold transition-all active:opacity-70"
          >
            + Add new payout method
          </button>
        </div>

        {/* Terms & Conditions */}
        <div className="px-[24px] pb-[20px]">
          <label className="flex items-start gap-[12px] cursor-pointer group">
            <input
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              className="mt-[2px] w-[20px] h-[20px] rounded-[4px] border-2 border-[#D1D5DB] text-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 transition-all cursor-pointer"
            />
            <span className="text-[#6B7280] text-[13px] leading-[1.5]">
              I agree to the{" "}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/terms-and-conditions");
                }}
                className="text-[#2E7D32] font-medium underline"
              >
                Terms & Conditions
              </button>{" "}
              and understand that payout processing may take 1-3 business days.
            </span>
          </label>
        </div>

        {/* Request Payout Button */}
        <div className="px-[24px] pb-[24px]">
          <button
            onClick={handleRequestPayout}
            disabled={
              !amount ||
              parseFloat(amount) <= 0 ||
              parseFloat(amount) > availableBalance ||
              !agreeToTerms
            }
            className={`w-full py-[16px] rounded-[12px] font-semibold text-[16px] flex items-center justify-center gap-[10px] transition-all ${
              amount &&
              parseFloat(amount) > 0 &&
              parseFloat(amount) <= availableBalance &&
              agreeToTerms
                ? "bg-[#2E7D32] text-white shadow-[0_4px_12px_rgba(46,125,50,0.3)] active:scale-[0.98]"
                : "bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed"
            }`}
          >
            <img
              src={requestPayoutIcon}
              alt=""
              className="w-[20px] h-[20px]"
            />
            Request Payout
          </button>

          {amount && parseFloat(amount) > availableBalance && (
            <p className="text-[#EF4444] text-[13px] mt-[8px] text-center">
              Insufficient balance. Maximum withdrawal: ₱
              {availableBalance.toFixed(2)}
            </p>
          )}
        </div>

        {/* Info Card */}
        <div className="px-[24px] pb-[24px]">
          <div className="bg-[#F3F4F6] rounded-[12px] p-[16px]">
            <h3 className="text-[#111827] text-[14px] font-semibold mb-[8px]">
              Important Information
            </h3>
            <ul className="space-y-[6px] text-[#6B7280] text-[13px]">
              <li className="flex items-start gap-[8px]">
                <span className="text-[#2E7D32] mt-[2px]">•</span>
                <span>
                  Minimum withdrawal amount: ₱500.00
                </span>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#2E7D32] mt-[2px]">•</span>
                <span>
                  Free withdrawals for amounts under ₱1,000
                </span>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#2E7D32] mt-[2px]">•</span>
                <span>
                  ₱15.00 fee for withdrawals over ₱1,000
                </span>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#2E7D32] mt-[2px]">•</span>
                <span>
                  Funds typically arrive within 1-3 business days
                </span>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#2E7D32] mt-[2px]">•</span>
                <span>
                  You'll receive an email confirmation once processed
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] px-[20px] py-[8px] flex-shrink-0">
        <div className="flex items-center justify-between">
          {/* Home */}
          <button
            onClick={() => handleTabChange("home")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <Home
              className={`w-[24px] h-[24px] ${
                activeTab === "home" ? "text-[#2E7D32]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[11px] ${
                activeTab === "home"
                  ? "text-[#2E7D32] font-semibold"
                  : "text-[#9CA3AF]"
              }`}
            >
              Home
            </span>
          </button>

          {/* Bookings */}
          <button
            onClick={() => handleTabChange("bookings")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <Calendar
              className={`w-[24px] h-[24px] ${
                activeTab === "bookings" ? "text-[#2E7D32]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[11px] ${
                activeTab === "bookings"
                  ? "text-[#2E7D32] font-semibold"
                  : "text-[#9CA3AF]"
              }`}
            >
              Bookings
            </span>
          </button>

          {/* Messages */}
          <button
            onClick={() => handleTabChange("messages")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <MessageCircle
              className={`w-[24px] h-[24px] ${
                activeTab === "messages" ? "text-[#2E7D32]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[11px] ${
                activeTab === "messages"
                  ? "text-[#2E7D32] font-semibold"
                  : "text-[#9CA3AF]"
              }`}
            >
              Messages
            </span>
          </button>

          {/* Earnings */}
          <button
            onClick={() => handleTabChange("earnings")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <BarChart3
              className={`w-[24px] h-[24px] ${
                activeTab === "earnings" ? "text-[#2E7D32]" : "text-[#9CA3AF]"
              }`}
              fill={activeTab === "earnings" ? "#2E7D32" : "none"}
            />
            <span
              className={`text-[11px] ${
                activeTab === "earnings"
                  ? "text-[#2E7D32] font-semibold"
                  : "text-[#9CA3AF]"
              }`}
            >
              Earnings
            </span>
          </button>

          {/* More */}
          <button
            onClick={() => handleTabChange("more")}
            className="flex flex-col items-center gap-[4px] py-[4px] px-[12px] transition-all active:scale-90"
          >
            <MoreHorizontal
              className={`w-[24px] h-[24px] ${
                activeTab === "more" ? "text-[#2E7D32]" : "text-[#9CA3AF]"
              }`}
            />
            <span
              className={`text-[11px] ${
                activeTab === "more"
                  ? "text-[#2E7D32] font-semibold"
                  : "text-[#9CA3AF]"
              }`}
            >
              More
            </span>
          </button>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="fixed bottom-0 left-0 right-0 h-[34px] bg-white flex-shrink-0 pointer-events-none">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}