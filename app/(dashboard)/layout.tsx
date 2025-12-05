"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSessionSafe } from "@/lib/hooks/use-session-safe";
import { Sidebar } from "@/components/dashboard/sidebar";
import LoadingLogo from "@/components/loading-logo";
import MobileNav from "@/components/dashboard/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSessionSafe();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingLogo />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen md:overflow-hidden">
      <aside className="hidden w-64 md:block">
        <Sidebar />
      </aside>
      <div className="flex flex-1 md:flex-col md:overflow-hidden">
        <MobileNav />
        <main className="flex-1 overflow-y-auto bg-background px-6 pt-20 md:pt-2.5 pb-24">
          {children}
        </main>
      </div>
    </div>
  );
}
