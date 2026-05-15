import { useState } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, Gift, Copy, Send, Mail, MessageSquare, Check, Users, TrendingUp, Award } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

export default function CustomerReferral() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const referralCode = "MARIA2026";
  const referralLink = `https://servease.app/join/${referralCode}`;

  const stats = {
    totalInvitesSent: 8,
    successfulReferrals: 5,
    creditsEarned: 1000,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const message = `Join ServEase and get ₱200 credit! Use my referral code: ${referralCode}`;
    
    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(message + " " + referralLink)}`, "_blank");
        break;
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, "_blank");
        break;
      case "messenger":
        window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(referralLink)}&app_id=YOUR_APP_ID`, "_blank");
        break;
      case "sms":
        window.location.href = `sms:?body=${encodeURIComponent(message + " " + referralLink)}`;
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent("Join ServEase!")}&body=${encodeURIComponent(message + " " + referralLink)}`;
        break;
    }
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Top Navigation Bar */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0 border-b border-[#e5e5e5]">
        <button
          onClick={() => navigate(-1)}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <div className="flex-1">
          <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
            Invite Friends
          </h2>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[120px]">
        <div className="pt-[24px]">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-[#56C490] to-[#00a055] rounded-[16px] p-[24px] mb-[24px]">
            <div className="flex items-center justify-center mb-[16px]">
              <div className="w-[72px] h-[72px] rounded-full bg-white/20 flex items-center justify-center">
                <Gift className="w-[36px] h-[36px] text-white" />
              </div>
            </div>
            <h3 className="font-['Nunito',sans-serif] text-[22px] text-white text-center mb-[12px]">
              Share the Love, Earn Together!
            </h3>
            <p className="font-['Nunito',sans-serif] text-[14px] text-white/90 text-center leading-[1.6] mb-[20px]">
              Invite your friends to ServEase and you'll both get rewarded
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-[12px]">
              <div className="bg-white/10 backdrop-blur-sm rounded-[12px] p-[16px] border border-white/20">
                <p className="font-['Nunito',sans-serif] text-[12px] text-white/80 mb-[4px]">
                  You get
                </p>
                <p className="font-['Nunito',sans-serif] text-[20px] text-white">
                  ₱200 credit
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-[12px] p-[16px] border border-white/20">
                <p className="font-['Nunito',sans-serif] text-[12px] text-white/80 mb-[4px]">
                  Friend gets
                </p>
                <p className="font-['Nunito',sans-serif] text-[20px] text-white">
                  ₱200 credit
                </p>
              </div>
            </div>
          </div>

          {/* Referral Code */}
          <div className="bg-[#f5f5f5] rounded-[16px] p-[24px] mb-[24px] border border-[#e5e5e5]">
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[12px] text-center">
              Your Referral Code
            </p>
            <div className="bg-white border-2 border-dashed border-[#56C490] rounded-[12px] p-[20px] mb-[16px]">
              <p className="font-['Nunito',sans-serif] text-[36px] text-[#56C490] text-center tracking-[2px]">
                {referralCode}
              </p>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="w-full h-[48px] rounded-[12px] bg-[#56C490] flex items-center justify-center gap-[8px] transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-[20px] h-[20px] text-white" />
                  <span className="font-['Nunito',sans-serif] text-[14px] text-white">
                    Link Copied!
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-[20px] h-[20px] text-white" />
                  <span className="font-['Nunito',sans-serif] text-[14px] text-white">
                    Copy Link
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Share Buttons */}
          <div className="mb-[24px]">
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px] px-[24px]">
              Share via
            </h3>
            <div className="grid grid-cols-3 gap-[12px]">
              <button
                onClick={() => handleShare("whatsapp")}
                className="bg-[#f5f5f5] rounded-[12px] p-[16px] flex flex-col items-center gap-[8px] transition-all active:scale-95 border border-[#e5e5e5]"
              >
                <div className="w-[48px] h-[48px] rounded-full bg-[#25D366] flex items-center justify-center">
                  <MessageSquare className="w-[24px] h-[24px] text-white" />
                </div>
                <span className="font-['Nunito',sans-serif] text-[12px] text-[#374151]">
                  WhatsApp
                </span>
              </button>

              <button
                onClick={() => handleShare("facebook")}
                className="bg-[#f5f5f5] rounded-[12px] p-[16px] flex flex-col items-center gap-[8px] transition-all active:scale-95 border border-[#e5e5e5]"
              >
                <div className="w-[48px] h-[48px] rounded-full bg-[#1877F2] flex items-center justify-center">
                  <svg className="w-[24px] h-[24px] text-white fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="font-['Nunito',sans-serif] text-[12px] text-[#374151]">
                  Facebook
                </span>
              </button>

              <button
                onClick={() => handleShare("messenger")}
                className="bg-[#f5f5f5] rounded-[12px] p-[16px] flex flex-col items-center gap-[8px] transition-all active:scale-95 border border-[#e5e5e5]"
              >
                <div className="w-[48px] h-[48px] rounded-full bg-[#00B2FF] flex items-center justify-center">
                  <Send className="w-[24px] h-[24px] text-white" />
                </div>
                <span className="font-['Nunito',sans-serif] text-[12px] text-[#374151]">
                  Messenger
                </span>
              </button>

              <button
                onClick={() => handleShare("sms")}
                className="bg-[#f5f5f5] rounded-[12px] p-[16px] flex flex-col items-center gap-[8px] transition-all active:scale-95 border border-[#e5e5e5]"
              >
                <div className="w-[48px] h-[48px] rounded-full bg-[#56C490] flex items-center justify-center">
                  <MessageSquare className="w-[24px] h-[24px] text-white" />
                </div>
                <span className="font-['Nunito',sans-serif] text-[12px] text-[#374151]">
                  SMS
                </span>
              </button>

              <button
                onClick={() => handleShare("email")}
                className="bg-[#f5f5f5] rounded-[12px] p-[16px] flex flex-col items-center gap-[8px] transition-all active:scale-95 border border-[#e5e5e5]"
              >
                <div className="w-[48px] h-[48px] rounded-full bg-[#EA4335] flex items-center justify-center">
                  <Mail className="w-[24px] h-[24px] text-white" />
                </div>
                <span className="font-['Nunito',sans-serif] text-[12px] text-[#374151]">
                  Email
                </span>
              </button>

              <button
                onClick={handleCopy}
                className="bg-[#f5f5f5] rounded-[12px] p-[16px] flex flex-col items-center gap-[8px] transition-all active:scale-95 border border-[#e5e5e5]"
              >
                <div className="w-[48px] h-[48px] rounded-full bg-[#6B7280] flex items-center justify-center">
                  <Copy className="w-[24px] h-[24px] text-white" />
                </div>
                <span className="font-['Nunito',sans-serif] text-[12px] text-[#374151]">
                  Copy Link
                </span>
              </button>
            </div>
          </div>

          {/* Referral Stats */}
          <div className="mb-[24px]">
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px] px-[24px]">
              Your Referral Stats
            </h3>
            <div className="grid grid-cols-3 gap-[12px]">
              <div className="bg-[#f5f5f5] rounded-[12px] p-[16px] text-center border border-[#e5e5e5]">
                <div className="w-[40px] h-[40px] rounded-full bg-[#56C490]/10 flex items-center justify-center mx-auto mb-[8px]">
                  <Send className="w-[20px] h-[20px] text-[#56C490]" />
                </div>
                <p className="font-['Nunito',sans-serif] text-[20px] text-[#111827]">
                  {stats.totalInvitesSent}
                </p>
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280] mt-[4px]">
                  Total Invites
                </p>
              </div>

              <div className="bg-[#f5f5f5] rounded-[12px] p-[16px] text-center border border-[#e5e5e5]">
                <div className="w-[40px] h-[40px] rounded-full bg-[#56C490]/10 flex items-center justify-center mx-auto mb-[8px]">
                  <Users className="w-[20px] h-[20px] text-[#56C490]" />
                </div>
                <p className="font-['Nunito',sans-serif] text-[20px] text-[#111827]">
                  {stats.successfulReferrals}
                </p>
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280] mt-[4px]">
                  Successful
                </p>
              </div>

              <div className="bg-[#f5f5f5] rounded-[12px] p-[16px] text-center border border-[#e5e5e5]">
                <div className="w-[40px] h-[40px] rounded-full bg-[#56C490]/10 flex items-center justify-center mx-auto mb-[8px]">
                  <Award className="w-[20px] h-[20px] text-[#56C490]" />
                </div>
                <p className="font-['Nunito',sans-serif] text-[20px] text-[#56C490]">
                  ₱{stats.creditsEarned}
                </p>
                <p className="font-['Nunito',sans-serif] text-[11px] text-[#6B7280] mt-[4px]">
                  Credits Earned
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-[#f5f5f5] rounded-[16px] p-[24px] border border-[#e5e5e5]">
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
              How It Works
            </h3>
            <div className="space-y-[16px]">
              <div className="flex gap-[16px]">
                <div className="w-[32px] h-[32px] rounded-full bg-[#56C490] flex items-center justify-center flex-shrink-0">
                  <span className="font-['Nunito',sans-serif] text-[14px] text-white">
                    1
                  </span>
                </div>
                <div className="flex-1 pt-[4px]">
                  <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[4px]">
                    Share Your Code
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.6]">
                    Send your unique referral code to friends and family
                  </p>
                </div>
              </div>

              <div className="flex gap-[16px]">
                <div className="w-[32px] h-[32px] rounded-full bg-[#56C490] flex items-center justify-center flex-shrink-0">
                  <span className="font-['Nunito',sans-serif] text-[14px] text-white">
                    2
                  </span>
                </div>
                <div className="flex-1 pt-[4px]">
                  <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[4px]">
                    They Sign Up
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.6]">
                    Your friend registers using your code and verifies their account
                  </p>
                </div>
              </div>

              <div className="flex gap-[16px]">
                <div className="w-[32px] h-[32px] rounded-full bg-[#56C490] flex items-center justify-center flex-shrink-0">
                  <span className="font-['Nunito',sans-serif] text-[14px] text-white">
                    3
                  </span>
                </div>
                <div className="flex-1 pt-[4px]">
                  <p className="font-['Nunito',sans-serif] text-[14px] text-[#111827] mb-[4px]">
                    Both Get Rewarded
                  </p>
                  <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.6]">
                    You both receive ₱200 credit when they book their first service
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-[24px]">
            <p className="font-['Nunito',sans-serif] text-[12px] text-[#9CA3AF] text-center leading-[1.6]">
              Referral credits are applied after your friend completes their first booking. Terms and conditions apply.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Home Indicator — iOS Safe Area */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}
