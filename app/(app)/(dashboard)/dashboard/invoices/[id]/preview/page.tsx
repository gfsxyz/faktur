"use client";

import { use, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { TEMPLATE_OPTIONS, TemplateType } from "@/components/invoices/types";
import { cn } from "@/lib/utils";
import { pdf } from "@react-pdf/renderer";
import { ClassicTemplate } from "@/components/invoices/templates/classic-template";
import { NewYorkTemplate } from "@/components/invoices/templates/newyork-template";
import { MinimalistTemplate } from "@/components/invoices/templates/minimalist-template";
import { ElegantTemplate } from "@/components/invoices/templates/elegant-template";
import { SakuraTemplate } from "@/components/invoices/templates/sakura-template";
import { CorporateTemplate } from "@/components/invoices/templates/corporate-template";
import { NotFound } from "@/components/ui/not-found";
import LoadingLogo from "@/components/loading-logo";
import { useTemplatePreference } from "@/lib/hooks/use-template-preference";

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
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

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

  const getTemplateComponent = (template: TemplateType, data: any) => {
    switch (template) {
      case "classic":
        return <ClassicTemplate invoice={data} />;
      case "newyork":
        return <NewYorkTemplate invoice={data} />;
      case "minimalist":
        return <MinimalistTemplate invoice={data} />;
      case "elegant":
        return <ElegantTemplate invoice={data} />;
      case "sakura":
        return <SakuraTemplate invoice={data} />;
      case "corporate":
        return <CorporateTemplate invoice={data} />;
      default:
        return <ClassicTemplate invoice={data} />;
    }
  };

  // Generate preview whenever template or data changes
  useEffect(() => {
    const generatePreview = async () => {
      const invoiceData = getInvoiceData();
      if (!invoiceData) return;

      setIsGeneratingPreview(true);
      try {
        const templateComponent = getTemplateComponent(
          selectedTemplate,
          invoiceData
        );
        const blob = await pdf(templateComponent).toBlob();
        const url = URL.createObjectURL(blob);

        // Cleanup previous URL
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }

        setPdfUrl(url);
      } catch (error) {
        console.error("Failed to generate preview:", error);
      } finally {
        setIsGeneratingPreview(false);
      }
    };

    generatePreview();

    // Cleanup on unmount
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [selectedTemplate, invoice, businessProfile]);

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
            {isGeneratingPreview ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-[800px] border-0"
                title="Invoice Preview"
              />
            ) : (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center space-y-2">
                  <p className="text-sm">Generating preview...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
