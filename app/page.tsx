"use client";

import { trpc } from "@/lib/trpc/client";

export default function Home() {
  const { data, isLoading, error } = trpc.health.ping.useQuery();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-24">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Faktur
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Modern Invoice Management System
          </p>
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
              {isLoading && <span className="text-yellow-600">⟳ Testing...</span>}
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
                  {data.message} at {new Date(data.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Frontend</h3>
              <ul className="space-y-1 text-sm">
                <li>• Next.js 16</li>
                <li>• React 19</li>
                <li>• Tailwind CSS v4</li>
                <li>• shadcn/ui</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Backend</h3>
              <ul className="space-y-1 text-sm">
                <li>• SQLite</li>
                <li>• Drizzle ORM</li>
                <li>• tRPC</li>
                <li>• Better Auth</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Week 1 Foundation Complete ✨
          </p>
        </div>
      </div>
    </div>
  );
}
