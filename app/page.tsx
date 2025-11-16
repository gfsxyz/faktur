"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "@/lib/auth/client";
import { AnimatedGrid } from "@/components/landing/animated-grid";
import { HeroSection } from "@/components/landing/hero-section";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <div className="relative min-h-screen">
      <AnimatedGrid />
      <HeroSection />
    </div>
  );
}
