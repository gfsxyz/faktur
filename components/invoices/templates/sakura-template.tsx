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

// THEME: Sakura Bloom - Soft blush dominance with dynamic structure
const colors = {
  primaryInk: "#333333",
  softBlush: "#f8f2f5", // Dominant background fill for accents
  cherryBlossom: "#d898a9", // Strong accent for lines/totals
  white: "#ffffff",
  lightGray: "#aaaaaa",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.primaryInk,
    backgroundColor: colors.white,
  },

  // --- HEADER (Logo Left, Title Right) ---
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  titleBlock: {
    alignItems: "flex-end",
    paddingBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
    color: colors.primaryInk,
  },
  invoiceNumber: {
    fontSize: 12,
    letterSpacing: 0.5,
    color: colors.cherryBlossom,
  },

  // --- TOP INFORMATION GRID (Dynamic 2x2 Layout) ---
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
  },

  // Bill To / Bill From Grouping (Aligned Left)
  addressGroup: {
    width: "50%",
  },
  addressBox: {
    marginBottom: 25,
  },

  // Date Block (The Floating Sakura Box - Aligned Right)
  dateBoxWrapper: {
    width: "40%", // Narrower column for dates
    padding: 15,
    backgroundColor: colors.softBlush, // Dominant pink background
    borderRadius: 4,
    borderLeftWidth: 3, // Accent vertical line
    borderLeftColor: colors.cherryBlossom,
  },

  label: {
    fontSize: 8,
    textTransform: "uppercase",
    color: colors.primaryInk,
    marginBottom: 5,
    fontWeight: "bold",
  },
  value: {
    fontSize: 10,
    lineHeight: 1.6,
  },

  // --- TABLE ---
  tableContainer: {
    marginBottom: 40,
    borderTopWidth: 1, // Separator line below address blocks
    borderTopColor: colors.lightGray,
    paddingTop: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: colors.cherryBlossom,
    paddingBottom: 8,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
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
    color: colors.primaryInk,
  },

  // --- TOTALS ---
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalsBox: {
    width: "40%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  // Grand Total uses the soft pink fill
  grandTotal: {
    backgroundColor: colors.softBlush,
    padding: 10,
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.cherryBlossom,
  },

  // --- NOTES/FOOTER ---
  notesSection: {
    marginTop: 40,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 5,
    color: colors.cherryBlossom,
  },
  notesText: {
    fontSize: 9,
    lineHeight: 1.4,
  },
});

export function SakuraTemplate({ invoice }: { invoice: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* --- 1. HEADER (Logo & Title) --- */}
        <View style={styles.header}>
          <View>
            {invoice.businessProfile?.logo && (
              <Image src={invoice.businessProfile.logo} style={styles.logo} />
            )}
            <Text style={{ fontSize: 16, fontWeight: "bold" }}>
              {invoice.businessProfile?.companyName}
            </Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.mainTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
          </View>
        </View>

        {/* --- 2. DYNAMIC INFO GRID --- */}
        <View style={styles.infoGrid}>
          {/* LEFT SIDE: Bill To / Bill From */}
          <View style={styles.addressGroup}>
            <View style={styles.addressBox}>
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

            <View style={styles.addressBox}>
              <Text style={styles.label}>Bill From</Text>
              {invoice.businessProfile && (
                <Text style={styles.value}>
                  {invoice.businessProfile.address}
                  {"\n"}
                  {invoice.businessProfile.city},{" "}
                  {invoice.businessProfile.state}
                  {"\n"}
                  {invoice.businessProfile.email}
                </Text>
              )}
            </View>
          </View>

          {/* RIGHT SIDE: Floating Sakura Date Box */}
          <View style={styles.dateBoxWrapper}>
            <View>
              <Text style={styles.label}>Issue Date</Text>
              <Text
                style={[
                  styles.value,
                  { marginBottom: 15, fontSize: 11, fontWeight: "bold" },
                ]}
              >
                {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
              </Text>
            </View>
            <View>
              <Text style={styles.label}>Payment Due</Text>
              <Text
                style={[
                  styles.value,
                  {
                    fontSize: 11,
                    fontWeight: "bold",
                    color: colors.cherryBlossom,
                  },
                ]}
              >
                {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
              </Text>
            </View>
          </View>
        </View>

        {/* --- 3. ITEMS TABLE --- */}
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colDesc]}>Description</Text>
            <Text style={[styles.headerText, styles.colQty]}>Qty</Text>
            <Text style={[styles.headerText, styles.colRate]}>Rate</Text>
            <Text style={[styles.headerText, styles.colAmount]}>Amount</Text>
          </View>

          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.value, styles.colDesc]}>
                {item.description}
              </Text>
              <Text style={[styles.value, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.value, styles.colRate]}>
                {formatCurrency(item.rate)}
              </Text>
              <Text style={[styles.value, styles.colAmount]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* --- 4. TOTALS --- */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.label}>Subtotal</Text>
              <Text style={styles.value}>
                {formatCurrency(invoice.subtotal)}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.label}>Tax ({invoice.taxRate}%)</Text>
              <Text style={styles.value}>
                {formatCurrency(invoice.taxAmount)}
              </Text>
            </View>

            {/* Grand Total Row with Soft Blush Background and Pink Text */}
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>TOTAL DUE</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(invoice.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* --- 5. NOTES/TERMS --- */}
        {(invoice.notes || invoice.terms) && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>PAYMENT NOTES</Text>
            <Text style={styles.notesText}>{invoice.terms}</Text>
            <Text style={[styles.notesText, { marginTop: 5 }]}>
              {invoice.notes}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
