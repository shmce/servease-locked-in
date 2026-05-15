import { useState, startTransition } from "react";
import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { BackButton } from "../components/BackButton";
import {
  Home,
  Calendar,
  MessageCircle,
  MoreHorizontal,
  ChevronRight,
  User,
  DollarSign,
  MapPin,
  Clock,
  CreditCard,
  Bell,
  Mail,
  Smartphone,
  Lock,
  ShieldCheck,
  Activity,
  Eye,
  Globe,
  Coins,
  Ruler,
  Moon,
  FileText,
  HelpCircle,
  Headphones,
  Users,
  LogOut,
  Trash2
} from "lucide-react";

export default function ProviderSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("more");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Toggle states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    navigate("/auth-gate", { replace: true });
  };

  const handleDeleteAccount = () => {
    // In production, this would call an API
    setShowDeleteModal(false);
    sessionStorage.clear();
    localStorage.clear();
    navigate("/auth-gate", { replace: true });
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* Fixed iOS Status Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex-shrink-0">
        <StatusBar />
      </div>

      {/* Fixed Header */}
      <div className="fixed top-[47px] left-0 right-0 z-40 bg-white px-[24px] pt-[16px] pb-[16px] flex items-center gap-[16px] border-b border-[#E5E7EB] flex-shrink-0">
        <BackButton />
        <h1 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
          Settings
        </h1>
      </div>

      {/* Scrollable Content */}
      <div className="mt-[111px] mb-[147px] overflow-y-scroll">
        {/* Account Section */}
        <div className="px-[24px] py-[20px] border-b border-[#E5E7EB]">
          <h2 className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[16px] uppercase tracking-[0.5px]">
            Account
          </h2>
          <div className="space-y-[2px]">
            <button 
              onClick={() => startTransition(() => navigate("/provider/edit-profile/advanced"))}
              className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]"
            >
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <User className="w-[20px] h-[20px] text-[#00C16A]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Edit Profile
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-[20px] h-[20px] text-[#00C16A]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Services & Pricing
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            <button 
              onClick={() => startTransition(() => navigate("/provider/manage-addresses"))}
              className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]"
            >
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-[20px] h-[20px] text-[#00C16A]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Manage Addresses
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <Clock className="w-[20px] h-[20px] text-[#00C16A]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Availability
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            <button 
              onClick={() => startTransition(() => navigate("/provider/add-payment-method"))}
              className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]"
            >
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-[20px] h-[20px] text-[#00C16A]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Payment Methods
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="px-[24px] py-[20px] border-b border-[#E5E7EB]">
          <h2 className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[16px] uppercase tracking-[0.5px]">
            Notifications
          </h2>
          <div className="space-y-[2px]">
            <div className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <Bell className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Push Notifications
              </span>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`relative w-[48px] h-[28px] rounded-full transition-all ${
                  pushNotifications ? "bg-[#56C490]" : "bg-[#E5E7EB]"
                }`}
              >
                <div
                  className={`absolute top-[2px] w-[24px] h-[24px] rounded-full bg-white shadow-sm transition-all ${
                    pushNotifications ? "right-[2px]" : "left-[2px]"
                  }`}
                />
              </button>
            </div>

            <div className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                SMS Notifications
              </span>
              <button
                onClick={() => setSmsNotifications(!smsNotifications)}
                className={`relative w-[48px] h-[28px] rounded-full transition-all ${
                  smsNotifications ? "bg-[#56C490]" : "bg-[#E5E7EB]"
                }`}
              >
                <div
                  className={`absolute top-[2px] w-[24px] h-[24px] rounded-full bg-white shadow-sm transition-all ${
                    smsNotifications ? "right-[2px]" : "left-[2px]"
                  }`}
                />
              </button>
            </div>

            <div className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <Mail className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Email Notifications
              </span>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative w-[48px] h-[28px] rounded-full transition-all ${
                  emailNotifications ? "bg-[#56C490]" : "bg-[#E5E7EB]"
                }`}
              >
                <div
                  className={`absolute top-[2px] w-[24px] h-[24px] rounded-full bg-white shadow-sm transition-all ${
                    emailNotifications ? "right-[2px]" : "left-[2px]"
                  }`}
                />
              </button>
            </div>

            <button 
              onClick={() => startTransition(() => navigate("/provider/notification-preferences"))}
              className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB] mt-[8px]"
            >
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <Bell className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#56C490]">
                Advanced Notification Preferences
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#56C490]" />
            </button>
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className="px-[24px] py-[20px] border-b border-[#E5E7EB]">
          <h2 className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[16px] uppercase tracking-[0.5px]">
            Privacy & Security
          </h2>
          <div className="space-y-[2px]">
            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <Lock className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Change Password
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-['Inter',sans-serif] text-[14px] text-[#111827]">
                  Two-Factor Authentication
                </p>
                <p className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] mt-[2px]">
                  Status: {twoFactorAuth ? "On" : "Off"}
                </p>
              </div>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <Activity className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Login Activity
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <Eye className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Privacy Settings
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>
          </div>
        </div>

        {/* App Preferences Section */}
        <div className="px-[24px] py-[20px] border-b border-[#E5E7EB]">
          <h2 className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[16px] uppercase tracking-[0.5px]">
            App Preferences
          </h2>
          <div className="space-y-[2px]">
            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <Globe className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-['Inter',sans-serif] text-[14px] text-[#111827]">
                  Language
                </p>
                <p className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] mt-[2px]">
                  English
                </p>
              </div>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <Coins className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-['Inter',sans-serif] text-[14px] text-[#111827]">
                  Currency
                </p>
                <p className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] mt-[2px]">
                  PHP (₱)
                </p>
              </div>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <Ruler className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-['Inter',sans-serif] text-[14px] text-[#111827]">
                  Distance Unit
                </p>
                <p className="font-['Inter',sans-serif] text-[12px] text-[#6B7280] mt-[2px]">
                  Kilometers
                </p>
              </div>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            <div className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <Moon className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Dark Mode
              </span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-[48px] h-[28px] rounded-full transition-all ${
                  darkMode ? "bg-[#56C490]" : "bg-[#E5E7EB]"
                }`}
              >
                <div
                  className={`absolute top-[2px] w-[24px] h-[24px] rounded-full bg-white shadow-sm transition-all ${
                    darkMode ? "right-[2px]" : "left-[2px]"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Legal & Support Section */}
        <div className="px-[24px] py-[20px] border-b border-[#E5E7EB]">
          <h2 className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[16px] uppercase tracking-[0.5px]">
            Legal & Support
          </h2>
          <div className="space-y-[2px]">
            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <FileText className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Provider Agreement
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            <button 
              onClick={() => startTransition(() => navigate("/terms-and-conditions"))}
              className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]"
            >
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <FileText className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Terms & Conditions
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            <button 
              onClick={() => startTransition(() => navigate("/privacy-policy"))}
              className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]"
            >
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <FileText className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Privacy Policy
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            <button 
              onClick={() => startTransition(() => navigate("/provider/help-support"))}
              className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]"
            >
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Help Center
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <Headphones className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Contact Support
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>

            <button className="w-full flex items-center gap-[16px] p-[14px] rounded-[8px] transition-all active:scale-[0.98] hover:bg-[#F9FAFB]">
              <div className="w-[40px] h-[40px] rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
                <Users className="w-[20px] h-[20px] text-[#56C490]" />
              </div>
              <span className="flex-1 text-left font-['Inter',sans-serif] text-[14px] text-[#111827]">
                Provider Community
              </span>
              <ChevronRight className="w-[20px] h-[20px] text-[#9CA3AF]" />
            </button>
          </div>
        </div>

        {/* Account Actions Section */}
        <div className="px-[24px] py-[20px]">
          <h2 className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mb-[16px] uppercase tracking-[0.5px]">
            Account Actions
          </h2>
          <div className="space-y-[12px]">
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="w-full bg-[#FEE2E2] flex items-center justify-center gap-[8px] py-[14px] rounded-[12px] transition-all active:scale-95 hover:bg-[#FECACA]"
            >
              <LogOut className="w-[20px] h-[20px] text-[#DC2626]" />
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#DC2626]">
                Log Out
              </span>
            </button>

            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-center"
            >
              <span className="font-['Nunito',sans-serif] text-[14px] text-[#DC2626] underline">
                Delete Account
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white relative flex-shrink-0 z-30">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}