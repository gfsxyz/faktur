"use client";

import { BusinessProfileForm } from "@/components/profile/business-profile-form";

export default function ProfilePage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="space-y-2">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-primary">
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
