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

// THEME: Sidebar - Uses a vertical layout with a prominent color column
const colors = {
  primary: "#374151", // Dark Slate
  secondary: "#4b5563", // Text gray
  border: "#e5e7eb",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    flexDirection: "row", // Key for the sidebar layout
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.secondary,
  },

  // --- 1. SIDEBAR (Left Column) ---
  sidebar: {
    width: 140, // Fixed width for the sidebar
    backgroundColor: colors.primary,
    color: colors.white,
    padding: 20,
    paddingTop: 30,
    height: "100%",
  },
  logo: {
    width: 40,
    height: 40,
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 5,
    letterSpacing: 1,
    color: colors.white,
  },
  subtitle: {
    fontSize: 12,
    color: colors.white,
    marginBottom: 30,
  },

  // Sidebar Text Grouping
  metaGroup: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#4f5b6b", // Slightly lighter slate for internal divider
    paddingBottom: 15,
  },
  metaLabel: {
    fontSize: 7,
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 4,
    letterSpacing: 0.5,
    color: "#e5e7eb",
  },
  metaValue: {
    fontSize: 9,
    lineHeight: 1.4,
    color: colors.white,
  },

  // --- 2. MAIN CONTENT (Right Column) ---
  mainContent: {
    flexGrow: 1, // Takes up remaining space
    padding: 30,
    paddingTop: 40,
  },

  // Addresses
  addresses: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 20,
  },
  addressBlock: {
    width: "48%",
  },
  addressTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 8,
    color: colors.primary,
  },
  addressText: {
    fontSize: 10,
    lineHeight: 1.5,
  },

  // Table
  tableContainer: {
    marginBottom: 40,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary, // Strong bottom border
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // Columns
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "center" },
  colRate: { flex: 1.5, textAlign: "right" },
  colAmount: { flex: 1.5, textAlign: "right", fontWeight: "bold" },

  headerText: {
    fontSize: 9,
    textTransform: "uppercase",
    fontWeight: "bold",
    color: colors.primary,
    whiteSpace: "nowrap",
  },
  rowText: {
    fontSize: 10,
  },

  // Totals
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalsBox: {
    width: "45%",
    paddingRight: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 10,
    color: colors.secondary,
  },
  totalValue: {
    fontSize: 10,
    textAlign: "right",
    fontWeight: "bold",
  },
  grandTotal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  grandTotalValue: {
    fontSize: 14,
    color: colors.primary,
  },
});

export function ElegantTemplate({ invoice }: { invoice: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* --- 1. SIDEBAR (Brand/Metadata Column) --- */}
        <View style={styles.sidebar}>
          <Text style={styles.title}>INVOICE</Text>
          <Text style={styles.subtitle}>DOCUMENT</Text>
          {invoice.businessProfile?.logo && (
            <Image src={invoice.businessProfile.logo} style={styles.logo} />
          )}
          {/* Business Info */}
          {invoice.businessProfile && (
            <View style={styles.metaGroup}>
              <Text style={styles.metaLabel}>Bill From</Text>
              <Text style={styles.metaValue}>
                {invoice.businessProfile.companyName}
              </Text>
              <Text style={styles.metaValue}>
                {invoice.businessProfile.address}
              </Text>
              <Text style={styles.metaValue}>
                {invoice.businessProfile.email}
              </Text>
            </View>
          )}
          {/* Invoice Details */}
          <View style={styles.metaGroup}>
            <Text style={styles.metaLabel}>Invoice No</Text>
            <Text style={styles.metaValue}>#{invoice.invoiceNumber}</Text>
          </View>
          <View style={styles.metaGroup}>
            <Text style={styles.metaLabel}>Issue Date</Text>
            <Text style={styles.metaValue}>
              {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
            </Text>
          </View>
          <View style={styles.metaGroup}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>
              {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
            </Text>
          </View>
        </View>

        {/* --- 2. MAIN CONTENT (Client/Items/Total) --- */}
        <View style={styles.mainContent}>
          {/* Client Info (Bill To) */}
          <View style={styles.addresses}>
            <View style={styles.addressBlock}>
              <Text style={styles.addressTitle}>Bill To</Text>
              {invoice.client && (
                <Text style={styles.addressText}>
                  <Text style={{ fontWeight: "bold" }}>
                    {invoice.client.name}
                  </Text>
                  {"\n"}
                  {invoice.client.company && `${invoice.client.company}\n`}
                  {invoice.client.email}
                </Text>
              )}
            </View>
            <View style={styles.addressBlock}>
              {/* Status Badge */}
              <Text style={styles.addressTitle}>Status</Text>
              <Text
                style={[
                  styles.addressText,
                  {
                    fontWeight: "bold",
                    color:
                      invoice.status === "paid" ? "#059669" : colors.primary,
                  },
                ]}
              >
                {invoice.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* ITEMS TABLE */}
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text
                style={[styles.headerText, styles.colDesc]}
                hyphenationCallback={(word) => [word]}
              >
                Description
              </Text>
              <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
              <Text style={[styles.headerText, styles.colRate]}>Rate</Text>
              <Text style={[styles.headerText, styles.colAmount]}>Amount</Text>
            </View>

            {invoice.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text
                  style={[styles.rowText, styles.colDesc]}
                  hyphenationCallback={(word) => [word]}
                >
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
          <View style={styles.totalsContainer}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(invoice.subtotal)}
                </Text>
              </View>
              {/* Discount/Tax Rows here... */}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%)</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency(invoice.taxAmount)}
                </Text>
              </View>

              <View style={[styles.totalRow, styles.grandTotal]}>
                <Text style={styles.totalLabel}>TOTAL DUE</Text>
                <Text style={[styles.totalValue, styles.grandTotalValue]}>
                  {formatCurrency(invoice.total)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
