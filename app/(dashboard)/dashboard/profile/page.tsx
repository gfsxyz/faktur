"use client";

import { BusinessProfileForm } from "@/components/profile/business-profile-form";
import { Building2 } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Business Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your company information and settings
            </p>
          </div>
        </div>
      </div>

      <BusinessProfileForm />
    </div>
  );
}
