import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CornerIcons } from "@/components/ui/corner-icons";

interface DecoratedTextProps {
  text?: string;
  children?: React.ReactNode;
  className?: string;
  bordered?: boolean;
  showIcons?: boolean;
  iconClassName?: string;
  glowEffect?: boolean;
  flicker?: boolean;
  delay?: number; // new prop
}

function DecoratedText({
  text,
  children,
  className,
  bordered = true,
  showIcons = true,
  iconClassName,
  glowEffect = true,
  flicker = true,
  delay = 0, // default to no delay
}: DecoratedTextProps) {
  const content = text || children;

  return (
    <motion.span
      className={cn(
        "group/decorated relative inline-block",
        bordered && "border border-foreground/20",
        className
      )}
      {...(flicker && {
        initial: { opacity: 1 },
        animate: { opacity: [1, 0.4, 1, 0.2, 1] },
        transition: {
          duration: 0.6,
          delay,
          ease: "easeInOut",
        },
      })}
    >
      {/* TEXT */}
      <span className="relative z-10 inline-block leading-none">{content}</span>

      {/* CORNER ICONS */}
      {showIcons && <CornerIcons size="md" iconClassName={iconClassName} />}
    </motion.span>
  );
}

export { DecoratedText };
