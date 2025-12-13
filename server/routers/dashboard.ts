import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { invoices, clients } from "@/lib/db/schema";
import { eq, and, sql, desc, gte } from "drizzle-orm";
import { startOfMonth, subMonths, format } from "date-fns";
import { roundMoney, moneyAdd, moneySubtract } from "@/lib/utils/money";

export const dashboardRouter = createTRPCRouter({
  // Get overall statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Get all invoices for the user
    const userInvoices = await db
      .select({
        total: invoices.total,
        amountPaid: invoices.amountPaid,
        status: invoices.status,
      })
      .from(invoices)
      .where(eq(invoices.userId, ctx.userId));

    // Calculate statistics with proper rounding
    const totalRevenue = roundMoney(
      userInvoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + (inv.total || 0), 0)
    );

    const outstandingAmount = roundMoney(
      userInvoices
        .filter((inv) => inv.status !== "paid" && inv.status !== "cancelled")
        .reduce(
          (sum, inv) => sum + ((inv.total || 0) - (inv.amountPaid || 0)),
          0
        )
    );

    const paidInvoicesCount = userInvoices.filter(
      (inv) => inv.status === "paid"
    ).length;

    const unpaidInvoicesCount = userInvoices.filter(
      (inv) => inv.status !== "paid" && inv.status !== "cancelled"
    ).length;

    const overdueInvoicesCount = userInvoices.filter(
      (inv) => inv.status === "overdue"
    ).length;

    const draftInvoicesCount = userInvoices.filter(
      (inv) => inv.status === "draft"
    ).length;

    return {
      totalRevenue,
      outstandingAmount,
      totalInvoices: userInvoices.length,
      paidInvoicesCount,
      unpaidInvoicesCount,
      overdueInvoicesCount,
      draftInvoicesCount,
    };
  }),

  // Get revenue over time (monthly)
  getRevenueOverTime: protectedProcedure
    .input(
      z.object({
        months: z.number().min(1).max(24).default(6),
      })
    )
    .query(async ({ ctx, input }) => {
      const monthsAgo = subMonths(new Date(), input.months);
      const startDate = startOfMonth(monthsAgo);

      // Get all paid invoices from the start date
      const paidInvoices = await db
        .select({
          total: invoices.total,
          issueDate: invoices.issueDate,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.userId, ctx.userId),
            eq(invoices.status, "paid"),
            gte(invoices.issueDate, startDate)
          )
        )
        .orderBy(invoices.issueDate);

      // Group by month
      const revenueByMonth = new Map<string, number>();

      paidInvoices.forEach((invoice) => {
        if (invoice.issueDate) {
          const monthKey = format(invoice.issueDate, "MMM yyyy");
          const currentRevenue = revenueByMonth.get(monthKey) || 0;
          revenueByMonth.set(
            monthKey,
            moneyAdd(currentRevenue, invoice.total || 0)
          );
        }
      });

      // Create array for all months in range
      const result = [];
      for (let i = input.months - 1; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthKey = format(date, "MMM yyyy");
        result.push({
          month: monthKey,
          revenue: revenueByMonth.get(monthKey) || 0,
        });
      }

      return result;
    }),

  // Get invoice status distribution
  getStatusDistribution: protectedProcedure.query(async ({ ctx }) => {
    const statusCounts = await db
      .select({
        status: invoices.status,
        count: sql<number>`count(*)`,
        total: sql<number>`sum(${invoices.total})`,
      })
      .from(invoices)
      .where(eq(invoices.userId, ctx.userId))
      .groupBy(invoices.status);

    return statusCounts.map((item) => ({
      status: item.status,
      count: Number(item.count),
      total: roundMoney(Number(item.total || 0)),
    }));
  }),

  // Get recent activity (recent invoices)
  getRecentActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const recentInvoices = await db
        .select({
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          status: invoices.status,
          total: invoices.total,
          issueDate: invoices.issueDate,
          createdAt: invoices.createdAt,
          updatedAt: invoices.updatedAt,
          clientName: clients.name,
        })
        .from(invoices)
        .leftJoin(clients, eq(invoices.clientId, clients.id))
        .where(eq(invoices.userId, ctx.userId))
        .orderBy(desc(invoices.updatedAt))
        .limit(input.limit);

      return recentInvoices;
    }),
});
