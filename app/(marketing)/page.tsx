import Link from "next/link";
import Image from "next/image";
import { FakturLogo } from "@/components/ui/faktur-logo";
import { Button } from "@/components/ui/button";
import * as motion from "motion/react-client";
import { Sparkles } from "lucide-react";
import { DecoratedText } from "@/components/landing/decorated-text";

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
      delay: 1,
    },
  },
};

export default function Home() {
  return (
    <header className="relative min-h-screen overflow-hidden bg-linear-to-b from-background via-background to-primary/10">
      {/* Abstract Line Pattern - Multi-layered interference effect */}
      <div className="absolute inset-0 opacity-55">
        {/* Layer 1: Flowing diagonal */}
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
            backgroundImage: `
              linear-gradient(32deg, transparent 49.95%, oklch(0.32 0.015 60 / 0.5) 49.95%, oklch(0.32 0.015 60 / 0.5) 50%, transparent 50%)
            `,
            backgroundSize: "1000px 1100px",
            backgroundPosition: "0 0",
          }}
        />

        {/* Layer 2: Orbital movement */}
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
            backgroundImage: `
              linear-gradient(122deg, transparent 51.95%, oklch(0.32 0.015 60 / 0.4) 51.95%, oklch(0.32 0.015 60 / 0.4) 52%, transparent 52%)
            `,
            backgroundSize: "850px 950px",
            backgroundPosition: "350px 450px",
          }}
        />

        {/* Layer 3: Counter-flow with perspective */}
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
            backgroundImage: `
              linear-gradient(78deg, transparent 49.95%, oklch(0.32 0.015 60 / 0.35) 49.95%, oklch(0.32 0.015 60 / 0.35) 50%, transparent 50%)
            `,
            backgroundSize: "1200px 1000px",
            backgroundPosition: "200px 100px",
            transformStyle: "preserve-3d",
          }}
        />

        {/* Layer 4: Fast wave */}
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
            backgroundImage: `
              linear-gradient(155deg, transparent 51.95%, oklch(0.32 0.015 60 / 0.3) 51.95%, oklch(0.32 0.015 60 / 0.3) 52%, transparent 52%)
            `,
            backgroundSize: "900px 1050px",
            backgroundPosition: "500px 200px",
          }}
        />
      </div>

      <div className="relative px-6 pb-8 max-w-7xl mx-auto min-h-screen flex flex-col">
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

          <div className="flex items-center justify-around gap-2 grow">
            <div className="h-9 w-full border bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,var(--primary)_8px,var(--primary)_9px)] opacity-30 border-primary/70" />
            <div className="h-9 w-full border bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,var(--primary)_8px,var(--primary)_9px)] opacity-30 border-primary/70 hidden sm:block" />
            <div className="h-9 w-full border bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,var(--primary)_8px,var(--primary)_9px)] opacity-30 border-primary/70 hidden sm:block" />
            <div className="h-9 w-full border bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,var(--primary)_8px,var(--primary)_9px)] opacity-30 border-primary/70 hidden md:block" />
            <div className="h-9 w-full border bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,var(--primary)_8px,var(--primary)_9px)] opacity-30 border-primary/70 hidden md:block" />
            <div className="h-9 w-full border bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,var(--primary)_8px,var(--primary)_9px)] opacity-30 border-primary/70 hidden md:block" />
            <div className="h-9 w-full border bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,var(--primary)_8px,var(--primary)_9px)] opacity-30 border-primary/70 hidden lg:block" />
          </div>

          <Button
            className="bg-linear-to-br from-primary via-primary to-primary/90 hover:brightness-110 transition-all duration-200"
            asChild
          >
            <Link href={"/dashboard"}>Get Started</Link>
          </Button>
        </nav>

        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 flex items-center justify-center py-12 md:py-20"
        >
          <div className="max-w-5xl mx-auto text-center space-y-8 px-4">
            {/* Badge */}
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-primary/20 bg-primary/5 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Insyallah free forever
                </span>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Invoice Management
                <span className="mt-2.5 block">
                  Made&nbsp;
                  <DecoratedText className="text-[#39312b] shadow" delay={0.5}>
                    Simple
                  </DecoratedText>
                </span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Create, manage, and track invoices effortlessly. A streamlined
              solution designed for businesses of all sizes.
            </motion.p>

            {/* CTA Button */}
            <motion.div variants={itemVariants} className="pt-4">
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
                {/* corner ornaments */}
                <motion.div
                  className="absolute -inset-[5px] pointer-events-none opacity-40"
                  animate={{ opacity: [1, 0.3, 1, 0.3, 1] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: "easeInOut",
                  }}
                >
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/50" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/50" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/50" />
                </motion.div>

                <Button
                  size="lg"
                  className="relative bg-primary hover:bg-primary/90 text-base h-12 px-10 group overflow-hidden border border-primary/30 shadow-xl shadow-primary/20"
                  asChild
                >
                  <Link href={"/dashboard"}>
                    <span className="relative z-10 flex items-center gap-1 font-semibold tracking-wide">
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
                    </span>
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
            <motion.div
              variants={imageVariants}
              className="relative max-w-6xl mx-auto mt-12 md:mt-16"
              style={{ perspective: 1400, transformStyle: "preserve-3d" }}
            >
              <div className="p-2 rounded-lg relative overflow-hidden bg-linear-to-tl from-primary/50 via-primary/50 to-primary/20">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    background:
                      "repeating-linear-gradient(45deg, transparent, transparent 8px, var(--primary) 8px, var(--primary) 9px)",
                  }}
                />
                <Image
                  src="/preview.jpg"
                  alt="Faktur Dashboard Preview"
                  width={1200}
                  height={800}
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px"
                  className="shadow-2xl relative z-10"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
