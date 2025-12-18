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

// THEME: Minimalist Black & White
const styles = StyleSheet.create({
  page: {
    padding: 50, // More whitespace for a premium feel
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#000",
    backgroundColor: "#fff",
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 60,
    alignItems: "flex-start",
  },
  logo: {
    width: 40,
    height: 40,
    marginBottom: 10,
    opacity: 0.8, // Slight fade for elegance
  },
  // The word "INVOICE" is not shouted, it's understated
  title: {
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  invoiceId: {
    fontSize: 10,
    color: "#444",
  },

  // CLIENT & BUSINESS INFO
  metaSection: {
    flexDirection: "row",
    marginBottom: 50,
  },
  colLeft: {
    width: "40%",
    paddingRight: 20,
  },
  colRight: {
    width: "40%",
  },
  label: {
    fontSize: 7,
    textTransform: "uppercase",
    color: "#888",
    marginBottom: 5,
    letterSpacing: 1,
  },
  value: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 20,
  },

  // TABLE
  table: {
    width: "100%",
    marginBottom: 40,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 8,
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee", // Very subtle row dividers
  },

  // COLUMNS
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "center" },
  colRate: { flex: 1.5, textAlign: "right" },
  colAmount: { flex: 1.5, textAlign: "right" },

  headerText: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "bold",
    wordBreak: "keep-all",
  },
  rowText: {
    fontSize: 10,
    color: "#333",
  },

  // TOTALS
  footerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  totalsSection: {
    width: "35%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  totalLabel: {
    fontSize: 9,
    color: "#666",
  },
  totalValue: {
    fontSize: 9,
    textAlign: "right",
  },
  grandTotal: {
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
  },

  // BOTTOM INFO
  bottomMeta: {
    position: "absolute",
    bottom: 50,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 15,
  },
  bottomText: {
    fontSize: 8,
    color: "#999",
  },
});

export function MinimalistTemplate({ invoice }: { invoice: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            {invoice.businessProfile?.logo && (
              <Image src={invoice.businessProfile.logo} style={styles.logo} />
            )}
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>
              {invoice.businessProfile?.companyName}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.title}>Invoice</Text>
            <Text style={styles.invoiceId}>#{invoice.invoiceNumber}</Text>
            <Text style={[styles.invoiceId, { marginTop: 4 }]}>
              {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
            </Text>
          </View>
        </View>

        {/* ADDRESSES */}
        <View style={styles.metaSection}>
          <View style={styles.colLeft}>
            <Text style={styles.label}>Bill To</Text>
            {invoice.client && (
              <View>
                <Text style={styles.value}>
                  {invoice.client.name}
                  {"\n"}
                  {invoice.client.company && `${invoice.client.company}\n`}
                  {invoice.client.email}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.colRight}>
            <Text style={styles.label}>Bill From</Text>
            {invoice.businessProfile && (
              <Text style={styles.value}>
                {invoice.businessProfile.address}
                {"\n"}
                {invoice.businessProfile.city}, {invoice.businessProfile.state}
                {"\n"}
                {invoice.businessProfile.email}
              </Text>
            )}
          </View>
        </View>

        {/* TABLE */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colDesc]}>Description</Text>
            <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
            <Text style={[styles.headerText, styles.colRate]}>Rate</Text>
            <Text style={[styles.headerText, styles.colAmount]}>Amount</Text>
          </View>

          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.rowText, styles.colDesc]}>
                {item.description}
              </Text>
              <Text style={[styles.rowText, styles.colQty]}>
                {item.quantity}
              </Text>
              <Text style={[styles.rowText, styles.colRate]}>
                {formatCurrency(item.rate)}
              </Text>
              <Text style={[styles.rowText, styles.colAmount]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* TOTALS */}
        <View style={styles.footerContainer}>
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
              <Text
                style={[
                  styles.totalLabel,
                  { color: "#000", fontWeight: "bold" },
                ]}
              >
                Total Due
              </Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(invoice.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* FOOTER STRIP */}
        <View style={styles.bottomMeta}>
          <Text style={styles.bottomText}>{invoice.status.toUpperCase()}</Text>
          <Text style={styles.bottomText}>
            Due by {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
