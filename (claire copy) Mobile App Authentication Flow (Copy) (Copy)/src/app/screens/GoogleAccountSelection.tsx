import { useNavigate, useSearchParams } from "react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { StatusBar } from "../components/StatusBar";

const MOCK_ACCOUNTS = [
  {
    email: "john.doe@gmail.com",
    name: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    email: "jane.smith@gmail.com",
    name: "Jane Smith",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
  },
];

export default function GoogleAccountSelection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get("type") || "customer";
  const returnPath = searchParams.get("return") || "";

  const handleBack = () => {
    navigate(-1);
  };

  const handleAccountSelect = (email: string, name: string) => {
    navigate(`/auth/google/password?type=${userType}&email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}&return=${returnPath}`);
  };

  const handleUseAnotherAccount = () => {
    navigate(`/auth/google/email?type=${userType}&return=${returnPath}`);
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
          Choose an account
        </h1>
        
        <p className="font-['Nunito',sans-serif] text-[14px] text-[#666] leading-[1.5] mb-[32px] text-center">
          to continue to ServEase
        </p>

        {/* Account List */}
        <div className="space-y-[12px]">
          {MOCK_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              onClick={() => handleAccountSelect(account.email, account.name)}
              className="w-full flex items-center gap-[16px] p-[16px] bg-white border-2 border-[#e5e5e5] rounded-[12px] transition-all hover:bg-[#f5f5f5] active:scale-98"
            >
              <div className="w-[48px] h-[48px] rounded-full overflow-hidden flex-shrink-0">
                <img src={account.avatar} alt={account.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-['Nunito',sans-serif] text-[16px] text-[#1a1a1a]">
                  {account.name}
                </p>
                <p className="font-['Nunito',sans-serif] text-[14px] text-[#666]">
                  {account.email}
                </p>
              </div>
              <ChevronRight className="w-[20px] h-[20px] text-[#999] flex-shrink-0" />
            </button>
          ))}

          {/* Use Another Account */}
          <button
            onClick={handleUseAnotherAccount}
            className="w-full flex items-center gap-[16px] p-[16px] bg-white border-2 border-[#e5e5e5] rounded-[12px] transition-all hover:bg-[#f5f5f5] active:scale-98"
          >
            <div className="w-[48px] h-[48px] rounded-full bg-[#f5f5f5] flex items-center justify-center flex-shrink-0">
              <svg className="w-[24px] h-[24px]" viewBox="0 0 24 24" fill="none">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" fill="#666"/>
                <path d="M12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#666"/>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-['Nunito',sans-serif] text-[15px] text-[#1a1a1a]">
                Use another account
              </p>
            </div>
            <ChevronRight className="w-[20px] h-[20px] text-[#999] flex-shrink-0" />
          </button>
        </div>

        {/* Footer Links */}
        <div className="mt-[48px] flex flex-wrap justify-center gap-[16px]">
          <a href="#" className="font-['Nunito',sans-serif] text-[13px] text-[#1a73e8] hover:underline">
            Privacy Policy
          </a>
          <span className="text-[#999]">•</span>
          <a href="#" className="font-['Nunito',sans-serif] text-[13px] text-[#1a73e8] hover:underline">
            Terms of Service
          </a>
        </div>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white flex-shrink-0 relative">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}