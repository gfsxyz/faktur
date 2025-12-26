import { cn } from "@/lib/utils";

type CornerGridPatternProps = {
  className?: string;
};

export function SquarePatterns({ className }: CornerGridPatternProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 opacity-30",

        // grid layer 1
        "bg-[linear-gradient(color-mix(in_srgb,var(--primary)_12%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--primary)_12%,transparent)_1px,transparent_1px)]",
        "bg-[size:10px_10px]",

        // grid layer 2
        "before:absolute before:inset-0",
        "before:bg-[linear-gradient(color-mix(in_srgb,var(--primary)_6%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--primary)_6%,transparent)_1px,transparent_1px)]",
        "before:bg-[size:14px_14px]",
        "before:translate-x-[2px] before:translate-y-[2px]",
        "before:content-['']",

        // top-right fade
        "[mask-image:radial-gradient(circle_at_top_right,black_0%,black_25%,transparent_65%)]",
        "[-webkit-mask-image:radial-gradient(circle_at_top_right,black_0%,black_25%,transparent_65%)]",

        className
      )}
    />
  );
}
