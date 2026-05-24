import type { ReactNode } from "react";
import { Download, Play } from "lucide-react";

function StoreBadgeShell({
  href,
  label,
  className,
  children,
}: {
  href?: string;
  label: string;
  className: string;
  children: ReactNode;
}) {
  const resolvedHref =
    href || "/contact?subject=Mobile%20app%20download%20access";
  const isExternal = /^https?:\/\//.test(resolvedHref);

  return (
    <a
      aria-label={href ? label : `${label} - request access`}
      className={className}
      href={resolvedHref}
      rel={isExternal ? "noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
    >
      {children}
    </a>
  );
}

export function GooglePlayBadge() {
  return (
    <StoreBadgeShell
      href={process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL}
      label="Get ServEase on Google Play"
      className="relative bg-black border border-[#a6a6a6] h-[52px] rounded-[5px] w-[170px] cursor-pointer hover:opacity-90 transition-opacity overflow-hidden flex-shrink-0"
    >
      <div className="absolute inset-0 flex items-center">
        <div className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <Play className="h-5 w-5 fill-white text-white" />
        </div>
        <div className="ml-2 flex flex-col justify-center">
          <span className="text-white text-[8px] font-['Inter',sans-serif] leading-none">GET IT ON</span>
          <span className="text-white text-sm font-['Inter',sans-serif] leading-tight">Google Play</span>
        </div>
      </div>
    </StoreBadgeShell>
  );
}

export function AppStoreBadge() {
  return (
    <StoreBadgeShell
      href={process.env.NEXT_PUBLIC_APP_STORE_URL}
      label="Download ServEase on the App Store"
      className="relative bg-[#0c0d10] border border-[#a6a6a6] h-[52px] rounded-[7px] w-[150px] cursor-pointer hover:opacity-90 transition-opacity overflow-hidden flex-shrink-0"
    >
      <div className="absolute inset-0 flex items-center">
        <div className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
          <Download className="h-5 w-5 text-white" />
        </div>
        <div className="ml-2 flex flex-col justify-center">
          <span className="text-white text-[8px] font-['Inter',sans-serif] leading-none">Download on the</span>
          <span className="text-white text-sm font-['Inter',sans-serif] leading-tight">App Store</span>
        </div>
      </div>
    </StoreBadgeShell>
  );
}
