import { useState } from "react";

export interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [, setToast] = useState<Toast | null>(null);

  const toast = (toastData: Toast) => {
    setToast(toastData);
    // Simple console log for now - in production this would trigger a toast UI
    console.log(`[Toast ${toastData.variant || "default"}]:`, toastData.title, toastData.description);
    // You can implement a proper toast notification UI later
    if (typeof window !== "undefined") {
      if (toastData.variant === "destructive") {
        alert(`Error: ${toastData.description || toastData.title}`);
      }
    }
  };

  return { toast };
}
