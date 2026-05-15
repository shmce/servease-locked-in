import { useNavigate } from "react-router";
import { StatusBar } from "../components/StatusBar";
import { Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="bg-white w-full h-screen flex flex-col">
      {/* iOS Status Bar */}
      <div className="h-[47px] bg-[#56C490] flex-shrink-0">
        <StatusBar />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-[24px] text-center">
        <div className="w-[120px] h-[120px] bg-[#f5f5f5] rounded-full flex items-center justify-center mb-[24px]">
          <p className="font-['Nunito',sans-serif] text-[48px] text-[#9CA3AF]">
            404
          </p>
        </div>
        <h1 className="font-['Nunito',sans-serif] text-[24px] text-[#111827] mb-[12px]">
          Page Not Found
        </h1>
        <p className="font-['Nunito',sans-serif] text-[15px] text-[#6B7280] mb-[32px] max-w-[280px]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate("/customer/home")}
          className="h-[48px] px-[32px] bg-[#56C490] rounded-[12px] flex items-center gap-[8px] transition-all active:scale-95"
        >
          <Home className="w-[20px] h-[20px] text-white" />
          <span className="font-['Nunito',sans-serif] text-[15px] text-white">
            Go to Home
          </span>
        </button>
      </div>

      {/* Home Indicator */}
      <div className="h-[34px] bg-white relative flex-shrink-0">
        <div className="absolute bg-black bottom-[8px] h-[5px] left-1/2 -translate-x-1/2 rounded-[100px] w-[134px]" />
      </div>
    </div>
  );
}
