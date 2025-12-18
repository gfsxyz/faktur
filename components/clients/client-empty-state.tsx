"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Handshake, TentTree, Users } from "lucide-react";
import EmptyState from "../ui/empty-state";

interface ClientEmptyStateProps {
  type: "no-clients" | "no-results";
}

export function ClientEmptyState({ type }: ClientEmptyStateProps) {
  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center justify-center py-12 min-h-[50dvh]">
        <EmptyState
          icon={<TentTree size={44} />}
          description="No clients found"
        />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 min-h-[70dvh]">
        <EmptyState
          icon={<TentTree size={44} />}
          cta={
            <Button asChild variant={"outline"}>
              <Link href="/dashboard/clients/new">
                <Handshake />
                Add Client
              </Link>
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}
