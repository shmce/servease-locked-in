import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, User, Settings, HelpCircle, FileText, LogOut, X, History } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { BottomNavigation } from "../components/BottomNavigation";

export default function CustomerMore() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    // Clear any auth state here if needed
    navigate("/auth-gate");
  };

  const menuItems = [
    { id: 1, icon: User, label: "My Profile", route: "/customer/profile" },
    { id: 2, icon: History, label: "Service History", route: "/customer/service-history" },
    { id: 3, icon: Settings, label: "Settings", route: "/customer/settings" },
    { id: 4, icon: HelpCircle, label: "Help & Support", route: "/customer/help" },
    { id: 5, icon: FileText, label: "Terms & Privacy", route: "/customer/terms" },
  ];

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
        <h2 className="font-['Nunito',sans-serif] text-[17px] text-[#1a1a1a]">
          More
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[120px]">
        {/* Profile Section */}
        <div className="mt-[24px] mb-[32px] flex items-center gap-[16px]">
          <div className="w-[64px] h-[64px] rounded-full bg-gradient-to-br from-[#56C490] to-[#00a055] flex items-center justify-center">
            <span className="font-['Nunito',sans-serif] text-[28px] text-white">
              K
            </span>
          </div>
          <div>
            <h3 className="font-['Nunito',sans-serif] text-[18px] text-[#1a1a1a] mb-[4px]">
              Kisshia
            </h3>
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#666]">
              kisshia@example.com
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-[12px] mb-[32px]">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.route)}
              className="w-full flex items-center gap-[16px] p-[16px] bg-[#f5f5f5] rounded-[12px] transition-all active:scale-95"
            >
              <item.icon className="w-[24px] h-[24px] text-[#1a1a1a]" />
              <span className="font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] flex-1 text-left">
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-[12px] p-[16px] bg-red-50 rounded-[12px] transition-all active:scale-95"
        >
          <LogOut className="w-[24px] h-[24px] text-red-500" />
          <span className="font-['Nunito',sans-serif] text-[15px] text-red-500">
            Log out
          </span>
        </button>

        {/* App Version */}
        <p className="text-center font-['Nunito',sans-serif] text-[12px] text-[#999] mt-[32px]">
          ServEase v1.0.0
        </p>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-[24px]">
          <div className="bg-white rounded-[20px] p-[24px] w-full max-w-[320px] animate-[slideUp_0.3s_ease-out]">
            <div className="flex justify-between items-center mb-[16px]">
              <h3 className="font-['Nunito',sans-serif] text-[18px] text-[#1a1a1a]">
                Log out of ServEase?
              </h3>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-[32px] h-[32px] flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-[20px] h-[20px] text-[#666]" />
              </button>
            </div>
            
            <p className="font-['Nunito',sans-serif] text-[14px] text-[#666] mb-[24px]">
              Are you sure you want to log out?
            </p>

            <div className="flex gap-[12px]">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-[#f5f5f5] text-[#1a1a1a] font-['Nunito',sans-serif] text-[15px] py-[14px] rounded-[50px] transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 text-white font-['Nunito',sans-serif] text-[15px] py-[14px] rounded-[50px] transition-all active:scale-95"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}