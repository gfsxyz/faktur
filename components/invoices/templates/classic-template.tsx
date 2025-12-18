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

// DESIGN TOKENS
const colors = {
  primary: "#111827", // Dark Slate / Near Black
  secondary: "#6b7280", // Cool Gray
  accent: "#f3f4f6", // Very Light Gray for backgrounds
  border: "#e5e7eb",
  white: "#ffffff",
  success: "#059669", // Emerald Green
  danger: "#dc2626", // Red
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: colors.white,
    color: colors.primary,
  },

  // HEADER SECTION
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
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
    borderRadius: 4,
  },
  mainTitle: {
    fontSize: 32,
    fontFamily: "Times-Roman", // Classic Serif feel
    textTransform: "uppercase",
    letterSpacing: 2,
    color: colors.primary,
  },
  subTitle: {
    fontSize: 10,
    color: colors.secondary,
    marginTop: 4,
    letterSpacing: 1,
  },

  // METADATA GRID (Dates & Numbers)
  metaContainer: {
    flexDirection: "row",
    backgroundColor: colors.accent,
    padding: 15,
    borderRadius: 4,
    marginBottom: 30,
    justifyContent: "space-between",
  },
  metaGroup: {
    flexDirection: "column",
  },
  metaLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    color: colors.secondary,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.primary,
  },

  // ADDRESS BLOCK
  addresses: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 30,
  },
  addressGroup: {
    width: "45%",
  },
  addressTitle: {
    fontSize: 11,
    fontFamily: "Times-Roman",
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.primary,
  },
  addressText: {
    fontSize: 10,
    color: colors.secondary,
    lineHeight: 1.5,
  },

  // TABLE
  tableContainer: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary, // Dark header for visual weight
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 2,
  },
  tableHeaderCell: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  // Column Widths
  col1: { flex: 3 }, // Description
  col2: { flex: 1, textAlign: "center" }, // Qty
  col3: { flex: 1.5, textAlign: "right" }, // Rate
  col4: { flex: 1.5, textAlign: "right" }, // Amount

  tableText: {
    fontSize: 10,
    color: colors.primary,
    wordBreak: "keep-all",
  },
  tableTextSmall: {
    fontSize: 9,
    color: colors.secondary,
  },

  // TOTALS SECTION
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  totalsBox: {
    width: "40%",
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
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    paddingTop: 10,
    marginTop: 10,
    alignItems: "center", // Align items to center vertically in row
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: "Times-Roman",
    fontWeight: "bold",
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Times-Roman",
  },

  // FOOTER & EXTRAS
  notes: {
    marginTop: 40,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  noteLabel: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  noteText: {
    fontSize: 9,
    color: colors.secondary,
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
  },

  // BADGE
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 2,
    marginTop: 5,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: colors.white,
  },
});

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return { backgroundColor: colors.success };
    case "overdue":
      return { backgroundColor: colors.danger };
    default:
      return { backgroundColor: colors.secondary };
  }
};

export function ClassicTemplate({ invoice }: { invoice: InvoiceData }) {
  const statusStyle = getStatusStyle(invoice.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {invoice.businessProfile?.logo && (
              <Image src={invoice.businessProfile.logo} style={styles.logo} />
            )}
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>
              {invoice.businessProfile?.companyName}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.mainTitle}>INVOICE</Text>
            <View style={[styles.badge, statusStyle]}>
              <Text style={styles.badgeText}>{invoice.status}</Text>
            </View>
          </View>
        </View>

        {/* --- METADATA STRIP --- */}
        <View style={styles.metaContainer}>
          <View style={styles.metaGroup}>
            <Text style={styles.metaLabel}>Invoice No</Text>
            <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
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
          <View style={styles.metaGroup}>
            <Text style={styles.metaLabel}>Total Due</Text>
            <Text style={styles.metaValue}>
              {formatCurrency(invoice.total)}
            </Text>
          </View>
        </View>

        {/* --- ADDRESSES --- */}
        <View style={styles.addresses}>
          <View style={styles.addressGroup}>
            <Text style={styles.addressTitle}>Bill From</Text>
            {invoice.businessProfile && (
              <View>
                <Text style={styles.addressText}>
                  {invoice.businessProfile.address}
                </Text>
                <Text style={styles.addressText}>
                  {invoice.businessProfile.city
                    ? invoice.businessProfile.city + ","
                    : ""}{" "}
                  {invoice.businessProfile.state}{" "}
                  {invoice.businessProfile.postalCode}
                </Text>
                <Text style={styles.addressText}>
                  {invoice.businessProfile.country}
                </Text>
                <Text style={[styles.addressText, { marginTop: 4 }]}>
                  {invoice.businessProfile.email}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.addressGroup}>
            <Text style={styles.addressTitle}>Bill To</Text>
            {invoice.client && (
              <View>
                <Text style={[styles.addressText, { fontWeight: "bold" }]}>
                  {invoice.client.name}
                </Text>
                {invoice.client.company && (
                  <Text style={styles.addressText}>
                    {invoice.client.company}
                  </Text>
                )}
                {/* Assuming client has address fields in your type, otherwise omit */}
                <Text style={styles.addressText}>{invoice.client.email}</Text>
                <Text style={styles.addressText}>{invoice.client.phone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* --- ITEMS TABLE --- */}
        <View style={styles.tableContainer}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.col1]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderCell, styles.col2]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.col3]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, styles.col4]}>Amount</Text>
          </View>

          {/* Rows */}
          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.col1}>
                <Text style={styles.tableText}>{item.description}</Text>
              </View>
              <Text style={[styles.tableText, styles.col2]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableText, styles.col3]}>
                {formatCurrency(item.rate)}
              </Text>
              <Text
                style={[styles.tableText, styles.col4, { fontWeight: "bold" }]}
              >
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* --- TOTALS --- */}
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
                <Text style={[styles.totalValue, { color: colors.success }]}>
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
              <Text style={styles.grandTotalLabel}>TOTAL</Text>
              <Text style={styles.grandTotalValue}>
                {formatCurrency(invoice.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* --- NOTES & FOOTER --- */}
        <View style={styles.notes}>
          {(invoice.notes || invoice.terms) && (
            <View>
              <Text style={styles.noteLabel}>Notes & Terms</Text>
              <Text style={styles.noteText}>{invoice.notes}</Text>
              <Text style={[styles.noteText, { marginTop: 4 }]}>
                {invoice.terms}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.footer}>
          {invoice.businessProfile?.companyName} • Generated on{" "}
          {format(new Date(), "MM/dd/yyyy")}
        </Text>
      </Page>
    </Document>
  );
}
