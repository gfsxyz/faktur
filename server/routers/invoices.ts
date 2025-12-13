import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { invoices, invoiceItems, clients } from "@/lib/db/schema";
import { eq, and, desc, sql, gte, ilike, or } from "drizzle-orm";
import { sanitizeSearchInput, createILikePattern } from "@/lib/sanitize";
import { roundMoney, moneyAdd, moneySubtract, moneyMultiply } from "@/lib/utils/money";

const invoiceItemSchema = z.object({
  description: z
    .string()
    .min(1, "Item description is required")
    .min(3, "Description must be at least 3 characters long")
    .max(500, "Description must not exceed 500 characters")
    .transform((val) => val.trim()),
  quantity: z
    .number()
    .min(0.01, "Quantity must be greater than 0")
    .max(1000000, "Quantity must not exceed 1,000,000")
    .finite("Quantity must be a valid finite number"),
  rate: z
    .number()
    .min(0, "Rate cannot be negative")
    .max(100000000, "Rate must not exceed 100,000,000")
    .finite("Rate must be a valid finite number"),
  amount: z
    .number()
    .min(0, "Amount cannot be negative")
    .finite("Amount must be a valid finite number"),
  order: z.number().int("Order must be a whole number").min(0).default(0),
});

const createInvoiceSchema = z
  .object({
    clientId: z
      .string()
      .min(1, "Please select a client for this invoice"),
    issueDate: z.date(),
    dueDate: z.date(),
    status: z
      .enum(["draft", "sent", "paid", "overdue", "cancelled"])
      .default("draft"),
    taxRate: z
      .number()
      .min(0, "Tax rate cannot be negative")
      .max(100, "Tax rate cannot exceed 100%")
      .finite("Tax rate must be a valid finite number")
      .default(0),
    discountType: z
      .enum(["percentage", "fixed", "none"])
      .optional(),
    discountValue: z
      .number()
      .min(0, "Discount value cannot be negative")
      .max(100000000, "Discount value must not exceed 100,000,000")
      .finite("Discount value must be a valid finite number")
      .default(0),
    notes: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length <= 5000,
        "Notes must not exceed 5000 characters"
      )
      .transform((val) => val?.trim() || ""),
    terms: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length <= 5000,
        "Terms must not exceed 5000 characters"
      )
      .transform((val) => val?.trim() || ""),
    items: z
      .array(invoiceItemSchema)
      .min(1, "Invoice must have at least one line item")
      .max(100, "Invoice cannot have more than 100 line items"),
  })
  .refine(
    (data) => {
      return data.dueDate >= data.issueDate;
    },
    {
      message: "Due date must be on or after the issue date",
      path: ["dueDate"],
    }
  )
  .refine(
    (data) => {
      if (data.discountType === "percentage" && data.discountValue > 0) {
        return data.discountValue <= 100;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    }
  );

export const invoicesRouter = createTRPCRouter({
  // Check if user has any invoices
  hasAny: protectedProcedure.query(async ({ ctx }) => {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(eq(invoices.userId, ctx.userId));

    return (result[0]?.count ?? 0) > 0;
  }),

  // Get all invoices for the current user with client info
  list: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(10),
          page: z.number().min(1).default(1),
          days: z.number().min(1).optional(),
          status: z
            .enum(["draft", "sent", "paid", "overdue", "cancelled"])
            .optional(),
          search: z.string().optional(),
          clientId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 10;
      const page = input?.page ?? 1;
      const days = input?.days;
      const status = input?.status;
      const searchRaw = input?.search;
      const clientId = input?.clientId;
      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = [eq(invoices.userId, ctx.userId)];

      // Add client filter if provided
      if (clientId) {
        conditions.push(eq(invoices.clientId, clientId));
      }

      // Add date filter if days is provided (based on issue date)
      if (days) {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - days);
        conditions.push(gte(invoices.issueDate, dateThreshold));
      }

      // Add status filter if provided
      if (status) {
        conditions.push(eq(invoices.status, status));
      }

      // Add search filter if provided (sanitized)
      if (searchRaw) {
        const sanitizedSearch = sanitizeSearchInput(searchRaw);
        if (sanitizedSearch) {
          const pattern = createILikePattern(sanitizedSearch);
          conditions.push(
            or(
              ilike(clients.name, pattern),
              ilike(clients.company, pattern)
            )!
          );
        }
      }

      // Get total count (need to join clients for search filter)
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(invoices)
        .leftJoin(clients, eq(invoices.clientId, clients.id))
        .where(and(...conditions));

      const total = countResult[0]?.count ?? 0;

      // Get paginated invoices
      const invoicesList = await db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          status: invoices.status,
          issueDate: invoices.issueDate,
          dueDate: invoices.dueDate,
          total: invoices.total,
          amountPaid: invoices.amountPaid,
          clientId: invoices.clientId,
          clientName: clients.name,
          clientCompany: clients.company,
          createdAt: invoices.createdAt,
        })
        .from(invoices)
        .leftJoin(clients, eq(invoices.clientId, clients.id))
        .where(and(...conditions))
        .orderBy(desc(invoices.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        invoices: invoicesList,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }),

  // Get a single invoice with all details
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get invoice with client data
      const [invoice] = await db
        .select({
          invoice: invoices,
          client: clients,
        })
        .from(invoices)
        .leftJoin(clients, eq(invoices.clientId, clients.id))
        .where(and(eq(invoices.id, input.id), eq(invoices.userId, ctx.userId)))
        .limit(1);

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // Get invoice items
      const items = await db
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, input.id))
        .orderBy(invoiceItems.order);

      return {
        ...invoice.invoice,
        client: invoice.client,
        items,
      };
    }),

  // Generate next invoice number
  getNextInvoiceNumber: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get all invoice numbers for the user
      const userInvoices = await db
        .select({ invoiceNumber: invoices.invoiceNumber })
        .from(invoices)
        .where(eq(invoices.userId, ctx.userId));

      // Extract numbers from valid INV-XXXXX format invoices
      const numbers = userInvoices
        .map((inv) => {
          const match = inv.invoiceNumber?.match(/^INV-(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((num) => num > 0);

      // Get the max number, or start at 0 if no valid invoices
      const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
      const nextNum = maxNum + 1;
      return `INV-${nextNum.toString().padStart(5, "0")}`;
    } catch (error) {
      // Fallback to a safe default if query fails
      console.error("Error getting next invoice number:", error);
      return "INV-00001";
    }
  }),

  // Calculate invoice totals
  calculateTotals: protectedProcedure
    .input(
      z.object({
        items: z.array(invoiceItemSchema),
        taxRate: z.number(),
        discountType: z.enum(["percentage", "fixed"]).optional(),
        discountValue: z.number(),
      })
    )
    .query(({ input }) => {
      const subtotal = roundMoney(
        input.items.reduce((sum, item) => sum + item.amount, 0)
      );

      let discountAmount = 0;
      if (input.discountType === "percentage") {
        discountAmount = moneyMultiply(subtotal, input.discountValue / 100);
      } else if (input.discountType === "fixed") {
        discountAmount = roundMoney(input.discountValue);
      }

      const afterDiscount = moneySubtract(subtotal, discountAmount);
      const taxAmount = moneyMultiply(afterDiscount, input.taxRate / 100);
      const total = moneyAdd(afterDiscount, taxAmount);

      return {
        subtotal,
        discountAmount,
        taxAmount,
        total,
      };
    }),

  // Create a new invoice
  create: protectedProcedure
    .input(createInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      const { items, ...invoiceData } = input;

      // Calculate totals with proper rounding
      const subtotal = roundMoney(
        items.reduce((sum, item) => sum + item.amount, 0)
      );

      let discountAmount = 0;
      if (invoiceData.discountType === "percentage") {
        discountAmount = moneyMultiply(subtotal, invoiceData.discountValue / 100);
      } else if (invoiceData.discountType === "fixed") {
        discountAmount = roundMoney(invoiceData.discountValue);
      }

      const afterDiscount = moneySubtract(subtotal, discountAmount);
      const taxAmount = moneyMultiply(afterDiscount, invoiceData.taxRate / 100);
      const total = moneyAdd(afterDiscount, taxAmount);

      // Generate invoice number
      const result = await db
        .select({
          maxNumber: sql<string>`MAX(CAST(SUBSTRING("invoiceNumber" FROM 5) AS INTEGER))`,
        })
        .from(invoices)
        .where(eq(invoices.userId, ctx.userId));

      const maxNum = result[0]?.maxNumber ? parseInt(result[0].maxNumber) : 0;
      const nextNum = maxNum + 1;
      const invoiceNumber = `INV-${nextNum.toString().padStart(5, "0")}`;

      // Create invoice
      const [invoice] = await db
        .insert(invoices)
        .values({
          ...invoiceData,
          invoiceNumber,
          userId: ctx.userId,
          subtotal,
          taxAmount,
          discountAmount,
          total,
        })
        .returning();

      // Create invoice items
      await db.insert(invoiceItems).values(
        items.map((item) => ({
          ...item,
          invoiceId: invoice.id,
        }))
      );

      return invoice;
    }),

  // Update an invoice
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: createInvoiceSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { items, ...invoiceData } = input.data;

      // Calculate totals with proper rounding
      const subtotal = roundMoney(
        items.reduce((sum, item) => sum + item.amount, 0)
      );

      let discountAmount = 0;
      if (invoiceData.discountType === "percentage") {
        discountAmount = moneyMultiply(subtotal, invoiceData.discountValue / 100);
      } else if (invoiceData.discountType === "fixed") {
        discountAmount = roundMoney(invoiceData.discountValue);
      }

      const afterDiscount = moneySubtract(subtotal, discountAmount);
      const taxAmount = moneyMultiply(afterDiscount, invoiceData.taxRate / 100);
      const total = moneyAdd(afterDiscount, taxAmount);

      // Update invoice
      const [invoice] = await db
        .update(invoices)
        .set({
          ...invoiceData,
          subtotal,
          taxAmount,
          discountAmount,
          total,
          updatedAt: new Date(),
        })
        .where(and(eq(invoices.id, input.id), eq(invoices.userId, ctx.userId)))
        .returning();

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // Delete old items and create new ones
      await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, input.id));

      await db.insert(invoiceItems).values(
        items.map((item) => ({
          ...item,
          invoiceId: invoice.id,
        }))
      );

      return invoice;
    }),

  // Update invoice status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [invoice] = await db
        .update(invoices)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(and(eq(invoices.id, input.id), eq(invoices.userId, ctx.userId)))
        .returning();

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      return invoice;
    }),

  // Delete an invoice
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Items will be cascade deleted
      await db
        .delete(invoices)
        .where(and(eq(invoices.id, input.id), eq(invoices.userId, ctx.userId)));

      return { success: true };
    }),
});
