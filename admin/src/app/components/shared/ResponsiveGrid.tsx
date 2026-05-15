import { ReactNode } from "react";
import { cn } from "../ui/utils";

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export function ResponsiveGrid({
  children,
  cols = { default: 1, md: 2, lg: 3, xl: 4 },
  gap = 6,
  className,
}: ResponsiveGridProps) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  };

  const gapClasses = {
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
    8: "gap-8",
  };

  return (
    <div
      className={cn(
        "grid",
        cols.default && colClasses[cols.default as keyof typeof colClasses],
        cols.sm && `sm:${colClasses[cols.sm as keyof typeof colClasses]}`,
        cols.md && `md:${colClasses[cols.md as keyof typeof colClasses]}`,
        cols.lg && `lg:${colClasses[cols.lg as keyof typeof colClasses]}`,
        cols.xl && `xl:${colClasses[cols.xl as keyof typeof colClasses]}`,
        gapClasses[gap as keyof typeof gapClasses],
        className
      )}
    >
      {children}
    </div>
  );
}
