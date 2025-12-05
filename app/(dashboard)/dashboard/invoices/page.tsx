"use client";

import Link from "next/link";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { FileText, MoreHorizontal, Eye, Pencil, Trash } from "lucide-react";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants/status-colors";

export default function InvoicesPage() {
  const { data: invoices, isLoading } = trpc.invoices.list.useQuery();
  const utils = trpc.useUtils();

  const deleteMutation = trpc.invoices.delete.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Loading invoices...</p>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="space-y-8">
        {/* Header Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold tracking-tight">Invoices</h1>
              <p className="text-sm text-muted-foreground">
                Manage and track all your invoices
              </p>
            </div>
            <Button asChild className="h-10">
              <Link href="/dashboard/invoices/new">New Invoice</Link>
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
                Create Your First Invoice
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
            <h1 className="text-lg font-bold tracking-tight">Invoices</h1>
            <p className="text-sm text-muted-foreground">
              Manage and track all your invoices
            </p>
          </div>
          <Button asChild className="h-10">
            <Link href="/dashboard/invoices/new">New Invoice</Link>
          </Button>
        </div>
      </div>

      {/* Desktop View - Table */}
      <Card className="hidden lg:block">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-base font-medium">All Invoices</CardTitle>
          <CardDescription className="text-xs">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id} className="group">
                  <TableCell className="font-mono text-sm font-semibold">
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="cursor-pointer hover:text-primary transition-colors"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">
                        {invoice.clientName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.clientEmail}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="font-mono text-sm font-medium">
                    ${" "}
                    {invoice.total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className="text-xs font-medium"
                      style={{
                        backgroundColor: STATUS_COLORS[invoice.status],
                        color: "white",
                        border: "none",
                      }}
                    >
                      {STATUS_LABELS[invoice.status]}
                    </Badge>
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
                          <Link href={`/dashboard/invoices/${invoice.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(invoice.id)}
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

      {/* Mobile View - Cards */}
      <div className="lg:hidden space-y-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-muted-foreground">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total
          </p>
        </div>
        {invoices.map((invoice) => (
          <Card
            key={invoice.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardContent className="p-0">
              <Link
                href={`/dashboard/invoices/${invoice.id}`}
                className="block px-4 pb-3 pt-0"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-semibold text-foreground mb-1">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {invoice.clientName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {invoice.clientEmail}
                    </p>
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

              <div className="bg-muted/50 px-4 py-2 flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  asChild
                >
                  <Link href={`/dashboard/invoices/${invoice.id}`}>
                    <Eye className="mr-1.5 h-3.5 w-3.5" />
                    View
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  asChild
                >
                  <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-destructive hover:text-destructive"
                  onClick={() => handleDelete(invoice.id)}
                >
                  <Trash className="mr-1.5 h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
