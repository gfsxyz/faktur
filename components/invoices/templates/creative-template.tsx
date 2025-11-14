import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { InvoiceData } from "../types";

// Creative Template - Colorful and modern design
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  colorBar: {
    height: 8,
    backgroundColor: "#6366f1",
    marginBottom: 30,
  },
  header: {
    marginBottom: 35,
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
    width: 65,
    height: 65,
    marginBottom: 12,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1e293b",
  },
  companyDetails: {
    fontSize: 9,
    color: "#64748b",
    lineHeight: 1.5,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#6366f1",
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 13,
    color: "#1e293b",
    marginBottom: 15,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#fff",
  },
  infoSection: {
    flexDirection: "row",
    marginBottom: 30,
    gap: 15,
  },
  infoBox: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#e2e8f0",
  },
  infoBoxHighlight: {
    borderColor: "#6366f1",
    backgroundColor: "#f8f9ff",
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoLabel: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 10,
    color: "#1e293b",
    fontWeight: "bold",
    marginBottom: 8,
  },
  table: {
    marginTop: 15,
    marginBottom: 25,
  },
  tableTitle: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1e293b",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#6366f1",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f8fafc",
    marginBottom: 3,
    borderRadius: 4,
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
    fontSize: 9,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
  },
  tableText: {
    fontSize: 10,
    color: "#334155",
  },
  totalsSection: {
    marginTop: 20,
    marginLeft: "50%",
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 10,
    color: "#64748b",
    marginRight: 40,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "right",
    color: "#1e293b",
  },
  grandTotal: {
    borderTopWidth: 2,
    borderTopColor: "#6366f1",
    paddingTop: 10,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6366f1",
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6366f1",
  },
  notesSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#fef3c7",
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#92400e",
  },
  notesText: {
    fontSize: 9,
    color: "#78350f",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: "#e2e8f0",
  },
});

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return { backgroundColor: "#10b981" };
    case "sent":
      return { backgroundColor: "#3b82f6" };
    case "overdue":
      return { backgroundColor: "#ef4444" };
    case "cancelled":
      return { backgroundColor: "#6b7280" };
    default:
      return { backgroundColor: "#8b5cf6" };
  }
};

export function CreativeTemplate({ invoice }: { invoice: InvoiceData }) {
  const statusColors = getStatusColor(invoice.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Color Bar */}
        <View style={styles.colorBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {invoice.businessProfile?.logo && (
              <Image src={invoice.businessProfile.logo} style={styles.logo} />
            )}
            {invoice.businessProfile && (
              <>
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
                  </Text>
                )}
              </>
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

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Invoice Details</Text>
            <Text style={styles.infoLabel}>Issue Date</Text>
            <Text style={styles.infoValue}>
              {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
            </Text>
            <Text style={styles.infoLabel}>Due Date</Text>
            <Text style={styles.infoValue}>
              {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
            </Text>
          </View>
          <View style={[styles.infoBox, styles.infoBoxHighlight]}>
            <Text style={styles.infoTitle}>Bill To</Text>
            {invoice.client && (
              <>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{invoice.client.name}</Text>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{invoice.client.email}</Text>
                {invoice.client.company && (
                  <>
                    <Text style={styles.infoLabel}>Company</Text>
                    <Text style={styles.infoValue}>{invoice.client.company}</Text>
                  </>
                )}
              </>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <Text style={styles.tableTitle}>Items & Services</Text>
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
                ${item.rate.toFixed(2)}
              </Text>
              <Text style={[styles.tableText, styles.tableColAmount]}>
                ${item.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              ${invoice.subtotal.toFixed(2)}
            </Text>
          </View>

          {invoice.discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={[styles.totalValue, { color: "#10b981" }]}>
                -${invoice.discountAmount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%)</Text>
            <Text style={styles.totalValue}>
              ${invoice.taxAmount.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total Amount</Text>
            <Text style={styles.grandTotalValue}>
              ${invoice.total.toFixed(2)}
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
          <View style={[styles.notesSection, { backgroundColor: "#e0e7ff", borderLeftColor: "#6366f1", marginTop: 10 }]}>
            <Text style={[styles.notesTitle, { color: "#312e81" }]}>Terms & Conditions</Text>
            <Text style={[styles.notesText, { color: "#3730a3" }]}>{invoice.terms}</Text>
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
