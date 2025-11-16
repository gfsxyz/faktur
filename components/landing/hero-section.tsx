"use client";

import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const x1 = useSpring(useTransform(mouseX, [0, 1], [0, 50]), springConfig);
  const y1 = useSpring(useTransform(mouseY, [0, 1], [0, 50]), springConfig);
  const x2 = useSpring(useTransform(mouseX, [0, 1], [0, -30]), springConfig);
  const y2 = useSpring(useTransform(mouseY, [0, 1], [0, -30]), springConfig);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set(clientX / innerWidth);
      mouseY.set(clientY / innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Animated Gradient Blobs */}
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.2, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-secondary-foreground/50 px-4 py-2 text-sm "
          >
            <Sparkles className="h-4 w-4 text-primary dark:text-primary-foreground" />
            <span className="text-primary dark:text-primary-foreground">
              Modern Invoice Management
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl font-bold tracking-tight sm:text-7xl bg-linear-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent"
          >
            Invoice Management
            <br />
            <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Made Simple
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-lg leading-8 text-muted-foreground"
          >
            Create, manage, and track invoices with ease. Faktur provides a
            modern, streamlined approach to invoice management for businesses of
            all sizes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="group">
              <Link href="/login">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Floating Elements - Decorative */}
        {mounted && (
          <>
            {/* Floating Invoice Card - Top Right */}
            <motion.div
              style={{ x: x1, y: y1 }}
              className="absolute top-20 right-10 hidden lg:block"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, -10, 0],
                }}
                transition={{
                  opacity: { delay: 0.8, duration: 0.5 },
                  scale: { delay: 0.8, duration: 0.5 },
                  y: {
                    delay: 1,
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                className="bg-card/90 backdrop-blur-sm border border-primary/50 shadow-lg rounded-lg p-4 w-64"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Payment Received
                  </span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Invoice #INV-2847</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-200">
                      $2,450
                    </span>
                  </div>
                  <div className="h-1 bg-primary/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-600 dark:bg-emerald-200"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 1.2, duration: 1.5 }}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Stats Card - Left */}
            <motion.div
              style={{ x: x2, y: y2 }}
              className="absolute top-40 left-10 hidden xl:block"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, 10, 0],
                }}
                transition={{
                  opacity: { delay: 1, duration: 0.5 },
                  scale: { delay: 1, duration: 0.5 },
                  y: {
                    delay: 1.2,
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                className="bg-card/90 backdrop-blur-sm border shadow-lg rounded-lg p-4 w-56"
              >
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Revenue Growth</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-200">
                    +24%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    this month
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Invoice Card - Bottom Left */}
            <motion.div
              style={{ x: x1, y: y1 }}
              className="absolute bottom-40 left-20 hidden xl:block"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, -15, 0],
                }}
                transition={{
                  opacity: { delay: 1.2, duration: 0.5 },
                  scale: { delay: 1.2, duration: 0.5 },
                  y: {
                    delay: 1.4,
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                className="bg-card/90 backdrop-blur-sm border border-accent/50 shadow-lg rounded-lg p-3 w-48"
              >
                <div className="flex items-center gap-2">
                  <div className="bg-accent/10 rounded p-1.5">
                    <FileText className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Draft Invoice
                    </div>
                    <div className="text-sm font-semibold">$1,250</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-10 sm:mt-16 relative z-10"
        >
          <div className="relative rounded-xl bg-linear-to-b from-primary/10 to-transparent p-1">
            <div className="rounded-lg bg-background p-8 shadow-2xl ring-1 ring-border">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="space-y-4">
                <div className="h-8 w-48 rounded bg-muted animate-pulse" />
                <div className="grid grid-cols-3 gap-4">
                  <motion.div
                    className="h-24 rounded-lg border bg-card p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="h-4 w-16 rounded bg-muted mb-2" />
                    <div className="h-6 w-24 rounded bg-primary/20" />
                  </motion.div>
                  <motion.div
                    className="h-24 rounded-lg border bg-card p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="h-4 w-16 rounded bg-muted mb-2" />
                    <div className="h-6 w-24 rounded bg-primary/20" />
                  </motion.div>
                  <motion.div
                    className="h-24 rounded-lg border bg-card p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="h-4 w-16 rounded bg-muted mb-2" />
                    <div className="h-6 w-24 rounded bg-primary/20" />
                  </motion.div>
                </div>
                <div className="h-48 rounded-lg border bg-muted/30" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
