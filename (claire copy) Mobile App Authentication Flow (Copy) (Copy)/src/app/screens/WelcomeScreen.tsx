import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-[24px] pb-[100px]">
        {/* Logo/Icon */}
        <div className="w-[120px] h-[120px] bg-[#56C490] rounded-[30px] flex items-center justify-center mb-[32px]">
          <span className="font-['Nunito',sans-serif] text-[48px] text-white">
            S
          </span>
        </div>

        {/* App Name */}
        <h1 className="font-['Nunito',sans-serif] text-[32px] text-[#1a1a1a] mb-[12px]">
          ServEase
        </h1>

        {/* Tagline */}
        <p className="font-['Nunito',sans-serif] text-[16px] text-[#666] text-center mb-[48px] max-w-[280px]">
          Your trusted platform for home services and professional care
        </p>

        {/* Buttons */}
        <div className="w-full space-y-[16px]">
          <button
            onClick={() => navigate("/customer/login")}
            className="w-full bg-[#56C490] text-white font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[50px] transition-all active:scale-95 shadow-[0_4px_16px_rgba(86,196,144,0.25)]"
          >
            Log In
          </button>

          <button
            onClick={() => navigate("/customer/registration")}
            className="w-full bg-white text-[#56C490] border-2 border-[#56C490] font-['Nunito',sans-serif] text-[16px] py-[16px] rounded-[50px] transition-all active:scale-95"
          >
            Sign Up
          </button>
        </div>

        {/* Role Selection Link */}
        <p className="font-['Nunito',sans-serif] text-[13px] text-[#666] mt-[32px] text-center">
          Are you a service provider?{" "}
          <button 
            onClick={() => navigate("/login-role-selection")}
            className="text-[#56C490] font-['Nunito',sans-serif]"
          >
            Sign in here
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
