"use client";

import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

interface ClientFiltersProps {
  limit: number;
  search: string | undefined;
  onLimitChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export function ClientFilters({
  limit,
  search,
  onLimitChange,
  onSearchChange,
}: ClientFiltersProps) {
  const handleClearSearch = () => {
    onSearchChange("");
  };

  return (
    <div className="flex items-center gap-3">
      {/* Search Input */}
      <InputGroup className="flex-1 lg:flex-initial lg:w-[280px]">
        <InputGroupInput
          placeholder="Search clients..."
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

      {/* Items per page */}
      <div className="shrink-0">
        <Select value={limit.toString()} onValueChange={onLimitChange}>
          <SelectTrigger className="w-[80px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Items per page</SelectLabel>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
