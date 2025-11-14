import { pdf } from "@react-pdf/renderer";
import { InvoiceData, TemplateType } from "@/components/invoices/types";
import { ClassicTemplate } from "@/components/invoices/templates/classic-template";
import { NewYorkTemplate } from "@/components/invoices/templates/newyork-template";
import { MinimalistTemplate } from "@/components/invoices/templates/minimalist-template";
import { CreativeTemplate } from "@/components/invoices/templates/creative-template";
import { SakuraTemplate } from "@/components/invoices/templates/sakura-template";
import { CorporateTemplate } from "@/components/invoices/templates/corporate-template";

const getTemplate = (template: TemplateType, invoice: InvoiceData) => {
  switch (template) {
    case "classic":
      return <ClassicTemplate invoice={invoice} />;
    case "newyork":
      return <NewYorkTemplate invoice={invoice} />;
    case "minimalist":
      return <MinimalistTemplate invoice={invoice} />;
    case "creative":
      return <CreativeTemplate invoice={invoice} />;
    case "sakura":
      return <SakuraTemplate invoice={invoice} />;
    case "corporate":
      return <CorporateTemplate invoice={invoice} />;
    default:
      return <ClassicTemplate invoice={invoice} />;
  }
};

export async function generateInvoicePDF(
  invoice: InvoiceData,
  template: TemplateType = "classic"
) {
  try {
    // Get the selected template
    const templateComponent = getTemplate(template, invoice);

    // Create the PDF document
    const blob = await pdf(templateComponent).toBlob();

    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.invoiceNumber}-${template}.pdf`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return { success: false, error };
  }
}
