"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
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
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-primary">Modern Invoice Management</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent"
          >
            Invoice Management
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Made Simple
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 text-lg leading-8 text-muted-foreground"
          >
            Create, manage, and track invoices with ease. Faktur provides a modern,
            streamlined approach to invoice management for businesses of all sizes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="group">
              <Link href="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-sm text-muted-foreground"
          >
            No credit card required • Free forever plan available
          </motion.div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-16 sm:mt-24"
        >
          <div className="relative rounded-xl bg-gradient-to-b from-primary/10 to-transparent p-1">
            <div className="rounded-lg bg-background p-8 shadow-2xl ring-1 ring-border">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
              </div>
              <div className="space-y-4">
                <div className="h-8 w-48 rounded bg-muted animate-pulse" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 rounded-lg border bg-card p-4">
                    <div className="h-4 w-16 rounded bg-muted mb-2" />
                    <div className="h-6 w-24 rounded bg-primary/20" />
                  </div>
                  <div className="h-24 rounded-lg border bg-card p-4">
                    <div className="h-4 w-16 rounded bg-muted mb-2" />
                    <div className="h-6 w-24 rounded bg-primary/20" />
                  </div>
                  <div className="h-24 rounded-lg border bg-card p-4">
                    <div className="h-4 w-16 rounded bg-muted mb-2" />
                    <div className="h-6 w-24 rounded bg-primary/20" />
                  </div>
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
