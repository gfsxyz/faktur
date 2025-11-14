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

// Elegant Template - Sophisticated editorial design inspired by high-end magazines
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // Elegant header with subtle sophistication
  header: {
    marginBottom: 50,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  logoSection: {
    flex: 1,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  companyName: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 3,
  },
  companyDetails: {
    fontSize: 8,
    color: "#666666",
    lineHeight: 1.8,
    letterSpacing: 0.3,
  },
  titleSection: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 72,
    fontWeight: "normal",
    color: "#000000",
    marginBottom: 5,
    letterSpacing: -2,
  },
  invoiceNumber: {
    fontSize: 10,
    color: "#666666",
    letterSpacing: 2,
    marginTop: 5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 15,
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: "#000000",
  },
  statusText: {
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#000",
    letterSpacing: 2,
  },
  // Sophisticated info section
  metaSection: {
    flexDirection: "row",
    marginBottom: 60,
    paddingTop: 30,
  },
  metaColumn: {
    flex: 1,
  },
  metaColumnRight: {
    flex: 1,
    paddingLeft: 40,
  },
  metaTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  metaLabel: {
    fontSize: 7,
    color: "#999999",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  metaValue: {
    fontSize: 10,
    color: "#000000",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  // Editorial-style table
  table: {
    marginTop: 10,
    marginBottom: 50,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  tableColDescription: {
    flex: 3,
  },
  tableColQuantity: {
    flex: 0.8,
    textAlign: "center",
  },
  tableColRate: {
    flex: 1.2,
    textAlign: "right",
  },
  tableColAmount: {
    flex: 1.2,
    textAlign: "right",
  },
  tableHeaderText: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  tableText: {
    fontSize: 10,
    color: "#000000",
    letterSpacing: 0.2,
  },
  tableTextDescription: {
    fontSize: 10,
    color: "#000000",
    letterSpacing: 0.2,
    lineHeight: 1.4,
  },
  // Refined totals section
  totalsSection: {
    marginTop: 30,
    marginLeft: "60%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 9,
    color: "#666666",
    marginRight: 50,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 10,
    textAlign: "right",
    color: "#000000",
    letterSpacing: 0.3,
  },
  grandTotal: {
    borderTopWidth: 2,
    borderTopColor: "#000000",
    paddingTop: 15,
    marginTop: 12,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    letterSpacing: 0.5,
  },
  // Sophisticated notes section
  notesSection: {
    marginTop: 60,
    paddingTop: 20,
    borderTopWidth: 0.5,
    borderTopColor: "#cccccc",
  },
  notesBlock: {
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000000",
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  notesText: {
    fontSize: 9,
    color: "#333333",
    lineHeight: 1.8,
    letterSpacing: 0.2,
  },
  // Minimal elegant footer
  footer: {
    position: "absolute",
    bottom: 40,
    left: 50,
    right: 50,
    paddingTop: 15,
    borderTopWidth: 0.5,
    borderTopColor: "#cccccc",
  },
  footerText: {
    color: "#999999",
    fontSize: 7,
    textAlign: "center",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});

const getStatusColor = (status: string) => {
  // Sophisticated monochrome design
  return { backgroundColor: "transparent" };
};

export function ElegantTemplate({ invoice }: { invoice: InvoiceData }) {
  const statusColors = getStatusColor(invoice.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Elegant Editorial Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoSection}>
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
                      {invoice.businessProfile.state && `, ${invoice.businessProfile.state}`}
                    </Text>
                  )}
                </>
              )}
            </View>

            <View style={styles.titleSection}>
              <Text style={styles.title}>Invoice</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
              <View style={[styles.statusBadge, statusColors]}>
                <Text style={styles.statusText}>{invoice.status}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sophisticated Meta Information */}
        <View style={styles.metaSection}>
          <View style={styles.metaColumn}>
            <Text style={styles.metaTitle}>Invoice Details</Text>
            <Text style={styles.metaLabel}>Issue Date</Text>
            <Text style={styles.metaValue}>
              {format(new Date(invoice.issueDate), "MMMM dd, yyyy")}
            </Text>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>
              {format(new Date(invoice.dueDate), "MMMM dd, yyyy")}
            </Text>
          </View>

          <View style={styles.metaColumnRight}>
            <Text style={styles.metaTitle}>Billed To</Text>
            {invoice.client && (
              <>
                <Text style={styles.metaLabel}>Client</Text>
                <Text style={styles.metaValue}>{invoice.client.name}</Text>
                {invoice.client.company && (
                  <>
                    <Text style={styles.metaLabel}>Company</Text>
                    <Text style={styles.metaValue}>{invoice.client.company}</Text>
                  </>
                )}
                <Text style={styles.metaLabel}>Email</Text>
                <Text style={styles.metaValue}>{invoice.client.email}</Text>
                {invoice.client.phone && (
                  <>
                    <Text style={styles.metaLabel}>Phone</Text>
                    <Text style={styles.metaValue}>{invoice.client.phone}</Text>
                  </>
                )}
              </>
            )}
          </View>
        </View>

        {/* Editorial Table */}
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
              <Text style={[styles.tableTextDescription, styles.tableColDescription]}>
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

        {/* Refined Totals */}
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
              <Text style={styles.totalValue}>
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
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              ${invoice.total.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Sophisticated Notes */}
        {(invoice.notes || invoice.terms) && (
          <View style={styles.notesSection}>
            {invoice.notes && (
              <View style={styles.notesBlock}>
                <Text style={styles.notesTitle}>Notes</Text>
                <Text style={styles.notesText}>{invoice.notes}</Text>
              </View>
            )}

            {invoice.terms && (
              <View style={styles.notesBlock}>
                <Text style={styles.notesTitle}>Terms & Conditions</Text>
                <Text style={styles.notesText}>{invoice.terms}</Text>
              </View>
            )}
          </View>
        )}

        {/* Minimal Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {format(new Date(), "MMMM dd, yyyy")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
