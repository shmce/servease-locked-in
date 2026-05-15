import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function GoogleEmailEntry() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "customer";
  const returnPath = searchParams.get("return") || "";
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleBack = () => {
    navigate(-1);
  };

  const handleNext = () => {
    if (!email) {
      setError("Enter an email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Enter a valid email");
      return;
    }

    // Extract name from email (e.g., "john.doe@gmail.com" -> "John Doe")
    const localPart = email.split("@")[0];
    const name = localPart
      .split(".")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    navigate(`/auth/google/password?type=${userType}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&return=${returnPath}`);
  };

  const handleForgotEmail = () => {
    // In a real app, this would redirect to Google's account recovery
    alert("This would redirect to Google's account recovery in a real implementation.");
  };

  const handleCreateAccount = () => {
    // In a real app, this would redirect to Google account creation
    alert("This would redirect to Google account creation in a real implementation.");
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
          <svg className="w-[72px] h-[72px]" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
        </div>

        <h1 className="font-['Nunito',sans-serif] text-[28px] text-[#1a1a1a] leading-[1.2] mb-[8px] text-center">
          Sign in
        </h1>
        
        <p className="font-['Nunito',sans-serif] text-[14px] text-[#666] leading-[1.5] mb-[32px] text-center">
          to continue to ServEase
        </p>

        {/* Email Input */}
        <div className="mb-[20px]">
          <label className="font-['Nunito',sans-serif] text-[13px] text-[#1a1a1a] mb-[8px] block">
            Email or phone
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="Email or phone"
            className={`w-full px-[16px] py-[14px] bg-[#f5f5f5] border-2 rounded-[12px] font-['Nunito',sans-serif] text-[15px] outline-none transition-all ${
              error ? "border-red-500 bg-red-50" : "border-transparent focus:border-[#4285F4] focus:bg-white"
            }`}
          />
          {error && (
            <p className="font-['Nunito',sans-serif] text-[13px] text-red-500 mt-[8px]">
              {error}
            </p>
          )}
        </div>

        {/* Forgot Email Link */}
        <button
          onClick={handleForgotEmail}
          className="font-['Nunito',sans-serif] text-[14px] text-[#4285F4] mb-[32px] transition-all active:opacity-70"
        >
          Forgot email?
        </button>

        {/* Info Text */}
        <p className="font-['Nunito',sans-serif] text-[13px] text-[#666] mb-[32px]">
          Not your computer? Use Guest mode to sign in privately.{" "}
          <a href="#" className="text-[#4285F4] hover:underline">
            Learn more
          </a>
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-[16px]">
          <button
            onClick={handleCreateAccount}
            className="font-['Nunito',sans-serif] text-[14px] text-[#4285F4] transition-all active:opacity-70"
          >
            Create account
          </button>
          
          <button
            onClick={handleNext}
            disabled={!email}
            className="bg-[#4285F4] text-white font-['Nunito',sans-serif] text-[15px] px-[32px] py-[12px] rounded-[50px] transition-all active:scale-95 disabled:opacity-40 disabled:active:scale-100 shadow-[0_2px_12px_rgba(66,133,244,0.3)]"
          >
            Next
          </button>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}