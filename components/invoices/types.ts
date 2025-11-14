export interface InvoiceData {
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

export type TemplateType = "classic" | "newyork" | "minimalist" | "elegant" | "sakura" | "corporate";

export interface TemplateOption {
  value: TemplateType;
  label: string;
  description: string;
}

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  { value: "classic", label: "Classic", description: "Traditional professional design" },
  { value: "newyork", label: "New York", description: "Bold editorial typography" },
  { value: "minimalist", label: "Minimalist", description: "Clean and minimal" },
  { value: "elegant", label: "Elegant", description: "Sophisticated high-end design" },
  { value: "sakura", label: "Sakura", description: "Japanese-inspired, soft colors" },
  { value: "corporate", label: "Corporate", description: "Professional and structured" },
];
