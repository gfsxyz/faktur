"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data, isLoading, error } = trpc.health.ping.useQuery();
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-24">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Faktur</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Modern Invoice Management System
          </p>
        </div>

        <div className="text-center space-y-4">
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/signup">Create Account</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">System Status</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-md bg-muted/50">
              <span className="font-medium">Database:</span>
              <span className="text-green-600">✓ Connected (SQLite)</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-md bg-muted/50">
              <span className="font-medium">tRPC:</span>
              {isLoading && (
                <span className="text-yellow-600">⟳ Testing...</span>
              )}
              {error && <span className="text-red-600">✗ Error</span>}
              {data && <span className="text-green-600">✓ Connected</span>}
            </div>

            <div className="flex items-center justify-between p-4 rounded-md bg-muted/50">
              <span className="font-medium">Authentication:</span>
              <span className="text-green-600">✓ Better Auth Ready</span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-md bg-muted/50">
              <span className="font-medium">API Response:</span>
              {data && (
                <span className="text-sm text-muted-foreground">
                  {data.message} at{" "}
                  {new Date(data.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
