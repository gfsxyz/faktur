"use client";

import { BusinessProfileForm } from "@/components/profile/business-profile-form";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Profile</h1>
        <p className="text-muted-foreground">
          Manage your company information and settings
        </p>
      </div>

      <BusinessProfileForm />
    </div>
  );
}
