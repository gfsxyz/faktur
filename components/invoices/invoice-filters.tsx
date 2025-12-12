"use client";

import { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants/status-colors";

interface InvoiceFiltersProps {
  limit: number;
  days: number | undefined;
  status: string | undefined;
  search: string | undefined;
  onLimitChange: (value: string) => void;
  onDaysChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

const STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"] as const;

function FilterContent({
  limit,
  days,
  status,
  onLimitChange,
  onDaysChange,
  onStatusChange,
}: Pick<
  InvoiceFiltersProps,
  | "limit"
  | "days"
  | "status"
  | "onLimitChange"
  | "onDaysChange"
  | "onStatusChange"
>) {
  const handleReset = () => {
    onLimitChange("10");
    onDaysChange("30");
    onStatusChange("all");
  };

  const hasNonDefaultValues =
    limit !== 10 || days !== 30 || (status && status !== "all");

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
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground/90">
            Items per page
          </label>
          <Select value={limit.toString()} onValueChange={onLimitChange}>
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 items</SelectItem>
              <SelectItem value="20">20 items</SelectItem>
              <SelectItem value="50">50 items</SelectItem>
              <SelectItem value="100">100 items</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date range */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground/90">
            Date range
          </label>
          <Select value={days?.toString() || "all"} onValueChange={onDaysChange}>
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="1">Today</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground/90">
            Status
          </label>
          <Select value={status || "all"} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
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
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Footer - Reset button */}
      {hasNonDefaultValues && (
        <div className="border-t pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
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
  search,
  onLimitChange,
  onDaysChange,
  onStatusChange,
  onSearchChange,
}: InvoiceFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleClearSearch = () => {
    onSearchChange("");
  };

  // Count active filters (excluding search)
  const activeFilterCount = [
    limit !== 10,
    days !== 30,
    status && status !== "all",
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-3 lg:justify-end">
      {/* Search Input - Always visible */}
      <InputGroup className="flex-1 lg:flex-initial lg:w-[280px]">
        <InputGroupInput
          placeholder="Search by client or company..."
          value={search || ""}
          onChange={(e) => onSearchChange(e.target.value)}
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

      {/* Desktop - Popover */}
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="hidden md:flex shrink-0 relative"
            aria-label="Open filters"
            title="Filter invoices"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {activeFilterCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-medium"
                aria-label={`${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}`}
              >
                {activeFilterCount}
              </span>
            )}
            <span className="sr-only">Open filters</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[320px] p-0">
          <div className="p-5">
            <FilterContent
              limit={limit}
              days={days}
              status={status}
              onLimitChange={onLimitChange}
              onDaysChange={onDaysChange}
              onStatusChange={onStatusChange}
            />
          </div>
        </PopoverContent>
      </Popover>

      {/* Mobile - Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden shrink-0 relative"
            aria-label="Open filters"
            title="Filter invoices"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {activeFilterCount > 0 && (
              <span
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-medium"
                aria-label={`${activeFilterCount} active filter${activeFilterCount > 1 ? 's' : ''}`}
              >
                {activeFilterCount}
              </span>
            )}
            <span className="sr-only">Open filters</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[340px] sm:w-[400px]">
          <SheetTitle className="sr-only">Filter Invoices</SheetTitle>
          <div className="h-full overflow-y-auto px-6 py-6">
            <FilterContent
              limit={limit}
              days={days}
              status={status}
              onLimitChange={onLimitChange}
              onDaysChange={onDaysChange}
              onStatusChange={onStatusChange}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
