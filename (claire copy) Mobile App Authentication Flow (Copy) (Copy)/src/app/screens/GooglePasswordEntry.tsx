import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function GooglePasswordEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "customer";
  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";
  const returnPath = searchParams.get("return") || "";
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const displayEmail = email || "user@gmail.com";
  const displayName = name || "Google User";

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = async () => {
    if (!password) {
      setError("Enter your password");
      return;
    }

    setIsLoading(true);
    setError("");

    // Simulate authentication delay
    setTimeout(() => {
      // In a real app, this would validate with Google OAuth
      // For demo purposes, accept any password
      // Uses replace to prevent back-navigation to login screen
      // Expo equivalent: router.replace('/path')
      if (userType === "customer") {
        navigate("/customer/home", { replace: true });
      } else {
        navigate("/provider/home", { replace: true });
      }
    }, 800);
  };

  const handleForgotPassword = () => {
    // In a real app, this would redirect to Google's password recovery
    alert("This would redirect to Google's password recovery in a real implementation.");
  };

  const handleDifferentAccount = () => {
    navigate(`/auth/google/select-account?type=${userType}&return=${returnPath}`);
  };

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-white flex-shrink-0">
        <StatusBar />
      </div>
      
      {/* Top Navigation Bar */}
      <div className="px-[24px] py-[12px] flex items-center gap-[16px] bg-white flex-shrink-0 border-b border-[#e5e5e5]">
        <button
          onClick={handleBack}
          className="w-[44px] h-[44px] flex items-center justify-center -ml-[10px] transition-all active:scale-90"
        >
          <ArrowLeft className="w-6 h-6 text-[#1a1a1a]" />
        </button>
        <h2 className="font-['Nunito',sans-serif] text-[17px] text-[#1a1a1a]">
          Sign in with Google
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[100px]">
        {/* Google Logo */}
        <div className="flex justify-center mt-[32px] mb-[32px]">
          <svg className="w-[40px] h-[40px]" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center mb-[32px]">
          <div className="w-[72px] h-[72px] rounded-full overflow-hidden flex-shrink-0 mb-[16px]">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`} 
              alt={displayName} 
              className="w-full h-full object-cover" 
            />
          </div>
          <p className="font-['Nunito',sans-serif] text-[19px] text-[#1a1a1a] mb-[4px]">
            {displayName}
          </p>
          <p className="font-['Nunito',sans-serif] text-[14px] text-[#666]">
            {displayEmail}
          </p>
        </div>

        <h1 className="font-['Nunito',sans-serif] text-[24px] text-[#1a1a1a] leading-[1.2] mb-[32px] text-center">
          Welcome
        </h1>

        {/* Password Input */}
        <div className="mb-[20px]">
          <label className="font-['Nunito',sans-serif] text-[13px] text-[#1a1a1a] mb-[8px] block">
            Enter your password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter your password"
              className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[24px] font-['Nunito',sans-serif] text-[15px] outline-none transition-all ${
                error ? "border-red-500 bg-red-50" : "border-transparent focus:border-[#4285F4] focus:bg-white"
              }`}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[#666] transition-all active:scale-90"
            >
              {showPassword ? <EyeOff className="w-[20px] h-[20px]" /> : <Eye className="w-[20px] h-[20px]" />}
            </button>
          </div>
          {error && (
            <p className="font-['Nunito',sans-serif] text-[13px] text-red-500 mt-[8px]">
              {error}
            </p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end mb-[32px]">
          <button
            onClick={handleForgotPassword}
            className="font-['Nunito',sans-serif] text-[14px] text-[#4285F4] transition-all active:opacity-70"
          >
            Forgot password?
          </button>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!password || isLoading}
          className="w-full bg-[#4285F4] text-white font-['Nunito',sans-serif] text-[15px] py-[16px] rounded-[50px] transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 shadow-[0_2px_12px_rgba(66,133,244,0.3)] flex items-center justify-center gap-[8px]"
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          <span>Next</span>
        </button>

        {/* Use a Different Account Link */}
        <button
          onClick={handleDifferentAccount}
          className="w-full font-['Nunito',sans-serif] text-[13px] text-[#666] mt-[16px] transition-all active:opacity-70"
        >
          Use a different account
        </button>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}