import { cn } from "@/lib/utils";

interface NavAccentProps {
  className?: string;
}

function NavAccent({ className }: NavAccentProps) {
  return (
    <div
      className={cn(
        "absolute top-1/2 -translate-y-1/2 -left-3",
        "animate-in slide-in-from-left-12 duration-300",
        className
      )}
    >
      {/* Main bar */}
      <div className="relative h-7 w-1 bg-primary" />
      {/* Glow effect - on the right side of the bar extending into button */}
      <div className="absolute -right-1 top-1/2 -translate-y-1/2 h-4 w-1.5 bg-primary/40 blur-sm" />
    </div>
  );
}

export { NavAccent };
