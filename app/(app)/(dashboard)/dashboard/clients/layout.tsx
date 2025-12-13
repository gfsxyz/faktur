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

export default function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const params = useParams();
  const clientId = params?.id as string | undefined;

  // Fetch client data if we have an ID
  const { data: client } = trpc.clients.getById.useQuery(
    { id: clientId! },
    { enabled: !!clientId }
  );

  // Determine current page type
  const isNew = pathname.includes("/new");
  const isEdit = pathname.includes("/edit");

  // Only show breadcrumb if there's more than just "Clients"
  const showBreadcrumb = clientId || isNew;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      {showBreadcrumb && (
        <div className="pt-4 pb-1 animate-in fade-in slide-in-from-top-20 duration-300 ease-out">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="animate-in fade-in slide-in-from-top-20 duration-300 ease-out">
                {clientId || isNew ? (
                  <BreadcrumbLink asChild>
                    <Link href="/dashboard/clients">Clients</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>Clients</BreadcrumbPage>
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

              {clientId && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem className="animate-in fade-in slide-in-from-top-20 duration-300 ease-out">
                    {isEdit ? (
                      <BreadcrumbLink asChild>
                        <Link href={`/dashboard/clients/${clientId}`}>
                          {client?.name || "..."}
                        </Link>
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{client?.name || "..."}</BreadcrumbPage>
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
