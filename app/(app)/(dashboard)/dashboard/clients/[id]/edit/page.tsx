"use client";

import { use } from "react";
import { trpc } from "@/lib/trpc/client";
import { ClientForm } from "@/components/clients/client-form";
import { NotFound } from "@/components/ui/not-found";
import LoadingLogo from "@/components/loading-logo";

export default function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: client, isLoading } = trpc.clients.getById.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingLogo />
      </div>
    );
  }

  if (!client) {
    return (
      <NotFound
        prefix="Client"
        backHref="/dashboard/clients"
        backLabel="Back to Clients"
      />
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
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-lg font-bold tracking-tight text-primary">
          Edit Client
        </h1>
        <p className="text-muted-foreground text-sm">
          Update information for {client.name}
        </p>
      </div>

      <ClientForm clientId={id} defaultValues={defaultValues} />
    </div>
  );
}
