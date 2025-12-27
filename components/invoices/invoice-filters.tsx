"use client";

import { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants/status-colors";

interface InvoiceFiltersProps {
  limit: number;
  days: number | undefined;
  status: string | undefined;
  amountRange: string | undefined;
  sortBy: string | undefined;
  sortOrder: string | undefined;
  search: string | undefined;
  onLimitChange: (value: string) => void;
  onDaysChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAmountRangeChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: () => void;
  onReset?: () => void;
}

const AMOUNT_RANGES = [
  { value: "under100", label: "Under $100" },
  { value: "100to1k", label: "$100 - $1K" },
  { value: "1kto5k", label: "$1K - $5K" },
  { value: "5kto10k", label: "$5K - $10K" },
  { value: "10kto100k", label: "$10K - $100K" },
  { value: "100kto1m", label: "$100K - $1M" },
  { value: "over1m", label: "Over $1M" },
] as const;

const STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"] as const;

const SORT_BY_OPTIONS = [
  { value: "createdAt", label: "Date created" },
  { value: "issueDate", label: "Issue date" },
  { value: "dueDate", label: "Due date" },
  { value: "total", label: "Amount" },
] as const;

const SORT_ORDER_OPTIONS = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
] as const;

function FilterContent({
  limit,
  days,
  status,
  amountRange,
  sortBy,
  sortOrder,
  onLimitChange,
  onDaysChange,
  onStatusChange,
  onAmountRangeChange,
  onSortByChange,
  onSortOrderChange,
  onReset,
}: Pick<
  InvoiceFiltersProps,
  | "limit"
  | "days"
  | "status"
  | "amountRange"
  | "sortBy"
  | "sortOrder"
  | "onLimitChange"
  | "onDaysChange"
  | "onStatusChange"
  | "onAmountRangeChange"
  | "onSortByChange"
  | "onSortOrderChange"
  | "onReset"
>) {
  const hasNonDefaultValues =
    limit !== 10 ||
    days !== 90 ||
    (status && status !== "all") ||
    (amountRange && amountRange !== "all") ||
    (sortBy && sortBy !== "createdAt") ||
    (sortOrder && sortOrder !== "desc");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold">Filter Invoices</h3>
        <p className="text-xs text-muted-foreground">
          Customize how you view your invoices
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Items per page */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Items per page
          </label>
          <Select value={limit.toString()} onValueChange={onLimitChange}>
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="10">10 items</SelectItem>
                <SelectItem value="20">20 items</SelectItem>
                <SelectItem value="50">50 items</SelectItem>
                <SelectItem value="100">100 items</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Date range */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Date range
          </label>
          <Select
            value={days?.toString() || "all"}
            onValueChange={onDaysChange}
          >
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="1">Today</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <Select value={status || "all"} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All</SelectItem>
                {STATUSES.map((statusValue) => (
                  <SelectItem key={statusValue} value={statusValue}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: STATUS_COLORS[statusValue],
                        }}
                      />
                      <span>{STATUS_LABELS[statusValue]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Amount Range */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Amount range
          </label>
          <Select
            value={amountRange || "all"}
            onValueChange={onAmountRangeChange}
          >
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All amounts</SelectItem>
                {AMOUNT_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Sort by
          </label>
          <Select value={sortBy || "createdAt"} onValueChange={onSortByChange}>
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {SORT_BY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Order
          </label>
          <Select value={sortOrder || "desc"} onValueChange={onSortOrderChange}>
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {SORT_ORDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Footer - Reset button */}
      {hasNonDefaultValues && onReset && (
        <div className="">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="w-full h-8 text-xs"
          >
            Reset to defaults
          </Button>
        </div>
      )}
    </div>
  );
}

export function InvoiceFilters({
  limit,
  days,
  status,
  amountRange,
  sortBy,
  sortOrder,
  search,
  onLimitChange,
  onDaysChange,
  onStatusChange,
  onAmountRangeChange,
  onSortByChange,
  onSortOrderChange,
  onSearchChange,
  onSearchSubmit,
  onReset,
}: InvoiceFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleClearSearch = () => {
    onSearchChange("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearchSubmit?.();
    }
  };

  // Count active filters (excluding search and default sort)
  const activeFilterCount = [
    limit !== 10,
    days !== 90,
    status && status !== "all",
    amountRange && amountRange !== "all",
    sortBy && sortBy !== "createdAt",
    sortOrder && sortOrder !== "desc",
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-3">
      {/* Search Input - Always visible */}
      <InputGroup className="flex-1 lg:flex-initial lg:w-[280px]">
        <InputGroupInput
          placeholder="Search by client or company..."
          value={search || ""}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <InputGroupAddon>
          <Search className="h-4 w-4" />
        </InputGroupAddon>
        {search && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              onClick={handleClearSearch}
              className="rounded-full"
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">Clear search</span>
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>

      {/* Filter Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 relative"
            aria-label="Open filters"
            title="Filter invoices"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {activeFilterCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-medium"
                aria-label={`${activeFilterCount} active filter${
                  activeFilterCount > 1 ? "s" : ""
                }`}
              >
                {activeFilterCount}
              </span>
            )}
            <span className="sr-only">Open filters</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[340px] sm:w-[400px]">
          <SheetTitle className="sr-only">Filter Invoices</SheetTitle>
          <SheetDescription className="sr-only">
            Filter and sort invoice list
          </SheetDescription>
          <div className="h-full overflow-y-auto px-6 py-6">
            <FilterContent
              limit={limit}
              days={days}
              status={status}
              amountRange={amountRange}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onLimitChange={onLimitChange}
              onDaysChange={onDaysChange}
              onStatusChange={onStatusChange}
              onAmountRangeChange={onAmountRangeChange}
              onSortByChange={onSortByChange}
              onSortOrderChange={onSortOrderChange}
              onReset={onReset}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
