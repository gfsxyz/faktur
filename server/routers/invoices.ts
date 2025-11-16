import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { invoices, invoiceItems, clients } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

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
      .min(1, "Please select a client for this invoice")
      .uuid("Invalid client selection"),
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
      .enum(["percentage", "fixed"])
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
  // Get all invoices for the current user with client info
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db
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
        clientEmail: clients.email,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(eq(invoices.userId, ctx.userId))
      .orderBy(desc(invoices.createdAt));
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
    const result = await db
      .select({
        maxNumber: sql<string>`MAX(CAST(SUBSTR(invoiceNumber, 5) AS INTEGER))`,
      })
      .from(invoices)
      .where(eq(invoices.userId, ctx.userId));

    const maxNum = result[0]?.maxNumber ? parseInt(result[0].maxNumber) : 0;
    const nextNum = maxNum + 1;
    return `INV-${nextNum.toString().padStart(5, "0")}`;
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
      const subtotal = input.items.reduce((sum, item) => sum + item.amount, 0);

      let discountAmount = 0;
      if (input.discountType === "percentage") {
        discountAmount = (subtotal * input.discountValue) / 100;
      } else if (input.discountType === "fixed") {
        discountAmount = input.discountValue;
      }

      const afterDiscount = subtotal - discountAmount;
      const taxAmount = (afterDiscount * input.taxRate) / 100;
      const total = afterDiscount + taxAmount;

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

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

      let discountAmount = 0;
      if (invoiceData.discountType === "percentage") {
        discountAmount = (subtotal * invoiceData.discountValue) / 100;
      } else if (invoiceData.discountType === "fixed") {
        discountAmount = invoiceData.discountValue;
      }

      const afterDiscount = subtotal - discountAmount;
      const taxAmount = (afterDiscount * invoiceData.taxRate) / 100;
      const total = afterDiscount + taxAmount;

      // Generate invoice number
      const result = await db
        .select({
          maxNumber: sql<string>`MAX(CAST(SUBSTR(invoiceNumber, 5) AS INTEGER))`,
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

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

      let discountAmount = 0;
      if (invoiceData.discountType === "percentage") {
        discountAmount = (subtotal * invoiceData.discountValue) / 100;
      } else if (invoiceData.discountType === "fixed") {
        discountAmount = invoiceData.discountValue;
      }

      const afterDiscount = subtotal - discountAmount;
      const taxAmount = (afterDiscount * invoiceData.taxRate) / 100;
      const total = afterDiscount + taxAmount;

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
