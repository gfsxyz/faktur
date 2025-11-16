"use client";

import { motion } from "framer-motion";

export function AnimatedGrid() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Base Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-size-[32px_32px]" />
      {/* Multiple Gradient Blobs - MORE VISIBLE */}
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[500px] w-[500px] rounded-full bg-primary opacity-30 blur-[120px]" />
      <motion.div
        className="absolute top-1/4 left-1/3 h-[600px] w-[600px] rounded-full bg-accent opacity-25 blur-[140px]"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 h-[550px] w-[550px] rounded-full bg-secondary opacity-30 blur-[130px]"
        animate={{
          x: [0, -60, 0],
          y: [0, 60, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Animated Dots Pattern - BIGGER AND MORE VISIBLE */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-primary/40"
            style={{
              left: `${(i * 17 + 10) % 100}%`,
              top: `${(i * 23 + 15) % 100}%`,
            }}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
      {/* Diagonal Lines - MORE VISIBLE */}
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="absolute h-px w-full bg-linear-to-r from-transparent via-primary to-transparent top-1/4 rotate-12" />
        <div className="absolute h-px w-full bg-linear-to-r from-transparent via-accent to-transparent top-2/4 -rotate-12" />
        <div className="absolute h-px w-full bg-linear-to-r from-transparent via-secondary to-transparent top-3/4 rotate-6" />
      </div>
      {/* Corner Accent - MORE VISIBLE */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-linear-to-br from-primary/10 to-transparent" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-linear-to-tl from-accent/10 to-transparent" />
    </div>
  );
}
