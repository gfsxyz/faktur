import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const healthRouter = createTRPCRouter({
  // Public endpoint - no auth required
  ping: publicProcedure.query(() => {
    return { message: "pong", timestamp: new Date() };
  }),

  // Protected endpoint - requires authentication
  me: protectedProcedure.query(({ ctx }) => {
    return {
      userId: ctx.userId,
      session: ctx.session,
    };
  }),
});
