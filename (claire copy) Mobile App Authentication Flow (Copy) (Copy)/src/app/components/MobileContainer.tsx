import React from "react";

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function MobileContainer({ children, className = "" }: MobileContainerProps) {
  return (
    <div className={`relative w-[393px] h-[852px] mx-auto overflow-hidden ${className}`}>
      {children}
    </div>
  );
}