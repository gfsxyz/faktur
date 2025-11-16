"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Users,
  CreditCard,
  BarChart3,
  Zap,
  Shield
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Invoicing",
    description:
      "Create professional invoices in seconds with our intuitive interface and customizable templates.",
  },
  {
    icon: Users,
    title: "Client Management",
    description:
      "Keep track of all your clients and their billing information in one centralized location.",
  },
  {
    icon: CreditCard,
    title: "Payment Tracking",
    description:
      "Monitor payment status, send reminders, and manage outstanding invoices effortlessly.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description:
      "Get insights into your business with detailed analytics and customizable reports.",
  },
  {
    icon: Zap,
    title: "Automation",
    description:
      "Automate recurring invoices, payment reminders, and follow-ups to save time.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description:
      "Your data is encrypted and backed up regularly to ensure maximum security.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function FeaturesSection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-primary">
            Everything you need
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
            Powerful features for modern businesses
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            All the tools you need to manage your invoices, clients, and payments
            in one place.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24"
        >
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={item}
                className="group relative rounded-2xl border bg-card p-8 transition-all hover:shadow-lg hover:border-primary/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
