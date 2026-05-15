import { Suspense } from "react";
import { Outlet } from "react-router";
import MobileContainer from "../components/MobileContainer";

function LoadingFallback() {
  return (
    <div className="bg-white w-full h-full flex items-center justify-center">
      <div className="flex gap-[8px]">
        <div className="w-[10px] h-[10px] bg-[#56C490] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-[10px] h-[10px] bg-[#56C490] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-[10px] h-[10px] bg-[#56C490] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

export default function Root() {
  return (
    <MobileContainer>
      <Suspense fallback={<LoadingFallback />}>
        <Outlet />
      </Suspense>
    </MobileContainer>
  );
}
