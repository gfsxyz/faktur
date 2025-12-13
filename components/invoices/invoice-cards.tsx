"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants/status-colors";
import LoadingLogo from "@/components/loading-logo";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Cog, Shredder } from "lucide-react";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  issueDate: Date;
  dueDate: Date;
  total: number;
  clientName: string | null;
  clientCompany: string | null;
}

interface InvoiceCardsProps {
  invoices: Invoice[];
  total: number;
  isFetching: boolean;
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function InvoiceCards({
  invoices,
  total,
  isFetching,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: InvoiceCardsProps) {
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsisThreshold = 7;

    if (totalPages <= showEllipsisThreshold) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="lg:hidden space-y-4 relative">
      {isFetching && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-lg">
          <LoadingLogo className="scale-75 animate-pulse" />
        </div>
      )}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          {total} invoice{total !== 1 ? "s" : ""} found
        </p>
      </div>
      {invoices.map((invoice) => (
        <Card
          key={invoice.id}
          className="overflow-hidden hover:shadow-md transition-shadow py-0"
        >
          <CardContent className="p-0 pt-4">
            <Link
              href={`/dashboard/invoices/${invoice.id}`}
              className="block px-4 pb-3 pt-0"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-semibold text-primary mb-1">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {invoice.clientName}
                  </p>
                  {invoice.clientCompany && (
                    <p className="text-xs text-muted-foreground truncate">
                      {invoice.clientCompany}
                    </p>
                  )}
                </div>
                <Badge
                  className="text-xs font-medium shrink-0"
                  style={{
                    backgroundColor: STATUS_COLORS[invoice.status],
                    color: "white",
                    border: "none",
                  }}
                >
                  {STATUS_LABELS[invoice.status]}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Issue Date
                  </p>
                  <p className="text-sm font-medium">
                    {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">
                    Due Date
                  </p>
                  <p className="text-sm font-medium">
                    {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-0.5">Amount</p>
                <p className="font-mono text-lg font-semibold">
                  ${" "}
                  {invoice.total.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </Link>

            <div className="bg-muted/50 px-4 py-2 flex items-center justify-end">
              <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                  <Cog />
                  Edit
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-destructive hover:text-destructive"
                onClick={() => onDelete(invoice.id)}
              >
                <Shredder />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function InvoiceCardsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsisThreshold = 7;

    if (totalPages <= showEllipsisThreshold) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 lg:hidden">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              aria-disabled={currentPage === 1}
              className={
                currentPage === 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>

          {getPageNumbers().map((page, index) =>
            page === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              aria-disabled={currentPage === totalPages}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
