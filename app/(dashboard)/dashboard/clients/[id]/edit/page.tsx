"use client";

import { use } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { ClientForm } from "@/components/clients/client-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: client, isLoading } = trpc.clients.getById.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading client...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <p className="text-lg font-medium">Client not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
      </div>
    );
  }

  const defaultValues = {
    name: client.name,
    email: client.email,
    phone: client.phone || "",
    company: client.company || "",
    address: client.address || "",
    city: client.city || "",
    state: client.state || "",
    country: client.country || "",
    postalCode: client.postalCode || "",
    taxId: client.taxId || "",
    notes: client.notes || "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Edit Client</h1>
        <p className="text-muted-foreground text-sm">
          Update information for {client.name}
        </p>
      </div>

      <ClientForm clientId={id} defaultValues={defaultValues} />
    </div>
  );
}
