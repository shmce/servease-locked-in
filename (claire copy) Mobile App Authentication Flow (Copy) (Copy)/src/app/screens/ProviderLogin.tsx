import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, ArrowLeft, Phone } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function ProviderLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (formData.email && formData.password) {
      setIsLoading(true);

      // Simulate authentication delay
      setTimeout(() => {
        const emailLower = formData.email.trim().toLowerCase();

        // Special test case: new provider onboarding redirect
        if (emailLower === "newprovider@servease.ph") {
          navigate("/provider/setup-profile", { replace: true });
        } else {
          // Standard provider login: redirect to provider home
          // Uses replace to prevent back-navigation to login screen
          // Expo equivalent: router.replace('/provider/home')
          navigate("/provider/home", { replace: true });
        }
        setIsLoading(false);
      }, 800);
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
          onClick={() => navigate("/login-role-selection")}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <h2 className="font-['Nunito',sans-serif] text-[18px] text-[#111827]">
          Provider Login
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[16px]">
        <div className="mt-[24px] mb-[24px]">
          <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] leading-[1.2] mb-[8px]">
            Welcome, provider!
          </h1>
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.5]">
            Login to manage your services
          </p>
        </div>

        <div className="space-y-[20px]">
          {/* Email Input */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="font-['Nunito',sans-serif] text-[14px] text-[#374151] mb-[8px] block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-[16px] py-[14px] pr-[48px] bg-[#f5f5f5] border-2 border-transparent rounded-[12px] font-['Nunito',sans-serif] text-[14px] text-[#1a1a1a] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#56C490] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#56C490] transition-all active:scale-90"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              onClick={() => navigate("/forgot-password")}
              className="font-['Nunito',sans-serif] text-[14px] text-[#56C490]"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={!formData.email || !formData.password || isLoading}
          className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[50px] transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 mt-[32px] shadow-[0_2px_12px_rgba(86,196,144,0.2)]"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center font-['Nunito',sans-serif] text-[14px] text-[#6B7280] mt-[24px]">
          Don't have an account?{" "}
          <button 
            onClick={() => navigate("/signup-role-selection")}
            className="text-[#56C490] font-['Nunito',sans-serif] text-[14px]"
          >
            Sign Up
          </button>
        </p>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}