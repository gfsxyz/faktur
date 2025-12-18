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
import { formatCurrency } from "@/lib/utils/money";

// New York Template - Elegant with bold typography
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    borderBottomWidth: 3,
    borderBottomColor: "#000",
    paddingBottom: 5,
  },
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  logo: {
    width: 70,
    height: 70,
  },
  companySection: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  companyDetails: {
    fontSize: 9,
    color: "#444",
    lineHeight: 1.6,
  },
  invoiceInfo: {
    alignItems: "flex-end",
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#000",
    marginTop: 5,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#fff",
    letterSpacing: 1,
  },
  detailsSection: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailBox: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f8f8f8",
    marginRight: 10,
  },
  detailBoxLast: {
    marginRight: 0,
  },
  detailTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailLabel: {
    fontSize: 8,
    color: "#666",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 11,
    color: "#000",
    fontWeight: "bold",
    marginBottom: 8,
  },
  table: {
    marginTop: 10,
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
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
    letterSpacing: 1,
  },
  tableText: {
    fontSize: 10,
  },
  totalsSection: {
    marginLeft: "55%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  totalLabel: {
    fontSize: 10,
    color: "#666",
    marginRight: 50,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "right",
  },
  grandTotal: {
    backgroundColor: "#000",
    marginTop: 5,
    paddingVertical: 12,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  notesSection: {
    marginTop: 40,
    borderTopWidth: 2,
    borderTopColor: "#000",
    paddingTop: 20,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  notesText: {
    fontSize: 9,
    color: "#444",
    lineHeight: 1.6,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: "center",
    color: "#999",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
  },
});

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return { backgroundColor: "#000" };
    case "sent":
      return { backgroundColor: "#333" };
    case "overdue":
      return { backgroundColor: "#666" };
    case "cancelled":
      return { backgroundColor: "#999" };
    default:
      return { backgroundColor: "#000" };
  }
};

export function NewYorkTemplate({ invoice }: { invoice: InvoiceData }) {
  const statusColors = getStatusColor(invoice.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>INVOICE</Text>
            {invoice.businessProfile?.logo && (
              <Image src={invoice.businessProfile.logo} style={styles.logo} />
            )}
          </View>
          <View style={styles.companySection}>
            <View style={{ flex: 1 }}>
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
                      {invoice.businessProfile.city &&
                        `, ${invoice.businessProfile.city}`}
                      {invoice.businessProfile.state &&
                        `, ${invoice.businessProfile.state}`}
                    </Text>
                  )}
                </>
              )}
            </View>
            <View style={styles.invoiceInfo}>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
              <View style={[styles.statusBadge, statusColors]}>
                <Text style={styles.statusText}>{invoice.status}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <View style={styles.detailBox}>
            <Text style={styles.detailTitle}>Invoice Details</Text>
            <Text style={styles.detailLabel}>Issue Date</Text>
            <Text style={styles.detailValue}>
              {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
            </Text>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>
              {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
            </Text>
          </View>
          <View style={[styles.detailBox, styles.detailBoxLast]}>
            <Text style={styles.detailTitle}>Bill To</Text>
            {invoice.client && (
              <>
                <Text style={styles.detailLabel}>Client</Text>
                <Text style={styles.detailValue}>{invoice.client.name}</Text>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{invoice.client.email}</Text>
                {invoice.client.company && (
                  <>
                    <Text style={styles.detailLabel}>Company</Text>
                    <Text style={styles.detailValue}>
                      {invoice.client.company}
                    </Text>
                  </>
                )}
              </>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
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
                {formatCurrency(item.rate)}
              </Text>
              <Text style={[styles.tableText, styles.tableColAmount]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.subtotal)}
            </Text>
          </View>

          {invoice.discountAmount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount</Text>
              <Text style={styles.totalValue}>
                -{formatCurrency(invoice.discountAmount)}
              </Text>
            </View>
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%)</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.taxAmount)}
            </Text>
          </View>

          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              {formatCurrency(invoice.total)}
            </Text>
          </View>
        </View>

        {/* Notes and Terms */}
        {(invoice.notes || invoice.terms) && (
          <View style={styles.notesSection}>
            {invoice.notes && (
              <View style={{ marginBottom: 15 }}>
                <Text style={styles.notesTitle}>Notes</Text>
                <Text style={styles.notesText}>{invoice.notes}</Text>
              </View>
            )}
            {invoice.terms && (
              <View>
                <Text style={styles.notesTitle}>Terms & Conditions</Text>
                <Text style={styles.notesText}>{invoice.terms}</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {format(new Date(), "MMMM dd, yyyy")}
        </Text>
      </Page>
    </Document>
  );
}
