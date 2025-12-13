"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useDebounce } from "@/lib/hooks/use-debounce";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { FilePlusCorner, FileText } from "lucide-react";

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
            <Button asChild variant={"outline"}>
              <Link href="/dashboard/invoices/new">
                <FilePlusCorner />
                Add Invoice
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-medium">
              No invoices yet
            </CardTitle>
            <CardDescription className="text-xs">
              Get started by creating your first invoice
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
              <FileText className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground mb-4">
              Invoices you create will appear here
            </p>
            <Button asChild className="h-10">
              <Link href="/dashboard/invoices/new">
                <FilePlusCorner />
                Create First Invoice
              </Link>
            </Button>
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
          search={searchInput}
          onLimitChange={handleLimitChange}
          onDaysChange={handleDaysChange}
          onStatusChange={handleStatusChange}
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
            search={searchInput}
            onLimitChange={handleLimitChange}
            onDaysChange={handleDaysChange}
            onStatusChange={handleStatusChange}
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

// TODO: Future improvements
// - Add sorting by date/amount
// - Add bulk operations
// - Fix invoice payment records iteration decimal errors
