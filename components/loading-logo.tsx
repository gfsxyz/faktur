"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const LoadingLogo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("bg-primary p-2.5 rounded-xl", className)}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 78 69"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M20 69H0V64.3828L20 50.6924V69ZM49 69H29V44.5312L49 30.8398V69ZM78 69H58V24.6787L78 10.9883V69ZM20 44.6328L0 58.3242V0H20V44.6328ZM49 24.7812L29 38.4717V0H49V24.7812ZM78 4.92871L58 18.6201V0H78V4.92871Z"
          fill="var(--secondary)"
          stroke="var(--secondary)"
          strokeWidth={0}
          animate={{
            strokeOpacity: [0, 1, 0],
            strokeWidth: [0, 2.5, 0],
            scaleX: [1, 1.08, 1],
            scaleY: [1, 0.92, 1],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
};
export default LoadingLogo;
