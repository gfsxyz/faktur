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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Users, MoreHorizontal, Handshake, Cog, Shredder } from "lucide-react";
import {
  DeleteConfirmationDialog,
  useDeleteConfirmation,
} from "@/components/ui/delete-confirmation-dialog";
import { toast } from "sonner";
import { ClientFilters } from "@/components/clients/client-filters";
import { ClientEmptyState } from "@/components/clients/client-empty-state";
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

export default function ClientsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const utils = trpc.useUtils();
  const deleteConfirmation = useDeleteConfirmation();

  // Get filter values from search params with defaults
  const limit = parseInt(searchParams.get("limit") || "10");
  const page = parseInt(searchParams.get("page") || "1");

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
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [debouncedSearch]);

  // Get search value from URL for the query
  const search = searchParams.get("search") || undefined;

  const { data, isLoading, isFetching } = trpc.clients.list.useQuery(
    {
      limit,
      page,
      search,
    },
    {
      placeholderData: (previousData) => previousData,
    }
  );

  const clients = data?.clients;
  const totalPages = data?.totalPages ?? 0;
  const total = data?.total ?? 0;

  const { data: hasAnyClients, isLoading: isLoadingHasAny } =
    trpc.clients.hasAny.useQuery(undefined, {
      staleTime: Infinity, // This rarely changes, keep it cached
    });

  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      utils.clients.hasAny.invalidate();
    },
  });

  const handleDelete = async (id: string) => {
    deleteConfirmation.confirm(async () => {
      try {
        await deleteMutation.mutateAsync({ id });

        // Clean up localStorage if the deleted client was the recent one
        const recentClientId = localStorage.getItem("recentClientId");
        if (recentClientId === id) {
          localStorage.removeItem("recentClientId");
        }

        toast.success("Client deleted successfully");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete client");
      }
    });
  };

  const handleLimitChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", value);
    params.set("page", "1"); // Reset to page 1 when changing limit
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
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
    router.replace(`?${params.toString()}`, { scroll: false });
  };

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

      if (page > 3) {
        pages.push("ellipsis");
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("ellipsis");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  // Only show full loading state on initial load
  if ((isLoading || isLoadingHasAny) && !clients) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingLogo />
      </div>
    );
  }

  // No clients exist at all - show create first client
  if (!hasAnyClients) {
    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-primary">
                Clients
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage your client
              </p>
            </div>
            <Button asChild variant={"outline"}>
              <Link href="/dashboard/clients/new">
                <Handshake />
                Add Client
              </Link>
            </Button>
          </div>
        </div>

        <ClientEmptyState type="no-clients" />
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
              Clients
            </h1>
            <p className="text-sm text-muted-foreground">Manage your client</p>
          </div>
          <Button asChild variant={"outline"}>
            <Link href="/dashboard/clients/new">
              <Handshake />
              Add Client
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile Filters - Show only on mobile */}
      <div className="lg:hidden">
        <ClientFilters
          limit={limit}
          search={searchInput}
          onLimitChange={handleLimitChange}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
        />
      </div>

      {/* Mobile Empty state - Show only on mobile */}
      {(!clients || clients.length === 0) && (
        <div className="lg:hidden">
          <ClientEmptyState type="no-results" />
        </div>
      )}

      {/* Desktop View - Table (always show card with filters) */}
      <Card className="hidden lg:block">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-medium">
                All Clients
              </CardTitle>
              <CardDescription className="text-xs">
                {total} client{total !== 1 ? "s" : ""} total
              </CardDescription>
            </div>
            <ClientFilters
              limit={limit}
              search={searchInput}
              onLimitChange={handleLimitChange}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
            />
          </div>
        </CardHeader>
        <CardContent className="relative">
          {isFetching && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
              <LoadingLogo className="scale-75 animate-pulse" />
            </div>
          )}
          {clients && clients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow
                    key={client.id}
                    className="cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/clients/${client.id}`)
                    }
                  >
                    <TableCell className="text-sm font-medium">
                      {client.name}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {client.email}
                    </TableCell>
                    <TableCell className="text-sm">
                      {client.company || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {client.phone || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {[client.city, client.country]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/clients/${client.id}/edit`}>
                              <Cog />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(client.id)}
                            className="text-destructive"
                          >
                            <Shredder className="text-destructive" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8">
              <ClientEmptyState type="no-results" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Desktop Pagination */}
      {clients && clients.length > 0 && totalPages > 1 && (
        <div className="mt-4 hidden lg:block">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) handlePageChange(page - 1);
                  }}
                  aria-disabled={page === 1}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {getPageNumbers().map((pageNum, index) =>
                pageNum === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pageNum);
                      }}
                      isActive={page === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) handlePageChange(page + 1);
                  }}
                  aria-disabled={page === totalPages}
                  className={
                    page === totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Mobile View - Cards */}
      {clients && clients.length > 0 && (
        <div className="lg:hidden space-y-4 relative">
          {isFetching && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-lg">
              <LoadingLogo className="scale-75 animate-pulse" />
            </div>
          )}
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-muted-foreground">
              {total} client{total !== 1 ? "s" : ""} total
            </p>
          </div>
          {clients.map((client) => (
            <Card
              key={client.id}
              className="overflow-hidden hover:shadow-md transition-shadow py-0"
            >
              <CardContent className="p-0">
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="block px-4 pb-3 pt-0 hover:bg-background/70"
                >
                  <div className="mb-4 pt-3.5">
                    <h3 className="text-base font-semibold text-primary">
                      {client.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {client.email}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {client.company && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground min-w-[70px]">
                          Company
                        </span>
                        <span className="text-sm font-medium flex-1">
                          {client.company}
                        </span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground min-w-[70px]">
                          Phone
                        </span>
                        <span className="text-sm font-medium flex-1">
                          {client.phone}
                        </span>
                      </div>
                    )}
                    {[client.city, client.country].filter(Boolean).length >
                      0 && (
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-muted-foreground min-w-[70px]">
                          Location
                        </span>
                        <span className="text-sm font-medium flex-1">
                          {[client.city, client.country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="bg-muted/50 px-4 py-2 flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    asChild
                  >
                    <Link href={`/dashboard/clients/${client.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-destructive hover:text-destructive"
                    onClick={() => handleDelete(client.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mobile Pagination */}
      {clients && clients.length > 0 && totalPages > 1 && (
        <div className="mt-4 lg:hidden">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page > 1) handlePageChange(page - 1);
                  }}
                  aria-disabled={page === 1}
                  className={page === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {getPageNumbers().map((pageNum, index) =>
                pageNum === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(pageNum);
                      }}
                      isActive={page === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (page < totalPages) handlePageChange(page + 1);
                  }}
                  aria-disabled={page === totalPages}
                  className={
                    page === totalPages ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <DeleteConfirmationDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.handleCancel}
        onConfirm={deleteConfirmation.handleConfirm}
        title="Delete Client"
        description="Are you sure you want to delete this client? This action cannot be undone."
      />
    </div>
  );
}
