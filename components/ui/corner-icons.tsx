import * as React from "react";
import { cn } from "@/lib/utils";

interface CornerIconsProps {
  className?: string;
  iconClassName?: string;
  size?: "sm" | "md" | "lg";
}

const sizeVariants = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

function CornerIcons({
  className,
  iconClassName,
  size = "md",
}: CornerIconsProps) {
  const iconSize = sizeVariants[size];

  return (
    <>
      <CornerIcon
        className={cn(
          "pointer-events-none absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2",
          iconSize,
          "text-foreground/50",
          iconClassName,
          className
        )}
      />
      <CornerIcon
        className={cn(
          "pointer-events-none absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
          iconSize,
          "text-foreground/50",
          iconClassName,
          className
        )}
      />
      <CornerIcon
        className={cn(
          "pointer-events-none absolute right-0 top-0 translate-x-1/2 -translate-y-1/2",
          iconSize,
          "text-foreground/50",
          iconClassName,
          className
        )}
      />
      <CornerIcon
        className={cn(
          "pointer-events-none absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2",
          iconSize,
          "text-foreground/50",
          iconClassName,
          className
        )}
      />
    </>
  );
}

function CornerIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      className={className}
      {...props}
    >
      <rect
        x="8"
        y="8"
        width="8"
        height="8"
        rx="1.5"
        transform="rotate(45 12 12)"
        fill="currentColor"
      />
    </svg>
  );
}

export { CornerIcons, CornerIcon };
