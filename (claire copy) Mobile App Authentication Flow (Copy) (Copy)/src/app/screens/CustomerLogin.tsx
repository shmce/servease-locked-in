import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, ArrowLeft, Phone } from "lucide-react";
import { StatusBar } from "../components/StatusBar";
import { useOnboarding } from "../contexts/OnboardingContext";

export default function CustomerLogin() {
  const navigate = useNavigate();
  const { resetOnboarding, setUserProfile } = useOnboarding();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = () => {
    if (formData.email && formData.password) {
      setIsLoading(true);
      setErrorMessage("");

      // Simulate authentication delay
      setTimeout(() => {
        const emailLower = formData.email.trim().toLowerCase();

        if (emailLower === "newcustomer@servease.ph") {
          // Test account: reset onboarding and start fresh flow
          resetOnboarding();
          setUserProfile({ email: emailLower });
          navigate("/customer/setup-profile", { replace: true });
        } else {
          // Standard login: redirect to customer home
          navigate("/customer/home", { replace: true });
        }
        setIsLoading(false);
      }, 800);
    }
  };

  const handlePhoneLogin = () => {
    navigate("/auth/phone?type=customer");
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
          Login
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[40px]">
        <div className="mt-[24px] mb-[24px]">
          <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#111827] leading-[1.2] mb-[8px]">
            Welcome!
          </h1>
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#6B7280] leading-[1.5]">
            Login to continue to ServEase
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
              onClick={() => navigate("/customer/forgot-password")}
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

        {/* Divider */}
        <div className="flex items-center gap-[16px] my-[24px]">
          <div className="flex-1 h-[1px] bg-[#e5e5e5]" />
          <p className="font-['Nunito',sans-serif] text-[13px] text-[#999]">
            or continue with
          </p>
          <div className="flex-1 h-[1px] bg-[#e5e5e5]" />
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-[12px]">
          <button 
            onClick={() => navigate("/customer/auth/google?return=login")}
            className="w-full flex items-center justify-center gap-[12px] px-[16px] py-[14px] bg-white border-2 border-[#e5e5e5] rounded-[12px] font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] transition-all active:scale-95"
          >
            <svg className="w-[20px] h-[20px]" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
          <button 
            onClick={handlePhoneLogin}
            className="w-full flex items-center justify-center gap-[12px] px-[16px] py-[14px] bg-white border-2 border-[#e5e5e5] rounded-[12px] font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a] transition-all active:scale-95"
          >
            <Phone className="w-[20px] h-[20px]" />
            Continue with Phone Number
          </button>
        </div>

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