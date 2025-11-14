import { pdf } from "@react-pdf/renderer";
import { InvoicePDFTemplate } from "@/components/invoices/invoice-pdf-template";

interface InvoiceData {
  invoiceNumber: string;
  status: string;
  issueDate: Date | string;
  dueDate: Date | string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  notes?: string | null;
  terms?: string | null;
  client: {
    name: string;
    email: string;
    phone?: string | null;
    company?: string | null;
  } | null;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  businessProfile?: {
    companyName: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postalCode?: string | null;
    taxId?: string | null;
    logo?: string | null;
  } | null;
}

export async function generateInvoicePDF(invoice: InvoiceData) {
  try {
    // Create the PDF document
    const blob = await pdf(InvoicePDFTemplate({ invoice })).toBlob();

    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.invoiceNumber}.pdf`;

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
