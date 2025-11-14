import { httpBatchLink } from "@trpc/client";
import { appRouter } from "@/server";
import { createTRPCContext } from "@/server/trpc";

export const serverTrpc = appRouter.createCaller(await createTRPCContext());

/**
 * Helper to get the base URL for tRPC requests
 */
function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * Server-side tRPC client configuration
 */
export const serverTrpcConfig = {
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ],
};
