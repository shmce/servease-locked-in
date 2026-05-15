import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2, LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "../ui/utils";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  tooltip?: string;
  variant?: "default" | "ghost" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function IconButton({
  icon: Icon,
  tooltip,
  variant = "ghost",
  size = "md",
  loading = false,
  className,
  disabled,
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const variantClasses = {
    default: "bg-[#00BF63] text-white hover:bg-[#00A055] active:bg-[#008F4A]",
    ghost: "text-gray-600 hover:bg-[#DCFCE7] hover:text-[#00BF63] active:bg-[#BBF7D0]",
    destructive: "text-red-600 hover:bg-red-50 active:bg-red-100",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100",
  };

  const button = (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-all",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00BF63] focus-visible:ring-offset-2",
        "cursor-pointer",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className={cn("animate-spin", iconSizes[size])} />
      ) : (
        <Icon className={iconSizes[size]} />
      )}
    </button>
  );

  if (tooltip && !disabled && !loading) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
