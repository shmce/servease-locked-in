import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ChevronDown, Check } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { StickyFooterButton } from "../components/StickyFooterButton";

const BANKS = [
  "BDO Unibank",
  "BPI (Bank of the Philippine Islands)",
  "Metrobank",
  "Landbank of the Philippines",
  "PNB (Philippine National Bank)",
  "Security Bank",
  "Unionbank",
  "RCBC (Rizal Commercial Banking Corporation)",
  "Chinabank",
  "EastWest Bank",
  "UCPB (United Coconut Planters Bank)",
  "Asia United Bank",
  "CTBC Bank",
  "Maybank",
  "Philippine Bank of Communications",
  "Other",
];

export default function ProviderAddPaymentMethod() {
  const navigate = useNavigate();
  
  const [payoutMethod, setPayoutMethod] = useState<"bank" | "gcash" | "paymaya">("bank");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState<"savings" | "checking">("savings");
  const [branch, setBranch] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileNumberTouched, setMobileNumberTouched] = useState(false);
  const [setPrimary, setSetPrimary] = useState(false);
  const [payoutSchedule, setPayoutSchedule] = useState<"weekly" | "biweekly">("weekly");
  
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  const handleMobileNumberChange = (value: string) => {
    // Only allow digits, max 10, auto-strip leading "0"
    let digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.startsWith("0")) {
      digitsOnly = digitsOnly.slice(1);
    }
    digitsOnly = digitsOnly.slice(0, 10);
    setMobileNumber(digitsOnly);
  };

  const mobileNumberStartError =
    mobileNumber.length > 0 && !mobileNumber.startsWith("9");

  const handleContinue = () => {
    // Navigate to Service Configuration page
    navigate("/provider/service-config");
  };

  const isFormValid = () => {
    if (payoutMethod === "bank") {
      return (
        bankName !== "" &&
        accountName !== "" &&
        accountNumber !== "" &&
        branch !== ""
      );
    } else {
      return (
        mobileNumber.length === 10 &&
        mobileNumber.startsWith("9") &&
        accountName !== ""
      );
    }
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Top Navigation Bar */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0">
        <button
          onClick={() => navigate("/provider/setup-profile")}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Add Payout Method
          </h2>
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF]">
            2 of 5
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-[4px] bg-[#e5e5e5] flex-shrink-0">
        <div className="h-full bg-[#56C490] transition-all duration-300" style={{ width: "40%" }} />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[120px]">
        <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] leading-[1.2] mt-[24px] mb-[8px]">
          Set Up Your Payout Method
        </h1>
        <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.5] mb-[32px]">
          Choose how you'd like to receive your earnings from completed services.
        </p>

        {/* Payout Method Selector */}
        <div className="mb-[24px]">
          <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[12px] block">
            Payout Method <span className="text-[#ff4444]">*</span>
          </label>
          <div className="space-y-[12px]">
            {/* Bank Transfer Radio */}
            <button
              onClick={() => setPayoutMethod("bank")}
              className={`w-full px-[16px] py-[14px] border-2 rounded-[12px] flex items-center gap-[12px] transition-all ${
                payoutMethod === "bank"
                  ? "border-[#56C490] bg-[#56C490]/5"
                  : "border-[#e5e5e5] bg-white"
              }`}
            >
              <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-all ${
                payoutMethod === "bank"
                  ? "border-[#56C490] bg-white"
                  : "border-[#e5e5e5] bg-white"
              }`}>
                {payoutMethod === "bank" && (
                  <div className="w-[10px] h-[10px] rounded-full bg-[#56C490]" />
                )}
              </div>
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                Bank Transfer
              </span>
            </button>

            {/* GCash Radio */}
            <button
              onClick={() => setPayoutMethod("gcash")}
              className={`w-full px-[16px] py-[14px] border-2 rounded-[12px] flex items-center gap-[12px] transition-all ${
                payoutMethod === "gcash"
                  ? "border-[#56C490] bg-[#56C490]/5"
                  : "border-[#e5e5e5] bg-white"
              }`}
            >
              <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-all ${
                payoutMethod === "gcash"
                  ? "border-[#56C490] bg-white"
                  : "border-[#e5e5e5] bg-white"
              }`}>
                {payoutMethod === "gcash" && (
                  <div className="w-[10px] h-[10px] rounded-full bg-[#56C490]" />
                )}
              </div>
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                GCash
              </span>
            </button>

            {/* PayMaya Radio */}
            <button
              onClick={() => setPayoutMethod("paymaya")}
              className={`w-full px-[16px] py-[14px] border-2 rounded-[12px] flex items-center gap-[12px] transition-all ${
                payoutMethod === "paymaya"
                  ? "border-[#56C490] bg-[#56C490]/5"
                  : "border-[#e5e5e5] bg-white"
              }`}
            >
              <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-all ${
                payoutMethod === "paymaya"
                  ? "border-[#56C490] bg-white"
                  : "border-[#e5e5e5] bg-white"
              }`}>
                {payoutMethod === "paymaya" && (
                  <div className="w-[10px] h-[10px] rounded-full bg-[#56C490]" />
                )}
              </div>
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                PayMaya
              </span>
            </button>
          </div>
        </div>

        {/* Bank Transfer Fields */}
        {payoutMethod === "bank" && (
          <div className="space-y-[20px]">
            {/* Bank Name Dropdown */}
            <div className="relative">
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Bank Name <span className="text-[#ff4444]">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowBankDropdown(!showBankDropdown)}
                className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-left flex items-center justify-between transition-all ${
                  showBankDropdown ? "border-[#56C490] bg-white" : "border-transparent"
                }`}
              >
                <span className={bankName ? "text-[#1a1a1a]" : "text-[#9CA3AF]"}>
                  {bankName || "Select your bank"}
                </span>
                <ChevronDown
                  className={`w-[20px] h-[20px] text-[#666] transition-transform ${
                    showBankDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showBankDropdown && (
                <div className="absolute top-full left-0 right-0 mt-[8px] bg-white border-2 border-[#56C490] rounded-[12px] shadow-lg z-10 overflow-hidden max-h-[280px] overflow-y-auto">
                  {BANKS.map((bank) => (
                    <button
                      key={bank}
                      onClick={() => {
                        setBankName(bank);
                        setShowBankDropdown(false);
                      }}
                      className={`w-full px-[16px] py-[12px] font-['Nunito',sans-serif] text-[14px] text-left transition-all ${
                        bankName === bank
                          ? "bg-[#56C490]/10 text-[#56C490]"
                          : "text-[#1a1a1a] hover:bg-[#f5f5f5]"
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Account Name */}
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Account Name <span className="text-[#ff4444]">*</span>
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter account holder name"
                className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Account Number <span className="text-[#ff4444]">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter account number"
                className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
              />
            </div>

            {/* Account Type */}
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[12px] block">
                Account Type <span className="text-[#ff4444]">*</span>
              </label>
              <div className="flex gap-[12px]">
                <button
                  onClick={() => setAccountType("savings")}
                  className={`flex-1 px-[16px] py-[14px] border-2 rounded-[12px] flex items-center justify-center gap-[8px] transition-all ${
                    accountType === "savings"
                      ? "border-[#56C490] bg-[#56C490]/5"
                      : "border-[#e5e5e5] bg-white"
                  }`}
                >
                  <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-all ${
                    accountType === "savings"
                      ? "border-[#56C490] bg-white"
                      : "border-[#e5e5e5] bg-white"
                  }`}>
                    {accountType === "savings" && (
                      <div className="w-[10px] h-[10px] rounded-full bg-[#56C490]" />
                    )}
                  </div>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                    Savings
                  </span>
                </button>

                <button
                  onClick={() => setAccountType("checking")}
                  className={`flex-1 px-[16px] py-[14px] border-2 rounded-[12px] flex items-center justify-center gap-[8px] transition-all ${
                    accountType === "checking"
                      ? "border-[#56C490] bg-[#56C490]/5"
                      : "border-[#e5e5e5] bg-white"
                  }`}
                >
                  <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-all ${
                    accountType === "checking"
                      ? "border-[#56C490] bg-white"
                      : "border-[#e5e5e5] bg-white"
                  }`}>
                    {accountType === "checking" && (
                      <div className="w-[10px] h-[10px] rounded-full bg-[#56C490]" />
                    )}
                  </div>
                  <span className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                    Checking
                  </span>
                </button>
              </div>
            </div>

            {/* Branch */}
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Branch <span className="text-[#ff4444]">*</span>
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Enter branch name or location"
                className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
              />
            </div>
          </div>
        )}

        {/* E-wallet Fields (GCash or PayMaya) */}
        {(payoutMethod === "gcash" || payoutMethod === "paymaya") && (
          <div className="space-y-[20px]">
            {/* Mobile Number */}
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Mobile Number <span className="text-[#ff4444]">*</span>
              </label>
              <div
                className={`flex items-center w-full bg-[#f5f5f5] border-2 rounded-[12px] transition-all ${
                  mobileNumberStartError
                    ? "border-[#EF4444]"
                    : "border-transparent focus-within:border-[#56C490] focus-within:bg-white"
                }`}
              >
                <span className="font-['Nunito',sans-serif] text-[14px] text-[#9CA3AF] pl-[16px] pr-[12px] select-none pointer-events-none">
                  +63
                </span>
                <div className="w-[1px] h-[24px] bg-[#ccc] flex-shrink-0" />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={mobileNumber}
                  onChange={(e) => {
                    handleMobileNumberChange(e.target.value);
                    setMobileNumberTouched(true);
                  }}
                  placeholder="9XX XXX XXXX"
                  className="flex-1 px-[12px] py-[14px] bg-transparent font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none"
                />
              </div>
              {mobileNumberStartError ? (
                <p className="font-['Nunito',sans-serif] text-[12px] text-[#EF4444] mt-[6px]">
                  Mobile number must start with 9
                </p>
              ) : (
                <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mt-[6px]">
                  Philippine mobile number (e.g. 9171234567)
                </p>
              )}
            </div>

            {/* Account Name */}
            <div>
              <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
                Account Name <span className="text-[#ff4444]">*</span>
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter account holder name"
                className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
              />
            </div>

            {/* Set as Primary Checkbox */}
            <div>
              <button
                onClick={() => setSetPrimary(!setPrimary)}
                className="flex items-center gap-[12px] transition-all active:scale-95"
              >
                <div className={`w-[20px] h-[20px] rounded-[6px] border-2 flex items-center justify-center transition-all ${
                  setPrimary
                    ? "border-[#56C490] bg-white"
                    : "border-[#e5e5e5] bg-white"
                }`}>
                  {setPrimary && (
                    <Check className="w-[14px] h-[14px] text-[#56C490]" strokeWidth={3} />
                  )}
                </div>
                <span className="font-['Nunito',sans-serif] text-[14px] text-[#374151]">
                  Set as primary payout method
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Payout Schedule */}
        <div className="mt-[24px]">
          <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[12px] block">
            Payout Schedule <span className="text-[#ff4444]">*</span>
          </label>
          <div className="flex gap-[12px]">
            <button
              onClick={() => setPayoutSchedule("weekly")}
              className={`flex-1 px-[16px] py-[14px] border-2 rounded-[12px] flex items-center justify-center gap-[8px] transition-all ${
                payoutSchedule === "weekly"
                  ? "border-[#56C490] bg-[#56C490]/5"
                  : "border-[#e5e5e5] bg-white"
              }`}
            >
              <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-all ${
                payoutSchedule === "weekly"
                  ? "border-[#56C490] bg-white"
                  : "border-[#e5e5e5] bg-white"
              }`}>
                {payoutSchedule === "weekly" && (
                  <div className="w-[10px] h-[10px] rounded-full bg-[#56C490]" />
                )}
              </div>
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                Weekly
              </span>
            </button>

            <button
              onClick={() => setPayoutSchedule("biweekly")}
              className={`flex-1 px-[16px] py-[14px] border-2 rounded-[12px] flex items-center justify-center gap-[8px] transition-all ${
                payoutSchedule === "biweekly"
                  ? "border-[#56C490] bg-[#56C490]/5"
                  : "border-[#e5e5e5] bg-white"
              }`}
            >
              <div className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-all ${
                payoutSchedule === "biweekly"
                  ? "border-[#56C490] bg-white"
                  : "border-[#e5e5e5] bg-white"
              }`}>
                {payoutSchedule === "biweekly" && (
                  <div className="w-[10px] h-[10px] rounded-full bg-[#56C490]" />
                )}
              </div>
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a]">
                Bi-weekly
              </span>
            </button>
          </div>
          <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] mt-[8px]">
            {payoutSchedule === "weekly"
              ? "Earnings are processed every Monday for the previous week"
              : "Earnings are processed on the 1st and 15th of each month"}
          </p>
        </div>

        {/* Security Notice */}
        <div className="mt-[24px] bg-[#EFF6FF] border border-[#BFDBFE] p-[16px] rounded-[12px]">
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#1E40AF] leading-[1.6]">
            🔒 Your payout information is encrypted and secure. You can update this anytime in Settings.
          </p>
        </div>
      </div>

      {/* Sticky Footer Button */}
      <StickyFooterButton
        label="Continue"
        onClick={handleContinue}
        disabled={!isFormValid()}
      />
    </div>
  );
}