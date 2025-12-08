"use client";

import { useState, useEffect } from "react";
import { TemplateType } from "@/components/invoices/types";

const STORAGE_KEY = "invoice-template-preference";
const DEFAULT_TEMPLATE: TemplateType = "classic";

/**
 * Custom hook to manage invoice template preference with localStorage persistence.
 * Follows single source of truth pattern - localStorage is the source, React state is derived.
 */
export function useTemplatePreference() {
  const [template, setTemplate] = useState<TemplateType>(DEFAULT_TEMPLATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as TemplateType;
        setTemplate(parsed);
      } catch {
        // If parsing fails, use default
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATE));
      }
    } else {
      // Set default if nothing is stored
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATE));
    }
    setIsLoaded(true);
  }, []);

  // Update both state and localStorage (single source of truth)
  const updateTemplate = (newTemplate: TemplateType) => {
    setTemplate(newTemplate);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplate));
  };

  return {
    template,
    setTemplate: updateTemplate,
    isLoaded,
  };
}
