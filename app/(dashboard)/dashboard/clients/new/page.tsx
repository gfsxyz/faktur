import { ClientForm } from "@/components/clients/client-form";
import { Users } from "lucide-react";

export default function NewClientPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Add Client
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a new client for your business
            </p>
          </div>
        </div>
      </div>

      <ClientForm />
    </div>
  );
}
