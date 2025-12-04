import { ClientForm } from "@/components/clients/client-form";
import { Users } from "lucide-react";

export default function NewClientPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="space-y-1">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Add Client</h1>
          <p className="text-muted-foreground text-sm">
            Create a new client for your business
          </p>
        </div>
      </div>

      <ClientForm />
    </div>
  );
}
