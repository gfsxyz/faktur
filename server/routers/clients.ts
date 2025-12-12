import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { clients, invoices } from "@/lib/db/schema";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { sanitizeSearchInput, createILikePattern } from "@/lib/sanitize";

const createClientSchema = z.object({
  name: z
    .string()
    .min(1, "Client name is required")
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name must not exceed 100 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    )
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
  // Check if user has any clients
  hasAny: protectedProcedure.query(async ({ ctx }) => {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(clients)
      .where(eq(clients.userId, ctx.userId));

    return (result[0]?.count ?? 0) > 0;
  }),

  // Get all clients for the current user
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(10),
          page: z.number().min(1).default(1),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const page = input?.page ?? 1;
      const searchRaw = input?.search;
      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = [eq(clients.userId, ctx.userId)];

      // Add search filter if provided (sanitized)
      if (searchRaw) {
        const sanitizedSearch = sanitizeSearchInput(searchRaw);
        if (sanitizedSearch) {
          const pattern = createILikePattern(sanitizedSearch);
          conditions.push(
            or(
              ilike(clients.name, pattern),
              ilike(clients.company, pattern),
              ilike(clients.email, pattern)
            )!
          );
        }
      }

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(clients)
        .where(and(...conditions));

      const total = countResult[0]?.count ?? 0;

      // Get paginated clients
      const clientsList = await db
        .select()
        .from(clients)
        .where(and(...conditions))
        .orderBy(desc(clients.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        clients: clientsList,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
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
      // Check if client has any related invoices
      const relatedInvoices = await db
        .select()
        .from(invoices)
        .where(
          and(eq(invoices.clientId, input.id), eq(invoices.userId, ctx.userId))
        )
        .limit(1);

      if (relatedInvoices.length > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Cannot delete client with existing invoices.",
        });
      }

      await db
        .delete(clients)
        .where(and(eq(clients.id, input.id), eq(clients.userId, ctx.userId)));

      return { success: true };
    }),
});
