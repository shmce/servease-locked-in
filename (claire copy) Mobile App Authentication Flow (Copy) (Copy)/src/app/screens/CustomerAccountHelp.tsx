import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { ArrowLeft, ChevronRight, User, Lock, Bell, Settings, Mail, Phone, UserX, Trash2, CheckCircle, Edit3, Globe, Camera } from "lucide-react";
import { BottomNavigation } from "../components/BottomNavigation";

export default function CustomerAccountHelp() {
  const navigate = useNavigate();

  const helpArticles = [
    {
      id: 1,
      icon: Edit3,
      iconColor: "#8B5CF6",
      iconBg: "#8B5CF6",
      title: "How to Update Profile Information",
      description: "Edit your name, bio, address, and other personal details",
      content: "Learn how to access and modify your profile information in settings"
    },
    {
      id: 2,
      icon: Lock,
      iconColor: "#EF4444",
      iconBg: "#EF4444",
      title: "How to Reset Password",
      description: "Change or recover your account password securely",
      content: "Step-by-step guide to reset password using phone verification"
    },
    {
      id: 3,
      icon: Bell,
      iconColor: "#F59E0B",
      iconBg: "#F59E0B",
      title: "Managing Notifications",
      description: "Control what alerts and updates you receive from ServEase",
      content: "Customize push notifications, email alerts, and SMS preferences"
    },
    {
      id: 4,
      icon: Settings,
      iconColor: "#3B82F6",
      iconBg: "#3B82F6",
      title: "Changing Account Settings",
      description: "Adjust your account preferences and privacy options",
      content: "Explore all available settings including language, privacy, and more"
    },
    {
      id: 5,
      icon: Mail,
      iconColor: "#10B981",
      iconBg: "#10B981",
      title: "Updating Email Address",
      description: "Change the email associated with your ServEase account",
      content: "Verify your new email and ensure account security during the change"
    },
    {
      id: 6,
      icon: Phone,
      iconColor: "#EC4899",
      iconBg: "#EC4899",
      title: "Changing Phone Number",
      description: "Update your contact number for login and verification",
      content: "Switch to a new phone number with SMS verification steps"
    },
    {
      id: 7,
      icon: CheckCircle,
      iconColor: "#56C490",
      iconBg: "#56C490",
      title: "Account Verification Process",
      description: "Understanding identity verification and badges",
      content: "Learn how to verify your account and earn trust badges"
    },
    {
      id: 8,
      icon: Camera,
      iconColor: "#06B6D4",
      iconBg: "#06B6D4",
      title: "Uploading and Changing Profile Photo",
      description: "Add or update your account profile picture",
      content: "Best practices for profile photos and image requirements"
    },
    {
      id: 9,
      icon: Globe,
      iconColor: "#F97316",
      iconBg: "#F97316",
      title: "Language and Region Settings",
      description: "Change your preferred language and location preferences",
      content: "Select language, currency, and timezone for your account"
    },
    {
      id: 10,
      icon: User,
      iconColor: "#14B8A6",
      iconBg: "#14B8A6",
      title: "Switching Between Customer and Provider Accounts",
      description: "Managing multiple account types on ServEase",
      content: "How to register as a provider or switch account modes"
    },
    {
      id: 11,
      icon: UserX,
      iconColor: "#A855F7",
      iconBg: "#A855F7",
      title: "Deactivating Your Account Temporarily",
      description: "Pause your account without deleting your data",
      content: "Take a break from ServEase while keeping your information saved"
    },
    {
      id: 12,
      icon: Trash2,
      iconColor: "#DC2626",
      iconBg: "#DC2626",
      title: "Deleting Your Account Permanently",
      description: "Remove your ServEase account and all associated data",
      content: "Understand what happens when you delete your account permanently"
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
          Account Help
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-[100px]">
        <div className="px-[24px] py-[20px]">
          {/* Introduction */}
          <div className="bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] rounded-[16px] p-[20px] mb-[24px]">
            <h2 className="font-['Nunito',sans-serif] text-[20px] text-white mb-[8px]">
              Manage Your Account ⚙️
            </h2>
            <p className="font-['Nunito',sans-serif] text-[14px] text-white/90 leading-[1.5]">
              Learn how to update your profile, change settings, manage notifications, and control your ServEase account.
            </p>
          </div>

          {/* Help Articles */}
          <div className="mb-[24px]">
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[16px]">
              Account Guides
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

          {/* Account Management Tips */}
          <div className="bg-[#F9FAFB] rounded-[16px] p-[20px] border border-[#E5E7EB]">
            <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#111827] mb-[12px]">
              Account Tips 💡
            </h3>
            <ul className="space-y-[8px]">
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Keep your profile information up to date for better service experiences
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Use a strong password and enable two-factor authentication
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Verify your email and phone number to unlock all features
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Review your notification settings to stay informed without overwhelm
                </p>
              </li>
              <li className="flex items-start gap-[8px]">
                <span className="text-[#56C490] mt-[2px]">✓</span>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#6B7280] leading-[1.5]">
                  Add a professional profile photo to build trust with providers
                </p>
              </li>
            </ul>
          </div>

          {/* Still Need Help Section */}
          <div className="mt-[24px] text-center">
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[12px]">
              Need help with your account?
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
