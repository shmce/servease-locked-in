import React from "react";

type ButtonVariant = "filled" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  type?: "button" | "submit";
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-[20px] py-[10px] text-[13px] rounded-[10px]",
  md: "px-[24px] py-[14px] text-[15px] rounded-[50px]",
  lg: "px-[32px] py-[16px] text-[16px] rounded-[50px]",
};

const variantStyles: Record<ButtonVariant, { base: string; disabled: string }> = {
  filled: {
    base: "bg-[#56C490] text-white shadow-[0_4px_14px_rgba(86,196,144,0.3)]",
    disabled: "bg-[#56C490]/40 text-white/60 shadow-none",
  },
  outline: {
    base: "bg-transparent border-2 border-[#56C490] text-[#56C490]",
    disabled: "bg-transparent border-2 border-[#56C490]/40 text-[#56C490]/40",
  },
  ghost: {
    base: "bg-transparent text-[#56C490]",
    disabled: "bg-transparent text-[#56C490]/40",
  },
};

/**
 * ServEase branded primary button.
 *
 * Usage:
 * ```
 * <PrimaryButton onClick={handleClick}>Book Now</PrimaryButton>
 * <PrimaryButton variant="outline" size="sm">Cancel</PrimaryButton>
 * <PrimaryButton loading>Processing…</PrimaryButton>
 * ```
 */
export function PrimaryButton({
  children,
  onClick,
  variant = "filled",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = "left",
  className = "",
  type = "button",
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const styles = variantStyles[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-[8px]
        font-['Nunito',sans-serif]
        transition-all active:scale-[0.96]
        ${sizeStyles[size]}
        ${isDisabled ? styles.disabled : styles.base}
        ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading ? (
        <>
          <span
            className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin"
          />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          <span>{children}</span>
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </button>
  );
}
