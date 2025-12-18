"use client";

import { use, useState, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TEMPLATE_OPTIONS } from "@/components/invoices/types";
import { cn } from "@/lib/utils";
import { BlobProvider } from "@react-pdf/renderer";
import { Document, Page, pdfjs } from "react-pdf";
import { Download, Printer } from "lucide-react";
import { NotFound } from "@/components/ui/not-found";
import LoadingLogo from "@/components/loading-logo";
import { useTemplatePreference } from "@/lib/hooks/use-template-preference";
import { SelectedTemplateComponent } from "@/components/invoices/selected-template";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker (CDN)
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;

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
  const [numPages, setNumPages] = useState<number>(0);

  const invoiceData = useMemo(() => {
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
  }, [invoice, businessProfile]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <LoadingLogo />
        <span className="sr-only">Loading invoice...</span>
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
                aria-label={`${template.label} Template`}
                title={`${template.label} Template`}
              >
                {template.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Preview Area */}
        <Card className="pt-0">
          <CardContent className="p-0">
            <BlobProvider
              key={selectedTemplate}
              document={
                <SelectedTemplateComponent
                  template={selectedTemplate}
                  invoiceData={invoiceData}
                />
              }
            >
              {({ url, loading, blob }) => {
                const handleDownload = useCallback(() => {
                  if (!blob) return;
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = `Invoice-${invoice.invoiceNumber}.pdf`;
                  link.click();
                }, [blob, invoice.invoiceNumber]);

                const handlePrint = useCallback(() => {
                  if (!url) return;
                  const printWindow = window.open(url);
                  printWindow?.print();
                }, [url]);

                if (loading) {
                  return (
                    <div
                      className="flex items-center justify-center h-[calc(100dvh-225px)] max-h-[1000px]"
                      role="status"
                      aria-live="polite"
                    >
                      <LoadingLogo className="animate-pulse" />
                      <span className="sr-only">Generating PDF...</span>
                    </div>
                  );
                }

                if (!blob) return null;

                return (
                  <>
                    {/* Toolbar */}
                    <div
                      className="flex items-center justify-end gap-2 p-2 border-b bg-muted/30"
                      role="toolbar"
                      aria-label="PDF actions"
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDownload}
                        className="h-7 w-7 p-0"
                        aria-label="Download PDF"
                        title="Download PDF"
                        disabled={!blob}
                      >
                        <Download className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handlePrint}
                        className="h-7 w-7 p-0"
                        aria-label="Print PDF"
                        title="Print PDF"
                        disabled={!url}
                      >
                        <Printer className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>

                    <div
                      className="w-full h-[calc(100dvh-285px)] max-h-[1000px] overflow-auto flex flex-col items-center py-4 gap-8 bg-card"
                      role="region"
                      aria-label="PDF preview"
                    >
                      <Document
                        file={blob}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                        loading={
                          <div
                            className="flex items-center justify-center py-12"
                            role="status"
                            aria-live="polite"
                          >
                            <LoadingLogo className="animate-pulse" />
                            <span className="sr-only">Loading PDF...</span>
                          </div>
                        }
                        error={
                          <div
                            className="flex items-center justify-center py-12 text-destructive"
                            role="alert"
                          >
                            Failed to load PDF. Please try again.
                          </div>
                        }
                      >
                        {numPages > 0 &&
                          Array.from(new Array(numPages), (_, index) => (
                            <div
                              key={`page_${index + 1}`}
                              className="shadow-lg bg-card border-2 border-border"
                              aria-label={`Page ${index + 1} of ${numPages}`}
                            >
                              <Page
                                pageNumber={index + 1}
                                width={Math.min(window.innerWidth - 100, 800)}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                              />
                            </div>
                          ))}
                      </Document>
                    </div>
                  </>
                );
              }}
            </BlobProvider>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
