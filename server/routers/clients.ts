import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
});

export const clientsRouter = createTRPCRouter({
  // Get all clients for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db
      .select()
      .from(clients)
      .where(eq(clients.userId, ctx.userId))
      .orderBy(desc(clients.createdAt));
  }),

  // Get a single client by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [client] = await db
        .select()
        .from(clients)
        .where(and(eq(clients.id, input.id), eq(clients.userId, ctx.userId)))
        .limit(1);

      if (!client) {
        throw new Error("Client not found");
      }

      return client;
    }),

  // Create a new client
  create: protectedProcedure
    .input(createClientSchema)
    .mutation(async ({ ctx, input }) => {
      const [client] = await db
        .insert(clients)
        .values({
          ...input,
          userId: ctx.userId,
        })
        .returning();

      return client;
    }),

  // Update a client
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createClientSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [client] = await db
        .update(clients)
        .set({
          ...input.data,
          updatedAt: new Date(),
        })
        .where(and(eq(clients.id, input.id), eq(clients.userId, ctx.userId)))
        .returning();

      if (!client) {
        throw new Error("Client not found");
      }

      return client;
    }),

  // Delete a client
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(clients)
        .where(and(eq(clients.id, input.id), eq(clients.userId, ctx.userId)));

      return { success: true };
    }),
});
