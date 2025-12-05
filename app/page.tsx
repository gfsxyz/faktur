import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <header className="relative min-h-screen bg-primary/5">
      <div className="px-8 pb-8 max-w-6xl mx-auto min-h-screen flex flex-col">
        <nav className="flex items-center justify-between gap-4">
          <div className="flex h-16 items-center">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image
                src={"/faktur-logo.svg"}
                alt="Faktur logo"
                width={34}
                height={34}
                className="dark:grayscale-100 dark:invert-100 transition-all duration-500 ease-in-out"
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

        <div className="py-20 md:py-32 grow flex items-center">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">
                Free forever, no credit card required
              </span>
            </div>

            {/* Heading with gradient */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Invoice Management{" "}
              <span className="bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Manage, and track invoices with ease. Streamlined
              <br /> approach to invoice management for businesses of all sizes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                className="bg-linear-to-br from-primary via-primary to-primary/90 hover:brightness-110 hover:scale-105 transition-all duration-200 text-base shadow-lg shadow-primary/25"
                asChild
                size={"lg"}
              >
                <Link href={"/dashboard"}>
                  Try for free
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="h-9 w-full border bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,var(--primary)_8px,var(--primary)_9px)] opacity-30 border-primary/70" />
      </div>
    </header>
  );
}
