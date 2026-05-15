import { StatusBar } from "./StatusBar";
import { BackButton } from "./BackButton";

interface ServiceHeaderProps {
  /** Page title displayed beside the back arrow */
  title: string;
  /** Optional subtitle below the title */
  subtitle?: string;
  /** Custom back button click handler (defaults to navigate(-1)) */
  onBack?: () => void;
  /** Background colour – defaults to white */
  bgColor?: string;
  /** Text colour for the title – defaults to dark */
  titleColor?: string;
  /** Whether to render the iOS status bar above */
  showStatusBar?: boolean;
  /** Optional right-side action element (e.g., icon button) */
  rightAction?: React.ReactNode;
  /** Back button icon colour */
  backColor?: string;
}

/**
 * Reusable header bar used across service screens.
 *
 * ```tsx
 * <ServiceHeader title="Plumbing Providers" subtitle="8 available near you" />
 * <ServiceHeader
 *   title="Provider Profile"
 *   bgColor="#56C490"
 *   titleColor="white"
 *   backColor="white"
 * />
 * ```
 */
export function ServiceHeader({
  title,
  subtitle,
  onBack,
  bgColor = "white",
  titleColor = "#111827",
  showStatusBar = true,
  rightAction,
  backColor = "#1a1a1a",
}: ServiceHeaderProps) {
  return (
    <>
      {showStatusBar && (
        <div
          className="h-[47px] flex-shrink-0"
          style={{ backgroundColor: bgColor === "white" ? "#56C490" : bgColor }}
        >
          <StatusBar />
        </div>
      )}

      <div
        className="px-[24px] py-[10px] flex items-center gap-[8px] flex-shrink-0"
        style={{
          backgroundColor: bgColor,
          borderBottom: bgColor === "white" ? "1px solid #F2F2F2" : "none",
        }}
      >
        <BackButton onClick={onBack} color={backColor} />

        <div className="flex-1 min-w-0">
          <h1
            className="font-['Nunito',sans-serif] text-[18px] truncate"
            style={{ color: titleColor }}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className="font-['Nunito',sans-serif] text-[12px] mt-[1px] truncate"
              style={{ color: titleColor, opacity: 0.7 }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {rightAction && <div className="flex-shrink-0">{rightAction}</div>}
      </div>
    </>
  );
}
