import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import { startTransition } from "react";

interface BackButtonProps {
  /** Custom onClick handler - if not provided, uses navigate(-1) */
  onClick?: () => void;
  /** Icon color - defaults to #1a1a1a (dark) */
  color?: string;
  /** Icon size in pixels - defaults to 24 */
  size?: number;
  /** Button size in pixels - defaults to 44 */
  buttonSize?: number;
  /** Additional className for the button */
  className?: string;
  /** Aria label for accessibility */
  ariaLabel?: string;
}

/**
 * Reusable Back Button Component
 * 
 * GLOBAL NAVIGATION RULE:
 * All back buttons must use navigate(-1) to return to the immediate
 * previous screen in the navigation stack. This mirrors Expo Router's
 * router.back() behavior for React Native compatibility.
 * 
 * Features:
 * - Consistent tap feedback (active:scale-90)
 * - Native mobile app-like back navigation (navigate(-1))
 * - Customizable size and color
 * - Accessible with aria-label
 * - Compatible with Expo Router <Stack.Screen> pattern
 * 
 * Usage:
 * <BackButton /> // Standard back navigation (navigate(-1))
 * <BackButton color="white" /> // White icon variant
 * <BackButton color="#56C490" /> // Brand color variant
 */
export function BackButton({
  onClick,
  color = "#1a1a1a",
  size = 24,
  buttonSize = 44,
  className = "",
  ariaLabel = "Go back"
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      startTransition(() => {
        navigate(-1);
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center transition-all active:scale-90 ${className}`}
      style={{
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        marginLeft: buttonSize === 44 ? "-10px" : undefined,
      }}
      aria-label={ariaLabel}
    >
      <ArrowLeft 
        className="flex-shrink-0" 
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          color 
        }} 
      />
    </button>
  );
}