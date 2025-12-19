"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.serwist !== undefined
    ) {
      // This tells Serwist to register the public/sw.js file
      window.serwist.register();
    }
  }, []);

  return null; // This component doesn't render anything
}
