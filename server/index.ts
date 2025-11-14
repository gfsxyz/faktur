import { createTRPCRouter } from "./trpc";
import { healthRouter } from "./routers/health";
import { invoicesRouter } from "./routers/invoices";
import { clientsRouter } from "./routers/clients";

/**
 * Main tRPC router
 * Add your routers here
 */
export const appRouter = createTRPCRouter({
  health: healthRouter,
  invoices: invoicesRouter,
  clients: clientsRouter,
});

export type AppRouter = typeof appRouter;
