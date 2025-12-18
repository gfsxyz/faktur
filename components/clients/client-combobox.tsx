"use client";

import * as React from "react";
import { ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { trpc } from "@/lib/trpc/client";

interface ClientComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ClientCombobox({
  value,
  onValueChange,
  onBlur,
  disabled,
  className,
}: ClientComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Debounce search query
  const [debouncedQuery, setDebouncedQuery] = React.useState("");

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch default recent clients (shown when combobox is opened)
  const { data: recentClients } = trpc.clients.list.useQuery(
    { limit: 10, page: 1 },
    {
      enabled: !debouncedQuery,
      staleTime: 30000, // Cache for 30 seconds
    }
  );

  // Fetch search results
  const { data: searchResults = [], isLoading } = trpc.clients.search.useQuery(
    { query: debouncedQuery },
    {
      enabled: debouncedQuery.length > 0,
      staleTime: 30000, // Cache for 30 seconds
    }
  );

  // Use search results if searching, otherwise show recent clients
  const displayClients = debouncedQuery
    ? searchResults
    : recentClients?.clients || [];

  // Get selected client info for display
  const { data: selectedClient } = trpc.clients.getById.useQuery(
    { id: value! },
    { enabled: !!value }
  );

  const handleSelect = (clientId: string) => {
    onValueChange(clientId === value ? "" : clientId);
    setOpen(false);
  };

  const displayValue = selectedClient
    ? `${selectedClient.name}${
        selectedClient.company ? ` (${selectedClient.company})` : ""
      }`
    : "Select a client...";

  return (
    <Popover
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen && onBlur) {
          onBlur();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between font-normal min-w-0",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate text-left">{displayValue}</span>
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search clients..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Searching..." : "No clients found."}
            </CommandEmpty>
            {displayClients.length > 0 && (
              <CommandGroup>
                {displayClients.map(
                  (client: {
                    id: string;
                    name: string;
                    company: string | null;
                  }) => (
                    <CommandItem
                      key={client.id}
                      value={client.id}
                      onSelect={() => handleSelect(client.id)}
                      className={cn(value === client.id && "bg-accent")}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="truncate">{client.name}</span>
                        {client.company && (
                          <span className="truncate text-xs text-muted-foreground">
                            {client.company}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  )
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
