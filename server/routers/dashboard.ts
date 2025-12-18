import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/lib/db";
import { invoices, clients } from "@/lib/db/schema";
import { eq, and, sql, desc, gte, lt } from "drizzle-orm";
import { startOfMonth, subMonths, format, subDays, startOfDay, endOfDay } from "date-fns";
import { roundMoney, moneyAdd, moneySubtract } from "@/lib/utils/money";

export const dashboardRouter = createTRPCRouter({
  // Get overall statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentPeriodEnd = endOfDay(now);

    // Previous month, same day range (e.g., if today is Dec 17, compare Dec 1-17 vs Nov 1-17)
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousPeriodEnd = endOfDay(subMonths(now, 1));

    // Get all invoices for the user
    const userInvoices = await db
      .select({
        total: invoices.total,
        amountPaid: invoices.amountPaid,
        status: invoices.status,
        issueDate: invoices.issueDate,
      })
      .from(invoices)
      .where(eq(invoices.userId, ctx.userId));

    // Helper to calculate stats for a period
    const calculatePeriodStats = (
      invoicesList: typeof userInvoices,
      startDate?: Date,
      endDate?: Date
    ) => {
      const filteredInvoices = startDate
        ? invoicesList.filter((inv) => {
            if (!inv.issueDate) return false;
            const issueDate = new Date(inv.issueDate);
            return issueDate >= startDate && issueDate < (endDate || now);
          })
        : invoicesList;

      const totalRevenue = roundMoney(
        filteredInvoices
          .filter((inv) => inv.status === "paid")
          .reduce((sum, inv) => sum + (inv.total || 0), 0)
      );

      const outstandingAmount = roundMoney(
        filteredInvoices
          .filter((inv) => inv.status !== "paid" && inv.status !== "cancelled")
          .reduce(
            (sum, inv) => sum + ((inv.total || 0) - (inv.amountPaid || 0)),
            0
          )
      );

      const paidInvoicesCount = filteredInvoices.filter(
        (inv) => inv.status === "paid"
      ).length;

      const overdueInvoicesCount = filteredInvoices.filter(
        (inv) => inv.status === "overdue"
      ).length;

      const overdueAmount = roundMoney(
        filteredInvoices
          .filter((inv) => inv.status === "overdue")
          .reduce(
            (sum, inv) => sum + ((inv.total || 0) - (inv.amountPaid || 0)),
            0
          )
      );

      const totalInvoicesInPeriod = filteredInvoices.filter(
        (inv) => inv.status !== "cancelled"
      ).length;

      const paymentRate =
        totalInvoicesInPeriod > 0
          ? Math.round((paidInvoicesCount / totalInvoicesInPeriod) * 100)
          : 0;

      return {
        totalRevenue,
        outstandingAmount,
        paidInvoicesCount,
        overdueInvoicesCount,
        overdueAmount,
        paymentRate,
      };
    };

    // Calculate period stats for current month-to-date and previous month-to-same-date
    const currentPeriodStats = calculatePeriodStats(
      userInvoices,
      currentMonthStart,
      currentPeriodEnd
    );
    const previousPeriodStats = calculatePeriodStats(
      userInvoices,
      previousMonthStart,
      previousPeriodEnd
    );

    // Calculate percentage change helper
    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Calculate trends
    const revenueTrend = calculateTrend(
      currentPeriodStats.totalRevenue,
      previousPeriodStats.totalRevenue
    );
    const outstandingTrend = calculateTrend(
      currentPeriodStats.outstandingAmount,
      previousPeriodStats.outstandingAmount
    );
    const paymentRateTrend = calculateTrend(
      currentPeriodStats.paymentRate,
      previousPeriodStats.paymentRate
    );
    const overdueTrend = calculateTrend(
      currentPeriodStats.overdueInvoicesCount,
      previousPeriodStats.overdueInvoicesCount
    );

    // Count unpaid and draft from current month-to-date only
    const currentPeriodInvoices = userInvoices.filter((inv) => {
      if (!inv.issueDate) return false;
      const issueDate = new Date(inv.issueDate);
      return issueDate >= currentMonthStart && issueDate <= currentPeriodEnd;
    });

    const unpaidInvoicesCount = currentPeriodInvoices.filter(
      (inv) => inv.status !== "paid" && inv.status !== "cancelled"
    ).length;

    const draftInvoicesCount = currentPeriodInvoices.filter(
      (inv) => inv.status === "draft"
    ).length;

    // Calculate overdue percentage of outstanding
    const overduePercentage =
      currentPeriodStats.outstandingAmount > 0
        ? Math.round(
            (currentPeriodStats.overdueAmount /
              currentPeriodStats.outstandingAmount) *
              100
          )
        : 0;

    return {
      totalRevenue: currentPeriodStats.totalRevenue,
      outstandingAmount: currentPeriodStats.outstandingAmount,
      overdueAmount: currentPeriodStats.overdueAmount,
      overduePercentage,
      totalInvoices: currentPeriodInvoices.length,
      paidInvoicesCount: currentPeriodStats.paidInvoicesCount,
      paymentRate: currentPeriodStats.paymentRate,
      unpaidInvoicesCount,
      overdueInvoicesCount: currentPeriodStats.overdueInvoicesCount,
      draftInvoicesCount,
      trends: {
        revenue: revenueTrend,
        outstanding: outstandingTrend,
        paymentRate: paymentRateTrend,
        overdue: overdueTrend,
      },
      absoluteDeltas: {
        revenue: roundMoney(
          currentPeriodStats.totalRevenue - previousPeriodStats.totalRevenue
        ),
        outstanding: roundMoney(
          currentPeriodStats.outstandingAmount -
            previousPeriodStats.outstandingAmount
        ),
        paymentRate:
          currentPeriodStats.paymentRate - previousPeriodStats.paymentRate,
        overdue:
          currentPeriodStats.overdueInvoicesCount -
          previousPeriodStats.overdueInvoicesCount,
      },
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

      // Get all paid and sent invoices from the start date
      const allInvoices = await db
        .select({
          total: invoices.total,
          issueDate: invoices.issueDate,
          status: invoices.status,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.userId, ctx.userId),
            gte(invoices.issueDate, startDate)
          )
        )
        .orderBy(invoices.issueDate);

      if (!allInvoices.length) return null;

      // Group by month
      const paidByMonth = new Map<string, number>();
      const sentByMonth = new Map<string, number>();

      allInvoices.forEach((invoice) => {
        if (invoice.issueDate) {
          const monthKey = format(invoice.issueDate, "MMM yyyy");

          if (invoice.status === "paid") {
            const currentPaid = paidByMonth.get(monthKey) || 0;
            paidByMonth.set(
              monthKey,
              moneyAdd(currentPaid, invoice.total || 0)
            );
          } else if (invoice.status === "sent") {
            const currentSent = sentByMonth.get(monthKey) || 0;
            sentByMonth.set(
              monthKey,
              moneyAdd(currentSent, invoice.total || 0)
            );
          }
        }
      });

      // Create array for all months in range
      const result = [];
      for (let i = input.months - 1; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthKey = format(date, "MMM yyyy");
        result.push({
          month: monthKey,
          paid: paidByMonth.get(monthKey) || 0,
          sent: sentByMonth.get(monthKey) || 0,
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

  // Get invoice status over time (monthly)
  getStatusOverTime: protectedProcedure
    .input(
      z.object({
        months: z.number().min(1).max(24).default(6),
        metric: z.enum(["count", "amount"]).default("count"),
      })
    )
    .query(async ({ ctx, input }) => {
      const monthsAgo = subMonths(new Date(), input.months);
      const startDate = startOfMonth(monthsAgo);

      // Get all invoices from the start date
      const userInvoices = await db
        .select({
          status: invoices.status,
          total: invoices.total,
          issueDate: invoices.issueDate,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.userId, ctx.userId),
            gte(invoices.issueDate, startDate)
          )
        )
        .orderBy(invoices.issueDate);

      if (!userInvoices.length) return null;

      // Group by month and status
      const dataByMonth = new Map<
        string,
        {
          paid: number;
          sent: number;
          overdue: number;
          draft: number;
          cancelled: number;
        }
      >();

      userInvoices.forEach((invoice) => {
        if (invoice.issueDate) {
          const monthKey = format(invoice.issueDate, "MMM yyyy");
          if (!dataByMonth.has(monthKey)) {
            dataByMonth.set(monthKey, {
              paid: 0,
              sent: 0,
              overdue: 0,
              draft: 0,
              cancelled: 0,
            });
          }

          const monthData = dataByMonth.get(monthKey)!;
          const value = input.metric === "amount" ? invoice.total || 0 : 1;

          if (invoice.status === "paid") {
            monthData.paid =
              input.metric === "amount"
                ? moneyAdd(monthData.paid, value)
                : monthData.paid + value;
          } else if (invoice.status === "sent") {
            monthData.sent =
              input.metric === "amount"
                ? moneyAdd(monthData.sent, value)
                : monthData.sent + value;
          } else if (invoice.status === "overdue") {
            monthData.overdue =
              input.metric === "amount"
                ? moneyAdd(monthData.overdue, value)
                : monthData.overdue + value;
          } else if (invoice.status === "draft") {
            monthData.draft =
              input.metric === "amount"
                ? moneyAdd(monthData.draft, value)
                : monthData.draft + value;
          } else if (invoice.status === "cancelled") {
            monthData.cancelled =
              input.metric === "amount"
                ? moneyAdd(monthData.cancelled, value)
                : monthData.cancelled + value;
          }
        }
      });

      // Create array for all months in range
      const result = [];
      for (let i = input.months - 1; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthKey = format(date, "MMM yyyy");
        const monthData = dataByMonth.get(monthKey) || {
          paid: 0,
          sent: 0,
          overdue: 0,
          draft: 0,
          cancelled: 0,
        };

        result.push({
          month: monthKey,
          paid:
            input.metric === "amount"
              ? roundMoney(monthData.paid)
              : monthData.paid,
          sent:
            input.metric === "amount"
              ? roundMoney(monthData.sent)
              : monthData.sent,
          overdue:
            input.metric === "amount"
              ? roundMoney(monthData.overdue)
              : monthData.overdue,
          draft:
            input.metric === "amount"
              ? roundMoney(monthData.draft)
              : monthData.draft,
          cancelled:
            input.metric === "amount"
              ? roundMoney(monthData.cancelled)
              : monthData.cancelled,
        });
      }

      return result;
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
          clientCompany: clients.company,
        })
        .from(invoices)
        .leftJoin(clients, eq(invoices.clientId, clients.id))
        .where(eq(invoices.userId, ctx.userId))
        .orderBy(desc(invoices.updatedAt))
        .limit(input.limit);

      return recentInvoices;
    }),
});
