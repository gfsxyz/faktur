"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 to-primary px-6 py-24 shadow-2xl sm:px-24"
        >
          {/* Background decoration */}
          <div className="absolute -top-24 right-0 -z-10 transform-gpu blur-3xl">
            <div
              className="aspect-[1404/767] w-[87.75rem] bg-gradient-to-r from-primary-foreground to-primary-foreground opacity-20"
              style={{
                clipPath:
                  "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
              }}
            />
          </div>

          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/90">
              Join thousands of businesses using Faktur to streamline their
              invoicing process. Start free today, no credit card required.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="group font-semibold"
              >
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-primary-foreground/70">
              Free forever plan • No credit card required • Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
