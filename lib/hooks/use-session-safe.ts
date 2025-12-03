import { useEffect, useState, useRef } from "react";
import { authClient } from "@/lib/auth/client";

interface SessionData {
  data: any;
  isPending: boolean;
}

/**
 * Safe wrapper around useSession that defers API calls until client mount
 * This prevents duplicate /api/auth/get-session calls on initial page load
 */
export function useSessionSafe(): SessionData {
  const [session, setSession] = useState<SessionData>({
    data: null,
    isPending: true,
  });
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (isMountedRef.current) return;
    isMountedRef.current = true;

    // Fetch session after component mounts
    const fetchSession = async () => {
      try {
        const data = await authClient.getSession();
        setSession({
          ...data,
          isPending: false,
        });
      } catch {
        console.log("Session error!");
      }
    };

    fetchSession();
  }, []);

  return session;
}
