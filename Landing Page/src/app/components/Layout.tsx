"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isProviderDashboardRoute = pathname === "/provider" || pathname.startsWith("/provider/");

  if (isProviderDashboardRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-[#00BF63]">
        <Navbar />
      </div>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
