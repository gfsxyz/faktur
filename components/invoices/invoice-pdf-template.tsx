import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { format } from "date-fns";

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  companyInfo: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  companyDetails: {
    fontSize: 9,
    color: "#666",
    lineHeight: 1.4,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: "#666",
    marginBottom: 3,
  },
  value: {
    fontSize: 11,
    color: "#000",
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 5,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tableColDescription: {
    flex: 3,
  },
  tableColQuantity: {
    flex: 1,
    textAlign: "right",
  },
  tableColRate: {
    flex: 1.5,
    textAlign: "right",
  },
  tableColAmount: {
    flex: 1.5,
    textAlign: "right",
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  tableText: {
    fontSize: 10,
  },
  totalsSection: {
    marginTop: 20,
    marginLeft: "50%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: "#666",
    marginRight: 40,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "right",
  },
  grandTotal: {
    borderTopWidth: 2,
    borderTopColor: "#000",
    paddingTop: 8,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  notesSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
    color: "#666",
    lineHeight: 1.5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#999",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
});

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

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return { backgroundColor: "#22c55e", color: "#fff" };
    case "sent":
      return { backgroundColor: "#3b82f6", color: "#fff" };
    case "overdue":
      return { backgroundColor: "#ef4444", color: "#fff" };
    case "cancelled":
      return { backgroundColor: "#64748b", color: "#fff" };
    default:
      return { backgroundColor: "#94a3b8", color: "#fff" };
  }
};

export function InvoicePDFTemplate({ invoice }: { invoice: InvoiceData }) {
  const statusColors = getStatusColor(invoice.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {invoice.businessProfile?.logo && (
              <Image src={invoice.businessProfile.logo} style={styles.logo} />
            )}
            {invoice.businessProfile && (
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>
                  {invoice.businessProfile.companyName}
                </Text>
                <Text style={styles.companyDetails}>
                  {invoice.businessProfile.email}
                </Text>
                {invoice.businessProfile.phone && (
                  <Text style={styles.companyDetails}>
                    {invoice.businessProfile.phone}
                  </Text>
                )}
                {invoice.businessProfile.address && (
                  <Text style={styles.companyDetails}>
                    {invoice.businessProfile.address}
                    {invoice.businessProfile.city && `, ${invoice.businessProfile.city}`}
                    {invoice.businessProfile.state && `, ${invoice.businessProfile.state}`}
                    {invoice.businessProfile.postalCode && ` ${invoice.businessProfile.postalCode}`}
                  </Text>
                )}
                {invoice.businessProfile.country && (
                  <Text style={styles.companyDetails}>
                    {invoice.businessProfile.country}
                  </Text>
                )}
                {invoice.businessProfile.taxId && (
                  <Text style={styles.companyDetails}>
                    Tax ID: {invoice.businessProfile.taxId}
                  </Text>
                )}
              </View>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            <View style={[styles.statusBadge, statusColors]}>
              <Text style={styles.statusText}>{invoice.status}</Text>
            </View>
          </View>
        </View>

        {/* Invoice Details and Client Info */}
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Invoice Details</Text>
            <View style={{ marginBottom: 8 }}>
              <Text style={styles.label}>Issue Date</Text>
              <Text style={styles.value}>
                {format(new Date(invoice.issueDate), "MMMM dd, yyyy")}
              </Text>
            </View>
            <View>
              <Text style={styles.label}>Due Date</Text>
              <Text style={styles.value}>
                {format(new Date(invoice.dueDate), "MMMM dd, yyyy")}
              </Text>
            </View>
          </View>

          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Bill To</Text>
            {invoice.client && (
              <>
                <View style={{ marginBottom: 8 }}>
                  <Text style={styles.label}>Client Name</Text>
                  <Text style={styles.value}>{invoice.client.name}</Text>
                </View>
                <View style={{ marginBottom: 8 }}>
                  <Text style={styles.label}>Email</Text>
                  <Text style={styles.value}>{invoice.client.email}</Text>
                </View>
                {invoice.client.phone && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={styles.label}>Phone</Text>
                    <Text style={styles.value}>{invoice.client.phone}</Text>
                  </View>
                )}
                {invoice.client.company && (
                  <View>
                    <Text style={styles.label}>Company</Text>
                    <Text style={styles.value}>{invoice.client.company}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableColDescription]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableColQuantity]}>
              Qty
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableColRate]}>
              Rate
            </Text>
            <Text style={[styles.tableHeaderText, styles.tableColAmount]}>
              Amount
            </Text>
          </View>

          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableText, styles.tableColDescription]}>
                {item.description}
              </Text>
              <Text style={[styles.tableText, styles.tableColQuantity]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableText, styles.tableColRate]}>
                USD {item.rate.toFixed(2)}
              </Text>
              <Text style={[styles.tableText, styles.tableColAmount]}>
                USD {item.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              USD {invoice.subtotal.toFixed(2)}
            </Text>
          </View>

          {invoice.discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={[styles.totalValue, { color: "#22c55e" }]}>
                -USD {invoice.discountAmount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Tax ({invoice.taxRate}%)
            </Text>
            <Text style={styles.totalValue}>
              USD {invoice.taxAmount.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              USD {invoice.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Notes and Terms */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {invoice.terms && (
          <View style={[styles.notesSection, { marginTop: 10 }]}>
            <Text style={styles.notesTitle}>Terms & Conditions</Text>
            <Text style={styles.notesText}>{invoice.terms}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {format(new Date(), "MMMM dd, yyyy 'at' hh:mm a")}
        </Text>
      </Page>
    </Document>
  );
}
