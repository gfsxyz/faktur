import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { clients, invoices } from "@/lib/db/schema";
import { eq, and, desc, asc, sql, ilike, or, isNull } from "drizzle-orm";
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
      .where(and(eq(clients.userId, ctx.userId), isNull(clients.archivedAt)));

    return (result[0]?.count ?? 0) > 0;
  }),

  // Search clients by name or company (for combobox/autocomplete)
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(0).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const sanitizedQuery = sanitizeSearchInput(input.query);

      // If query is empty, return empty array
      if (!sanitizedQuery) {
        return [];
      }

      const pattern = createILikePattern(sanitizedQuery);

      // Search by name or company, limit to 10 results
      const results = await db
        .select({
          id: clients.id,
          name: clients.name,
          company: clients.company,
        })
        .from(clients)
        .where(
          and(
            eq(clients.userId, ctx.userId),
            isNull(clients.archivedAt),
            or(
              ilike(clients.name, pattern),
              ilike(clients.company, pattern)
            )!
          )
        )
        .orderBy(desc(clients.createdAt))
        .limit(10);

      return results;
    }),

  // Get all clients for the current user
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(10),
          page: z.number().min(1).default(1),
          search: z.string().optional(),
          sortBy: z.enum(["createdAt", "overdueAmount"]).optional(),
          sortOrder: z.enum(["asc", "desc"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const page = input?.page ?? 1;
      const searchRaw = input?.search;
      const sortBy = input?.sortBy ?? "createdAt";
      const sortOrder = input?.sortOrder ?? "desc";
      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = [eq(clients.userId, ctx.userId), isNull(clients.archivedAt)];

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

      // Get paginated clients with overdue amounts
      const clientsList = await db
        .select({
          id: clients.id,
          userId: clients.userId,
          name: clients.name,
          email: clients.email,
          phone: clients.phone,
          company: clients.company,
          address: clients.address,
          city: clients.city,
          state: clients.state,
          country: clients.country,
          postalCode: clients.postalCode,
          taxId: clients.taxId,
          notes: clients.notes,
          archivedAt: clients.archivedAt,
          createdAt: clients.createdAt,
          updatedAt: clients.updatedAt,
          overdueAmount: sql<number>`COALESCE((
            SELECT SUM(i.total - i."amountPaid")
            FROM invoice i
            WHERE i."clientId" = client.id
              AND i.status = 'overdue'
              AND i."archivedAt" IS NULL
          ), 0)`.as("overdueAmount"),
          lastInvoiceAt: sql<Date>`(
            SELECT MAX(i."createdAt")
            FROM invoice i
            WHERE i."clientId" = client.id
              AND i."archivedAt" IS NULL
          )`.as("lastInvoiceAt"),
        })
        .from(clients)
        .where(and(...conditions))
        .orderBy(
          sortBy === "overdueAmount"
            ? sortOrder === "asc"
              ? sql`"overdueAmount" ASC`
              : sql`"overdueAmount" DESC`
            : sortOrder === "asc"
              ? sql`"lastInvoiceAt" ASC NULLS LAST`
              : sql`"lastInvoiceAt" DESC NULLS LAST`
        )
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
        .where(and(eq(clients.id, input.id), eq(clients.userId, ctx.userId), isNull(clients.archivedAt)))
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

  // Delete a client (soft delete)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date();

      // Soft delete all related invoices
      await db
        .update(invoices)
        .set({ archivedAt: now })
        .where(
          and(
            eq(invoices.clientId, input.id),
            eq(invoices.userId, ctx.userId),
            isNull(invoices.archivedAt)
          )
        );

      // Soft delete the client
      await db
        .update(clients)
        .set({ archivedAt: now })
        .where(and(eq(clients.id, input.id), eq(clients.userId, ctx.userId)));

      return { success: true };
    }),
});
