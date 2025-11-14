import { createTRPCRouter } from "./trpc";
import { healthRouter } from "./routers/health";
import { invoicesRouter } from "./routers/invoices";
import { clientsRouter } from "./routers/clients";
import { dashboardRouter } from "./routers/dashboard";
import { businessProfileRouter } from "./routers/business-profile";
import { paymentsRouter } from "./routers/payments";

/**
 * Main tRPC router
 * Add your routers here
 */
export const appRouter = createTRPCRouter({
  health: healthRouter,
  invoices: invoicesRouter,
  clients: clientsRouter,
  dashboard: dashboardRouter,
  businessProfile: businessProfileRouter,
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;
