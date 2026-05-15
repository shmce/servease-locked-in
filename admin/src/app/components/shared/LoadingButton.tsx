import { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
}

export function LoadingButton({
  loading = false,
  variant = "default",
  size = "default",
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  // Apply brand colors for primary button
  const brandClassName = variant === "default" 
    ? "bg-[#00BF63] hover:bg-[#00A055] active:bg-[#008F4A] text-white"
    : "";

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || loading}
      className={cn(
        "cursor-pointer transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00BF63] focus-visible:ring-offset-2",
        brandClassName,
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </Button>
  );
}
