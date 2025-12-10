"use client";

import { use } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TEMPLATE_OPTIONS } from "@/components/invoices/types";
import { cn } from "@/lib/utils";
import { PDFViewer } from "@react-pdf/renderer";
import { NotFound } from "@/components/ui/not-found";
import LoadingLogo from "@/components/loading-logo";
import { useTemplatePreference } from "@/lib/hooks/use-template-preference";
import { SelectedTemplateComponent } from "@/components/invoices/selected-template";

export default function InvoicePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: invoice, isLoading } = trpc.invoices.getById.useQuery({ id });
  const { data: businessProfile } = trpc.businessProfile.get.useQuery();
  const { template: selectedTemplate, setTemplate: setSelectedTemplate } =
    useTemplatePreference();

  const getInvoiceData = () => {
    if (!invoice) return null;

    return {
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      discountAmount: invoice.discountAmount || 0,
      total: invoice.total,
      notes: invoice.notes,
      terms: invoice.terms,
      client: invoice.client
        ? {
            name: invoice.client.name,
            email: invoice.client.email,
            phone: invoice.client.phone,
            company: invoice.client.company,
          }
        : null,
      items:
        invoice.items?.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        })) || [],
      businessProfile: businessProfile
        ? {
            companyName: businessProfile.companyName,
            email: businessProfile.email,
            phone: businessProfile.phone,
            address: businessProfile.address,
            city: businessProfile.city,
            state: businessProfile.state,
            country: businessProfile.country,
            postalCode: businessProfile.postalCode,
            taxId: businessProfile.taxId,
            logo: businessProfile.logo,
          }
        : null,
    };
  };

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingLogo />
      </div>
    );
  }

  if (!invoice) {
    return (
      <NotFound
        prefix="Invoice"
        backHref="/dashboard/invoices"
        backLabel="Back to Invoices"
      />
    );
  }

  const invoiceData = getInvoiceData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-primary">
            Invoice Preview
          </h1>
          <p className="text-xs text-muted-foreground">
            Invoice #{invoice.invoiceNumber}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Template Selector */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] text-muted-foreground">
            Choose your preferred invoice design
          </p>

          <div className="flex flex-wrap gap-2">
            {TEMPLATE_OPTIONS.map((template) => (
              <Button
                key={template.value}
                variant="ghost"
                size={"sm"}
                onClick={() => setSelectedTemplate(template.value)}
                className={cn(
                  "px-3 py-1.5 bg-accent/50 rounded-xl text-xs font-medium transition-all text-muted-foreground border border-transparent",
                  selectedTemplate === template.value &&
                    "border-primary/20 bg-accent/30 shadow-sm text-primary dark:text-white border"
                )}
              >
                {template.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Preview Area */}
        <Card>
          <CardContent className="p-0">
            <PDFViewer
              key={selectedTemplate}
              className="w-full h-[calc(100dvh-225px)] max-h-[1000px] border-0"
              showToolbar={true}
            >
              <SelectedTemplateComponent
                template={selectedTemplate}
                invoiceData={invoiceData}
              />
            </PDFViewer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
