"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default function InvoicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const invoiceId = params?.id as string | undefined;

  // Fetch invoice data if we have an ID
  const { data: invoice } = trpc.invoices.getById.useQuery(
    { id: invoiceId! },
    { enabled: !!invoiceId }
  );

  // Determine current page type
  const isNew = pathname.includes("/new");
  const isEdit = pathname.includes("/edit");
  const isPreview = pathname.includes("/preview");

  // Only show breadcrumb if there's more than just "Invoices"
  const showBreadcrumb = invoiceId || isNew;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      {showBreadcrumb && (
        <div className="pt-4 pb-1 animate-in fade-in slide-in-from-top-20 duration-300 ease-out">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="animate-in fade-in slide-in-from-top-20 duration-300 ease-out">
                {invoiceId || isNew ? (
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard/invoices">Invoices</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>Invoices</BreadcrumbPage>
                )}
              </BreadcrumbItem>

              {isNew && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem className="animate-in fade-in slide-in-from-top-20 duration-300 ease-out">
                    <BreadcrumbPage>New</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}

              {invoiceId && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem className="animate-in fade-in slide-in-from-top-20 duration-300 ease-out">
                    {isEdit || isPreview ? (
                      <BreadcrumbLink asChild>
                        <Link href={`/dashboard/invoices/${invoiceId}`}>
                          {invoice ? `#${invoice.invoiceNumber}` : "..."}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>
                        {invoice ? `#${invoice.invoiceNumber}` : "..."}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>

                  {isEdit && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem className="animate-in fade-in slide-in-from-top-20 duration-300 ease-out">
                        <BreadcrumbPage>Edit</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}

                  {isPreview && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem className="animate-in fade-in slide-in-from-top-20 duration-300 ease-out">
                        <BreadcrumbPage>Preview</BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}

      {/* Page Content */}
      {children}
    </div>
  );
}
