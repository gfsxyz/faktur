import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { payments, invoices } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

const createPaymentSchema = z.object({
  invoiceId: z.string().min(1, "Invoice ID is required"),
  amount: z.number().min(0.01, "Amount must be positive"),
  paymentDate: z.date(),
  paymentMethod: z.enum([
    "cash",
    "check",
    "bank_transfer",
    "credit_card",
    "paypal",
    "stripe",
    "other",
  ]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const paymentsRouter = createTRPCRouter({
  // Get all payments for an invoice
  getByInvoiceId: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ ctx, input }) => {
      // First verify the invoice belongs to the user
      const [invoice] = await db
        .select()
        .from(invoices)
        .where(and(eq(invoices.id, input.invoiceId), eq(invoices.userId, ctx.userId)))
        .limit(1);

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // Get payments for the invoice
      return await db
        .select()
        .from(payments)
        .where(eq(payments.invoiceId, input.invoiceId))
        .orderBy(desc(payments.paymentDate));
    }),

  // Record a new payment
  create: protectedProcedure
    .input(createPaymentSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify invoice belongs to user
      const [invoice] = await db
        .select()
        .from(invoices)
        .where(and(eq(invoices.id, input.invoiceId), eq(invoices.userId, ctx.userId)))
        .limit(1);

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // Create payment
      const [payment] = await db
        .insert(payments)
        .values({
          invoiceId: input.invoiceId,
          amount: input.amount,
          paymentDate: input.paymentDate,
          paymentMethod: input.paymentMethod,
          reference: input.reference,
          notes: input.notes,
        })
        .returning();

      // Update invoice amountPaid
      const newAmountPaid = invoice.amountPaid + input.amount;
      const isPaid = newAmountPaid >= invoice.total;

      await db
        .update(invoices)
        .set({
          amountPaid: newAmountPaid,
          status: isPaid ? "paid" : invoice.status,
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.invoiceId));

      return payment;
    }),

  // Delete a payment
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get payment with invoice info
      const [payment] = await db
        .select({
          payment: payments,
          invoice: invoices,
        })
        .from(payments)
        .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
        .where(eq(payments.id, input.id))
        .limit(1);

      if (!payment || !payment.invoice) {
        throw new Error("Payment not found");
      }

      // Verify invoice belongs to user
      if (payment.invoice.userId !== ctx.userId) {
        throw new Error("Unauthorized");
      }

      // Delete payment
      await db.delete(payments).where(eq(payments.id, input.id));

      // Update invoice amountPaid
      const newAmountPaid = payment.invoice.amountPaid - payment.payment.amount;

      await db
        .update(invoices)
        .set({
          amountPaid: Math.max(0, newAmountPaid),
          status: newAmountPaid < payment.invoice.total ? "sent" : "paid",
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, payment.invoice.id));

      return { success: true };
    }),
});
