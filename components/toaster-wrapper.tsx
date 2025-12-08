"use client";

import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";

export function ToasterWrapper() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return <Toaster position={isMobile ? "bottom-center" : "top-right"} />;
}
