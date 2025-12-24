"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DeleteConfirmationDialog,
  useDeleteConfirmation,
} from "@/components/ui/delete-confirmation-dialog";
import { toast } from "sonner";
import LoadingLogo from "@/components/loading-logo";
import { InvoiceFilters } from "@/components/invoices/invoice-filters";
import {
  InvoiceTable,
  InvoiceTablePagination,
} from "@/components/invoices/invoice-table";
import {
  InvoiceCards,
  InvoiceCardsPagination,
} from "@/components/invoices/invoice-cards";
import { InvoiceEmptyState } from "@/components/invoices/invoice-empty-state";
import { FilePlusCorner, FileText, Shredder } from "lucide-react";
import EmptyState from "@/components/ui/empty-state";

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();
  const deleteConfirmation = useDeleteConfirmation();

  // Get filter values from search params with defaults
  const limit = parseInt(searchParams.get("limit") || "10");
  const page = parseInt(searchParams.get("page") || "1");
  const daysParam = searchParams.get("days");
  const days =
    daysParam === "all" ? undefined : daysParam ? parseInt(daysParam) : 90;
  const statusParam = searchParams.get("status");
  const status =
    statusParam === "all"
      ? undefined
      : (statusParam as "draft" | "sent" | "paid" | "overdue" | "cancelled") ||
        undefined;
  const amountRangeParam = searchParams.get("amountRange");
  const amountRange =
    amountRangeParam === "all"
      ? undefined
      : (amountRangeParam as
          | "under100"
          | "100to1k"
          | "1kto5k"
          | "5kto10k"
          | "10kto100k"
          | "100kto1m"
          | "over1m") || undefined;
  const sortByParam = searchParams.get("sortBy");
  const sortBy =
    (sortByParam as "createdAt" | "issueDate" | "dueDate" | "total") ||
    undefined;
  const sortOrderParam = searchParams.get("sortOrder");
  const sortOrder = (sortOrderParam as "asc" | "desc") || undefined;

  // Search state with debouncing
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update URL when debounced search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
      params.set("page", "1"); // Reset to page 1 when searching
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  }, [debouncedSearch]);

  // Get search value from URL for the query
  const search = searchParams.get("search") || undefined;

  const { data, isLoading, isFetching } = trpc.invoices.list.useQuery(
    {
      limit,
      page,
      days,
      status,
      search,
      amountRange,
      sortBy,
      sortOrder,
    },
    {
      placeholderData: (previousData) => previousData,
    }
  );

  const invoices = data?.invoices;
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;

  const { data: hasAnyInvoices, isLoading: isLoadingHasAny } =
    trpc.invoices.hasAny.useQuery(undefined, {
      staleTime: Infinity, // This rarely changes, keep it cached
    });

  const deleteMutation = trpc.invoices.delete.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      utils.invoices.hasAny.invalidate();
    },
  });

  const handleDelete = async (id: string) => {
    deleteConfirmation.confirm(async () => {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Invoice deleted successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete invoice");
      }
    });
  };

  // Update search params
  const updateSearchParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`);
  };

  const handleLimitChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", value);
    params.set("page", "1"); // Reset to page 1 when changing limit
    router.push(`?${params.toString()}`);
  };

  const handleDaysChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", value);
    params.set("page", "1"); // Reset to page 1 when changing period
    router.push(`?${params.toString()}`);
  };

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", value);
    params.set("page", "1"); // Reset to page 1 when changing status
    router.push(`?${params.toString()}`);
  };

  const handleAmountRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("amountRange", value);
    params.set("page", "1"); // Reset to page 1 when changing amount range
    router.push(`?${params.toString()}`);
  };

  const handleSortByChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", value);
    params.set("page", "1"); // Reset to page 1 when changing sort
    router.push(`?${params.toString()}`);
  };

  const handleSortOrderChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortOrder", value);
    params.set("page", "1"); // Reset to page 1 when changing sort order
    router.push(`?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleSearchSubmit = () => {
    // Immediately update the URL with current search value
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) {
      params.set("search", searchInput);
      params.set("page", "1");
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  const handleFilterReset = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", "10");
    params.set("days", "90");
    params.set("status", "all");
    params.set("amountRange", "all");
    params.set("sortBy", "createdAt");
    params.set("sortOrder", "desc");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParams("page", newPage.toString());
  };

  // Only show full loading state on initial load
  if ((isLoading || isLoadingHasAny) && !invoices) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingLogo />
      </div>
    );
  }

  // No invoices exist at all - show create first invoice
  if (!hasAnyInvoices) {
    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-primary">
                Invoices
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage and track all your invoices
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 min-h-[70dvh]">
            <EmptyState
              icon={<Shredder size={44} />}
              cta={
                <Button asChild variant={"outline"}>
                  <Link href="/dashboard/invoices/new">
                    <FilePlusCorner />
                    Add Invoice
                  </Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-primary">
              Invoices
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and track all your invoices
            </p>
          </div>
          <Button asChild variant={"outline"}>
            <Link href="/dashboard/invoices/new">
              <FilePlusCorner />
              Add Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile Filters - Show only on mobile */}
      <div className="lg:hidden">
        <InvoiceFilters
          limit={limit}
          days={days}
          status={status}
          amountRange={amountRange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          search={searchInput}
          onLimitChange={handleLimitChange}
          onDaysChange={handleDaysChange}
          onStatusChange={handleStatusChange}
          onAmountRangeChange={handleAmountRangeChange}
          onSortByChange={handleSortByChange}
          onSortOrderChange={handleSortOrderChange}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          onReset={handleFilterReset}
        />
      </div>

      {/* Mobile Empty state - Show only on mobile */}
      {(!invoices || invoices.length === 0) && (
        <div className="lg:hidden">
          <InvoiceEmptyState type="no-results" />
        </div>
      )}

      {/* Desktop View - Table (always show) */}
      <InvoiceTable
        invoices={invoices || []}
        total={total}
        isFetching={isFetching}
        onDelete={handleDelete}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        filters={
          <InvoiceFilters
            limit={limit}
            days={days}
            status={status}
            amountRange={amountRange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            search={searchInput}
            onLimitChange={handleLimitChange}
            onDaysChange={handleDaysChange}
            onStatusChange={handleStatusChange}
            onAmountRangeChange={handleAmountRangeChange}
            onSortByChange={handleSortByChange}
            onSortOrderChange={handleSortOrderChange}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            onReset={handleFilterReset}
          />
        }
      />

      {/* Desktop Pagination */}
      {invoices && invoices.length > 0 && (
        <>
          <InvoiceTablePagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Mobile View - Cards */}
      {invoices && invoices.length > 0 && (
        <>
          <InvoiceCards
            invoices={invoices}
            total={total}
            isFetching={isFetching}
            onDelete={handleDelete}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          <InvoiceCardsPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <DeleteConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.handleCancel}
        onConfirm={deleteConfirmation.handleConfirm}
        title="Delete Invoice"
        description="Are you sure you want to delete this invoice? This action cannot be undone."
      />
    </div>
  );
}
