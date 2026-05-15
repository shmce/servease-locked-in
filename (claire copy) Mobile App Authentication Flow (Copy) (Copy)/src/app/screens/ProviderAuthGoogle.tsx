import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

export default function ProviderAuthGoogle() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnPath = searchParams.get("return") || "";

  useEffect(() => {
    // Simulate Google OAuth flow
    const timer = setTimeout(() => {
      navigate(`/auth/google/select-account?type=provider&return=${returnPath}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate, returnPath]);

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
          Google Sign In
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-[24px] pb-[16px] flex flex-col items-center justify-center">
        {/* Google Icon with Spinner */}
        <div className="relative mb-[32px]">
          <div className="w-[80px] h-[80px] bg-white border-2 border-[#e5e5e5] rounded-full flex items-center justify-center">
            <svg className="w-[40px] h-[40px]" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
          </div>
          <Loader2 className="absolute -bottom-[12px] left-1/2 -translate-x-1/2 w-[24px] h-[24px] text-[#56C490] animate-spin" />
        </div>

        <h1 className="font-['Nunito',sans-serif] text-[26px] text-[#1a1a1a] leading-[1.2] mb-[12px] text-center">
          Continue with Google
        </h1>
        
        <p className="font-['Nunito',sans-serif] text-[15px] text-[#666] leading-[1.5] text-center">
          Connecting to Google…
        </p>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}