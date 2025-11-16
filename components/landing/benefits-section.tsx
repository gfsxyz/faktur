"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const benefits = [
  "No credit card required to start",
  "Cancel anytime with no penalties",
  "24/7 customer support",
  "Regular updates and new features",
  "Data export available anytime",
  "GDPR compliant and secure",
];

const stats = [
  { value: "10k+", label: "Active Users" },
  { value: "500k+", label: "Invoices Created" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9/5", label: "User Rating" },
];

export function BenefitsSection() {
  return (
    <section className="py-24 sm:py-32 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24 items-center">
          {/* Left side - Stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-base font-semibold leading-7 text-primary">
              Trusted by thousands
            </h2>
            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              Join the growing community
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Businesses worldwide trust Faktur to manage their invoicing needs.
              See why we're the preferred choice for modern teams.
            </p>

            <div className="mt-10 grid grid-cols-2 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="text-4xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right side - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border bg-card p-8 sm:p-12 shadow-lg"
          >
            <h3 className="text-2xl font-bold mb-8">Why choose Faktur?</h3>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                  <span className="text-muted-foreground">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
