import React from "react";
import MobileContainer from "./MobileContainer";

interface ScreenLayoutProps {
  children: React.ReactNode;
}

export default function ScreenLayout({ children }: ScreenLayoutProps) {
  return (
    <MobileContainer>
      {children}
    </MobileContainer>
  );
}
