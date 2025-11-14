import { createTRPCRouter } from "./trpc";
import { healthRouter } from "./routers/health";

/**
 * Main tRPC router
 * Add your routers here
 */
export const appRouter = createTRPCRouter({
  health: healthRouter,
});

export type AppRouter = typeof appRouter;
