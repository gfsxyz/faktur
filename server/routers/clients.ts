import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { clients } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

const createClientSchema = z.object({
  name: z
    .string()
    .min(1, "Client name is required")
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
    .transform((val) => val.trim()),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address (e.g., john@example.com)")
    .max(255, "Email address must not exceed 255 characters")
    .toLowerCase()
    .transform((val) => val.trim()),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\d\s\-\+\(\)]+$/.test(val),
      "Phone number can only contain digits, spaces, hyphens, plus signs, and parentheses"
    )
    .transform((val) => val?.trim() || ""),
  company: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 200,
      "Company name must not exceed 200 characters"
    )
    .transform((val) => val?.trim() || ""),
  address: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 500,
      "Address must not exceed 500 characters"
    )
    .transform((val) => val?.trim() || ""),
  city: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z\s\-']+$/.test(val),
      "City can only contain letters, spaces, hyphens, and apostrophes"
    )
    .refine(
      (val) => !val || val.length <= 100,
      "City name must not exceed 100 characters"
    )
    .transform((val) => val?.trim() || ""),
  state: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 100,
      "State/Province must not exceed 100 characters"
    )
    .transform((val) => val?.trim() || ""),
  country: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-zA-Z\s\-']+$/.test(val),
      "Country can only contain letters, spaces, hyphens, and apostrophes"
    )
    .refine(
      (val) => !val || val.length <= 100,
      "Country name must not exceed 100 characters"
    )
    .transform((val) => val?.trim() || ""),
  postalCode: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[A-Z0-9\s\-]+$/i.test(val),
      "Postal code can only contain letters, numbers, spaces, and hyphens"
    )
    .refine(
      (val) => !val || val.length <= 20,
      "Postal code must not exceed 20 characters"
    )
    .transform((val) => val?.trim() || ""),
  taxId: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 5,
      "Tax ID must be at least 5 characters if provided"
    )
    .refine(
      (val) => !val || val.length <= 50,
      "Tax ID must not exceed 50 characters"
    )
    .transform((val) => val?.trim() || ""),
  notes: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length <= 2000,
      "Notes must not exceed 2000 characters"
    )
    .transform((val) => val?.trim() || ""),
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
