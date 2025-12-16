"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Shredder } from "lucide-react";
import EmptyState from "../ui/empty-state";

interface InvoiceEmptyStateProps {
  type: "no-invoices" | "no-results";
}

export function InvoiceEmptyState({ type }: InvoiceEmptyStateProps) {
  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center justify-center py-12 min-h-[50dvh]">
        <EmptyState
          icon={<Shredder size={44} />}
          description="No invoices found"
        />
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
          <FileText className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground mb-4">
          Invoices you create will appear here
        </p>
        <Button asChild className="h-10">
          <Link href="/dashboard/invoices/new">Create Your First Invoice</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
