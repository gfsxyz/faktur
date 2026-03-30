import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import * as motion from "motion/react-client";
import { DecoratedText } from "@/components/landing/decorated-text";
import { Button } from "@/components/ui/button";
import { FakturLogo } from "@/components/ui/faktur-logo";
import { createMetadata, siteConfig } from "@/lib/metadata";

export const metadata = createMetadata({
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: siteConfig.url,
  },
});

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const imageVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(12px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      delay: 0.2,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const viewport = {
  once: true,
  amount: 0.2,
};

const workflowSteps = [
  {
    number: "01",
    title: "Set up your business details",
    description:
      "Save company information, branding, and payment details once.",
  },
  {
    number: "02",
    title: "Create and send the invoice",
    description:
      "Add line items, choose a layout, and send a polished document.",
  },
  {
    number: "03",
    title: "Track status and payments",
    description:
      "Follow outstanding balances and record payments from one place.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: siteConfig.url,
  description: siteConfig.description,
  image: siteConfig.ogImage,
  featureList: [
    "Invoice creation and management",
    "Client management",
    "Payment tracking",
    "Revenue dashboard",
    "PDF invoice generation",
    "Multiple invoice templates",
    "Business profile and bank details",
    "PWA support",
  ],
};

const structuredDataJson = JSON.stringify(structuredData).replace(
  /</g,
  "\\u003c"
);

function SectionLabel({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="inline-flex items-center gap-2 border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-primary/90">
      <Sparkles className="h-3.5 w-3.5" />
      <span>{children}</span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredDataJson }}
      />

      <main className="relative overflow-hidden bg-linear-to-b from-background via-background to-primary/10">
        <div className="absolute inset-0 opacity-55">
          <motion.div
            className="absolute inset-0"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              skewX: [-2, 2, -2],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              backgroundImage:
                "linear-gradient(32deg, transparent 49.95%, oklch(0.32 0.015 60 / 0.5) 49.95%, oklch(0.32 0.015 60 / 0.5) 50%, transparent 50%)",
              backgroundSize: "1000px 1100px",
              backgroundPosition: "0 0",
            }}
          />

          <motion.div
            className="absolute inset-0"
            animate={{
              x: [0, 150, 0, -150, 0],
              y: [0, -100, -150, -100, 0],
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundImage:
                "linear-gradient(122deg, transparent 51.95%, oklch(0.32 0.015 60 / 0.4) 51.95%, oklch(0.32 0.015 60 / 0.4) 52%, transparent 52%)",
              backgroundSize: "850px 950px",
              backgroundPosition: "350px 450px",
            }}
          />

          <motion.div
            className="absolute inset-0"
            animate={{
              x: [0, -120, 0],
              y: [0, 80, 0],
              rotateX: [0, 5, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              backgroundImage:
                "linear-gradient(78deg, transparent 49.95%, oklch(0.32 0.015 60 / 0.35) 49.95%, oklch(0.32 0.015 60 / 0.35) 50%, transparent 50%)",
              backgroundSize: "1200px 1000px",
              backgroundPosition: "200px 100px",
              transformStyle: "preserve-3d",
            }}
          />

          <motion.div
            className="absolute inset-0 mix-blend-overlay"
            animate={{
              x: [0, -200, 0, 200, 0],
              skewY: [-1, 1, -1, 1, -1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              backgroundImage:
                "linear-gradient(155deg, transparent 51.95%, oklch(0.32 0.015 60 / 0.3) 51.95%, oklch(0.32 0.015 60 / 0.3) 52%, transparent 52%)",
              backgroundSize: "900px 1050px",
              backgroundPosition: "500px 200px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-px bg-primary/20" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-px bg-primary/20" />

          <div className="relative px-6">
            <header className="flex flex-col">
              <nav className="flex items-center justify-between gap-4">
                <div className="flex h-16 items-center">
                  <Link
                    href="/"
                    className="flex items-center gap-2 font-semibold"
                    aria-label="Faktur"
                  >
                    <FakturLogo
                      width={34}
                      height={34}
                      className="transition-all duration-500 ease-in-out"
                    />
                  </Link>
                </div>

                <div className="flex grow items-center justify-around gap-2">
                  <div className="h-9 w-full border border-primary/70 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,var(--primary)_8px,var(--primary)_9px)] opacity-10" />
                  <div className="hidden h-9 w-full border border-primary/70 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,var(--primary)_8px,var(--primary)_9px)] opacity-10 sm:block" />
                  <div className="hidden h-9 w-full border border-primary/70 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,var(--primary)_8px,var(--primary)_9px)] opacity-10 sm:block" />
                  <div className="hidden h-9 w-full border border-primary/70 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,var(--primary)_8px,var(--primary)_9px)] opacity-10 md:block" />
                  <div className="hidden h-9 w-full border border-primary/70 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,var(--primary)_8px,var(--primary)_9px)] opacity-10 md:block" />
                  <div className="hidden h-9 w-full border border-primary/70 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,var(--primary)_8px,var(--primary)_9px)] opacity-10 md:block" />
                  <div className="hidden h-9 w-full border border-primary/70 bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,var(--primary)_8px,var(--primary)_9px)] opacity-10 lg:block" />
                </div>

                <Button
                  className="bg-linear-to-br from-primary via-primary to-primary/90 transition-all duration-200 hover:brightness-110"
                  asChild
                >
                  <Link href="/dashboard">Get Started</Link>
                </Button>
              </nav>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-1 items-center justify-center py-12 md:py-20"
              >
                <div className="mx-auto max-w-5xl space-y-8 px-4 text-center pb-14 pt-4">
                  <motion.div variants={itemVariants}>
                    <SectionLabel>Open-source invoicing</SectionLabel>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                      Invoice Management
                      <span className="mt-2.5 block">
                        Made&nbsp;
                        <DecoratedText
                          className="text-[#39312b] shadow"
                          delay={0.5}
                        >
                          Simple
                        </DecoratedText>
                      </span>
                    </h1>
                  </motion.div>

                  <motion.p
                    variants={itemVariants}
                    className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
                  >
                    Create, manage, and track invoices effortlessly. A
                    streamlined solution designed for businesses of all sizes.
                  </motion.p>

                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row"
                  >
                    <motion.div
                      className="relative inline-block"
                      whileHover={{
                        opacity: [1, 0.3, 1, 0.4, 1],
                      }}
                      whileTap={{ y: 0 }}
                      transition={{
                        opacity: {
                          duration: 0.7,
                          times: [0, 0.2, 0.5, 0.7, 1],
                          ease: "easeInOut",
                        },
                      }}
                    >
                      <motion.div
                        className="pointer-events-none absolute -inset-[5px] opacity-40"
                        animate={{ opacity: [1, 0.3, 1, 0.3, 1] }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 2,
                          ease: "easeInOut",
                        }}
                      >
                        <div className="absolute top-0 left-0 h-2 w-2 border-t border-l border-primary/50" />
                        <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-primary/50" />
                        <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-primary/50" />
                        <div className="absolute right-0 bottom-0 h-2 w-2 border-r border-b border-primary/50" />
                      </motion.div>

                      <Button
                        size="lg"
                        className="group relative h-12 overflow-hidden border border-primary/30 bg-primary px-10 text-base text-primary-foreground shadow-xl shadow-primary/20 hover:bg-primary/90"
                        asChild
                      >
                        <Link href="/dashboard">
                          <span className="relative z-10 flex items-center gap-2 font-semibold tracking-wide">
                            <span
                              style={{
                                textShadow:
                                  "0 1px 3px rgba(0, 0, 0, 0.3), 0 0 12px rgba(255, 255, 255, 0.5), inset 0 -1px 2px rgba(0, 0, 0, 0.2)",
                                filter:
                                  "drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3))",
                              }}
                            >
                              Start for free
                            </span>
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </Link>
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            </header>

            <section className="relative -mx-6 min-h-[50vh] border-y border-primary/20">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
                style={{ backgroundImage: "url('/lp-bg.png')" }}
              />

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={viewport}
                className="relative px-6 py-20"
              >
                <div className="mx-auto max-w-6xl space-y-10">
                  <motion.div
                    variants={itemVariants}
                    className="mx-auto max-w-3xl text-center"
                  >
                    <h2 className="mt-5 text-3xl font-semibold tracking-tight max-w-lg mx-auto">
                      One calm workspace
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-muted-foreground max-w-lg mx-auto">
                      Faktur keeps the operational pieces together so creating,
                      sending, and reconciling invoices feels like one flow.
                    </p>
                  </motion.div>

                  <motion.div
                    variants={imageVariants}
                    className="relative mx-auto mt-12 max-w-6xl"
                    style={{ perspective: 1400, transformStyle: "preserve-3d" }}
                  >
                    <div className="relative overflow-hidden rounded-lg bg-linear-to-tl from-primary/20 via-primary/20 to-primary/10 p-2">
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          background:
                            "repeating-linear-gradient(45deg, transparent, transparent 8px, var(--primary) 8px, var(--primary) 9px)",
                        }}
                      />
                      <Image
                        src="/preview.jpg"
                        alt="Faktur dashboard showing invoices, analytics, and payment tracking"
                        width={1200}
                        height={800}
                        priority
                        fetchPriority="high"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 85vw, 1200px"
                        className="relative z-10 shadow-2xl"
                      />
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </section>

            <motion.section
              id="workflow"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={viewport}
              className="py-16 md:py-18"
            >
              <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                <motion.div variants={itemVariants} className="max-w-xl">
                  <h2 className="text-3xl font-semibold tracking-tight">
                    A shorter path from draft to paid
                  </h2>
                  <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
                    The workflow stays simple: set up once, create quickly, and
                    keep payment follow-up visible.
                  </p>
                </motion.div>

                <div className="border border-primary/20">
                  {workflowSteps.map((step, index) => (
                    <motion.div
                      key={step.number}
                      variants={itemVariants}
                      className={`grid gap-3 px-5 py-5 md:grid-cols-[72px_1fr] ${
                        index > 0 ? "border-t border-primary/20" : ""
                      }`}
                    >
                      <div className="text-xs tracking-[0.28em] text-primary uppercase">
                        {step.number}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold tracking-tight">
                          {step.title}
                        </h3>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>

            <section>
              <div className="py-14 md:py-18">
                <div className="relative isolate overflow-hidden py-8 md:py-12">
                  <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/footer.jpg')" }}
                  />
                  <div className="absolute inset-0 z-10 bg-linear-to-r from-background/90 via-background/72 to-background/82" />

                  <div className="relative z-20 grid gap-10 px-6 py-10 md:grid-cols-[1.15fr_auto] md:items-end md:px-8 lg:px-10">
                    <motion.div
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.35 }}
                      variants={itemVariants}
                      className="max-w-2xl"
                    >
                      <p className="text-[11px] uppercase tracking-[0.32em] text-primary">
                        Start now
                      </p>
                      <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
                        Invoice work, without the drag.
                      </h2>
                      <p className="mt-4 max-w-md text-sm leading-relaxed text-foreground/80 md:text-base">
                        Create, send, and follow up from one focused workspace.
                      </p>
                    </motion.div>

                    <motion.div
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.35 }}
                      variants={imageVariants}
                      className="flex flex-col items-start gap-4 md:items-end"
                    >
                      <Button
                        size="lg"
                        className="group h-12 bg-primary px-8 text-base text-primary-foreground hover:bg-primary/90"
                        asChild
                      >
                        <Link href="/dashboard">
                          <span className="flex items-center gap-2">
                            Get Started
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </span>
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
