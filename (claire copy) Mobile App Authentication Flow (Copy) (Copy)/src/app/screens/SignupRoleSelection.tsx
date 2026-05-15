import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Briefcase, ArrowLeft, ChevronRight } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function SignupRoleSelection() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'customer' | 'provider' | null>(null);

  const handleRoleSelect = (role: 'customer' | 'provider') => {
    setSelectedRole(role);
    // Navigate immediately on tap
    setTimeout(() => {
      if (role === 'customer') {
        navigate("/customer/registration");
      } else {
        navigate("/provider/signup/step1");
      }
    }, 150);
  };

  return (
    <div className="bg-white w-full h-full flex flex-col">
      {/* iOS Status Bar with green background */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>
      
      {/* Top Navigation Bar */}
      <div className="px-[24px] py-[12px] flex items-center gap-[12px] bg-white flex-shrink-0">
        <button
          onClick={() => navigate("/auth-gate")}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
          Sign Up
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px]">
        {/* Header Section */}
        <div className="mt-[20px] mb-[28px]">
          <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] leading-[1.2] mb-[8px]">
            Create your account
          </h1>
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.5]">
            Choose how you want to continue
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="space-y-[12px]">
          {/* Customer Card */}
          <button
            onClick={() => handleRoleSelect('customer')}
            className={`w-full text-left rounded-[16px] border-2 transition-all active:scale-[0.98] shadow-sm ${
              selectedRole === 'customer'
                ? 'bg-[#56C490]/5 border-[#56C490] shadow-[0_2px_12px_rgba(86,196,144,0.15)]'
                : 'bg-white border-[#e5e5e5]'
            }`}
          >
            <div className="flex items-center gap-[14px] p-[18px]">
              {/* Icon Container */}
              <div className="w-[48px] h-[48px] rounded-[12px] bg-[#56C490]/10 flex items-center justify-center flex-shrink-0">
                <User className="w-[24px] h-[24px] text-[#56C490]" strokeWidth={2.5} />
              </div>
              
              {/* Text Content */}
              <div className="flex-1">
                <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#1a1a1a] mb-[2px]">
                  Customer
                </h3>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#666] leading-[1.3]">
                  Find and book services
                </p>
              </div>
              
              {/* Arrow Indicator */}
              <ChevronRight className={`w-[20px] h-[20px] flex-shrink-0 transition-colors ${
                selectedRole === 'customer' ? 'text-[#56C490]' : 'text-[#ccc]'
              }`} />
            </div>
          </button>

          {/* Service Provider Card */}
          <button
            onClick={() => handleRoleSelect('provider')}
            className={`w-full text-left rounded-[16px] border-2 transition-all active:scale-[0.98] shadow-sm ${
              selectedRole === 'provider'
                ? 'bg-[#56C490]/5 border-[#56C490] shadow-[0_2px_12px_rgba(86,196,144,0.15)]'
                : 'bg-white border-[#e5e5e5]'
            }`}
          >
            <div className="flex items-center gap-[14px] p-[18px]">
              {/* Icon Container */}
              <div className="w-[48px] h-[48px] rounded-[12px] bg-[#56C490]/10 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-[24px] h-[24px] text-[#56C490]" strokeWidth={2.5} />
              </div>
              
              {/* Text Content */}
              <div className="flex-1">
                <h3 className="font-['Nunito',sans-serif] text-[16px] text-[#1a1a1a] mb-[2px]">
                  Service Provider
                </h3>
                <p className="font-['Nunito',sans-serif] text-[13px] text-[#666] leading-[1.3]">
                  Offer services and manage bookings
                </p>
              </div>
              
              {/* Arrow Indicator */}
              <ChevronRight className={`w-[20px] h-[20px] flex-shrink-0 transition-colors ${
                selectedRole === 'provider' ? 'text-[#56C490]' : 'text-[#ccc]'
              }`} />
            </div>
          </button>
        </div>

        {/* Login Link */}
        <div className="text-center mt-[32px]">
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280]">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login-role-selection")}
              className="text-[#56C490] font-['Nunito',sans-serif] text-[14px] transition-all active:opacity-70"
            >
              Log In
            </button>
          </p>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}