"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { ClientForm } from "@/components/clients/client-form";
import { NotFound } from "@/components/ui/not-found";
import {
  DeleteConfirmationDialog,
  useDeleteConfirmation,
} from "@/components/ui/delete-confirmation-dialog";
import { toast } from "sonner";
import LoadingLogo from "@/components/loading-logo";

export default function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();
  const deleteConfirmation = useDeleteConfirmation();
  const { data: client, isLoading } = trpc.clients.getById.useQuery({ id });

  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      utils.clients.hasAny.invalidate();
      toast.success("Client deleted successfully");
      router.push("/dashboard/clients");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to delete client");
    },
  });

  const handleDelete = () => {
    deleteConfirmation.confirm(async () => {
      await deleteMutation.mutateAsync({ id });
    });
  };

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

      <ClientForm
        clientId={id}
        defaultValues={defaultValues}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />

      <DeleteConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.handleCancel}
        onConfirm={deleteConfirmation.handleConfirm}
        title="Delete Client"
        description="Are you sure you want to delete this client? This will also delete all associated invoices. This action cannot be undone."
      />
    </div>
  );
}
