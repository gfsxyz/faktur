"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface ClientEmptyStateProps {
  type: "no-clients" | "no-results";
}

export function ClientEmptyState({ type }: ClientEmptyStateProps) {
  if (type === "no-results") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
            <Users className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <p className="mt-4 text-sm font-medium">No clients found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters to see more results
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
          <Users className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground mb-4">
          Clients you add will appear here
        </p>
        <Button asChild className="h-10">
          <Link href="/dashboard/clients/new">Add Your First Client</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
