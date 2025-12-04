"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
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
import { Users, MoreHorizontal, Eye, Pencil, Trash } from "lucide-react";

export default function ClientsPage() {
  const { data: clients, isLoading } = trpc.clients.list.useQuery();
  const utils = trpc.useUtils();

  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      await deleteMutation.mutateAsync({ id });

      // Clean up localStorage if the deleted client was the recent one
      const recentClientId = localStorage.getItem("recentClientId");
      if (recentClientId === id) {
        localStorage.removeItem("recentClientId");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading clients...</p>
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div>
                <h1 className="text-lg font-bold tracking-tight">Clients</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your client relationships
                </p>
              </div>
            </div>
            <Button asChild className="h-10">
              <Link href="/dashboard/clients/new">Add Client</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-medium">
              No clients yet
            </CardTitle>
            <CardDescription className="text-xs">
              Add your first client to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50">
              <Users className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground mb-4">
              Clients you add will appear here
            </p>
            <Button asChild className="h-10">
              <Link href="/dashboard/clients/new">Add Your First Client</Link>
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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
              <p className="text-sm text-muted-foreground">
                Manage your client relationships
              </p>
            </div>
          </div>
          <Button asChild className="h-10">
            <Link href="/dashboard/clients/new">Add Client</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-base font-medium">All Clients</CardTitle>
          <CardDescription className="text-xs">
            {clients.length} client{clients.length !== 1 ? "s" : ""} total
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                <TableRow key={client.id}>
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
                    {[client.city, client.country].filter(Boolean).join(", ") ||
                      "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/clients/${client.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/clients/${client.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(client.id)}
                          className="text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
