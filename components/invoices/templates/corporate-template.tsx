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

// THEME: Modern/Azure - Uses a bold primary color for emphasis
const colors = {
  primary: "#1e40af", // Deep Blue
  secondary: "#4b5563", // Dark Gray text
  lightGray: "#f3f4f6", // Subtle background for sections
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    padding: 0, // Padding will be managed by internal views
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.secondary,
    backgroundColor: colors.white,
  },

  // --- TOP BANNER ---
  topBanner: {
    backgroundColor: colors.primary,
    color: colors.white,
    padding: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 30,
  },
  logo: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  invoiceId: {
    fontSize: 12,
    marginTop: 5,
  },

  // --- MAIN CONTENT WRAPPER (adds padding back) ---
  contentWrapper: {
    paddingHorizontal: 30,
  },

  // --- DETAILS & ADDRESSES ---
  addressGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  detailsGroup: {
    width: "30%",
  },
  addressGroup: {
    width: "30%",
  },
  label: {
    fontSize: 8,
    textTransform: "uppercase",
    color: colors.secondary,
    marginBottom: 4,
    fontWeight: "bold",
  },
  value: {
    fontSize: 11,
    lineHeight: 1.6,
    color: colors.secondary,
  },

  // --- TABLE ---
  tableContainer: {
    marginBottom: 40,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.lightGray, // Light gray background for header
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.secondary,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },

  // Columns (consistent structure)
  colDesc: { flex: 4 },
  colQty: { flex: 1, textAlign: "center" },
  colRate: { flex: 1.5, textAlign: "right" },
  colAmount: { flex: 1.5, textAlign: "right" },

  headerText: {
    fontSize: 9,
    textTransform: "uppercase",
    fontWeight: "bold",
    color: colors.secondary,
  },
  rowText: {
    fontSize: 10,
    color: colors.secondary,
  },

  // --- TOTALS ---
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  totalsBox: {
    width: "40%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 10,
    color: colors.secondary,
  },
  totalValue: {
    fontSize: 10,
    textAlign: "right",
    fontWeight: "bold",
    color: colors.secondary,
  },

  // Grand Total uses the Primary Color for impact
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    backgroundColor: colors.primary,
    color: colors.white,
    paddingHorizontal: 15,
    borderRadius: 4,
    marginTop: 10,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.white,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.white,
  },

  // --- NOTES/FOOTER ---
  notesSection: {
    paddingHorizontal: 30,
    marginTop: 20,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 5,
    textTransform: "uppercase",
    color: colors.primary,
  },
  notesText: {
    fontSize: 9,
    color: colors.secondary,
    lineHeight: 1.4,
  },
});

export function CorporateTemplate({ invoice }: { invoice: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* --- 1. TOP BANNER (High Impact Header) --- */}
        <View style={styles.topBanner}>
          <View>
            {invoice.businessProfile?.logo && (
              <Image src={invoice.businessProfile.logo} style={styles.logo} />
            )}
            <Text
              style={{ fontSize: 16, fontWeight: "bold", color: colors.white }}
            >
              {invoice.businessProfile?.companyName}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceId}>#{invoice.invoiceNumber}</Text>
          </View>
        </View>

        {/* --- 2. ADDRESSES & DATES (Inside Wrapper) --- */}
        <View style={styles.contentWrapper}>
          <View style={styles.addressGrid}>
            {/* Details Column */}
            <View style={styles.detailsGroup}>
              <Text style={styles.label}>Issue Date</Text>
              <Text style={styles.value}>
                {format(new Date(invoice.issueDate), "MMMM dd, yyyy")}
              </Text>
              <Text style={[styles.label, { marginTop: 15 }]}>Due Date</Text>
              <Text style={styles.value}>
                {format(new Date(invoice.dueDate), "MMMM dd, yyyy")}
              </Text>
            </View>

            {/* Bill From Column */}
            <View style={styles.addressGroup}>
              <Text style={styles.label}>Bill From</Text>
              {invoice.businessProfile && (
                <Text style={styles.value}>
                  {invoice.businessProfile.companyName}
                  {"\n"}
                  {invoice.businessProfile.address}
                  {"\n"}
                  {invoice.businessProfile.city},{" "}
                  {invoice.businessProfile.state}
                  {"\n"}
                  {invoice.businessProfile.email}
                </Text>
              )}
            </View>

            {/* Bill To Column */}
            <View style={styles.addressGroup}>
              <Text style={styles.label}>Bill To</Text>
              {invoice.client && (
                <Text style={styles.value}>
                  <Text style={{ fontWeight: "bold" }}>
                    {invoice.client.name}
                  </Text>
                  {"\n"}
                  {invoice.client.company && `${invoice.client.company}\n`}
                  {invoice.client.email}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* --- 3. ITEMS TABLE --- */}
        <View style={styles.contentWrapper}>
          <View style={styles.tableContainer}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, styles.colDesc]}>
                Item Description
              </Text>
              <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
              <Text style={[styles.headerText, styles.colRate]}>Rate</Text>
              <Text style={[styles.headerText, styles.colAmount]}>Amount</Text>
            </View>

            {/* Rows */}
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
                <Text
                  style={[
                    styles.rowText,
                    styles.colAmount,
                    { fontWeight: "bold" },
                  ]}
                >
                  {formatCurrency(item.amount)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* --- 4. TOTALS (Outside Wrapper for Clean Alignment) --- */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(invoice.subtotal)}
              </Text>
            </View>

            {invoice.discountAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount</Text>
                <Text style={[styles.totalValue, { color: "#047857" }]}>
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

            {/* Grand Total Row with Primary Color Background */}
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL DUE</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(invoice.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* --- 5. NOTES (Simple Bottom Section) --- */}
        {(invoice.notes || invoice.terms) && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes & Payment Terms</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
            <Text
              style={[styles.notesText, { marginTop: 5, fontStyle: "italic" }]}
            >
              {invoice.terms}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
