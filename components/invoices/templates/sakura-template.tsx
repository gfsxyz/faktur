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

// Sakura Template - Japanese-inspired with soft colors
const styles = StyleSheet.create({
  page: {
    padding: 45,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#fdf8f6",
  },
  decorativeTop: {
    height: 3,
    backgroundColor: "#fca5a5",
    marginBottom: 25,
  },
  header: {
    marginBottom: 35,
    padding: 20,
    backgroundColor: "#fff1f2",
    borderLeftWidth: 4,
    borderLeftColor: "#fca5a5",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    color: "#be123c",
    fontWeight: "bold",
  },
  logo: {
    width: 60,
    height: 60,
  },
  companySection: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#881337",
  },
  companyDetails: {
    fontSize: 9,
    color: "#9f1239",
    lineHeight: 1.5,
  },
  invoiceInfo: {
    alignItems: "flex-end",
  },
  invoiceNumber: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#be123c",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: "#fda4af",
    borderRadius: 12,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#881337",
  },
  detailsRow: {
    flexDirection: "row",
    marginTop: 25,
    marginBottom: 25,
    gap: 15,
  },
  detailCard: {
    flex: 1,
    padding: 15,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fecdd3",
    borderRadius: 8,
  },
  detailCardTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#be123c",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#fecdd3",
  },
  detailLabel: {
    fontSize: 8,
    color: "#9f1239",
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 10,
    color: "#4c0519",
    marginBottom: 8,
  },
  tableSection: {
    marginTop: 15,
    marginBottom: 25,
  },
  tableTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#881337",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#ffe4e6",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#fda4af",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#fecdd3",
    backgroundColor: "#ffffff",
  },
  tableRowAlt: {
    backgroundColor: "#fff7f8",
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
    color: "#9f1239",
    textTransform: "uppercase",
  },
  tableText: {
    fontSize: 10,
    color: "#4c0519",
  },
  totalsSection: {
    marginTop: 20,
    marginLeft: "52%",
    padding: 15,
    backgroundColor: "#fff1f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 10,
    color: "#9f1239",
    marginRight: 40,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "right",
    color: "#4c0519",
  },
  grandTotal: {
    borderTopWidth: 2,
    borderTopColor: "#fca5a5",
    paddingTop: 10,
    marginTop: 8,
    backgroundColor: "#ffe4e6",
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: -10,
    borderRadius: 6,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#be123c",
  },
  grandTotalValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#be123c",
  },
  notesSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#ffffff",
    borderLeftWidth: 3,
    borderLeftColor: "#fca5a5",
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#881337",
  },
  notesText: {
    fontSize: 9,
    color: "#9f1239",
    lineHeight: 1.6,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 45,
    right: 45,
    textAlign: "center",
    color: "#fda4af",
    fontSize: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#fecdd3",
  },
  decorativeBottom: {
    position: "absolute",
    bottom: 20,
    left: 45,
    right: 45,
    height: 2,
    backgroundColor: "#fca5a5",
  },
});

export function SakuraTemplate({ invoice }: { invoice: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Decorative Top */}
        <View style={styles.decorativeTop} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Invoice</Text>
            {invoice.businessProfile?.logo && (
              <Image src={invoice.businessProfile.logo} style={styles.logo} />
            )}
          </View>

          <View style={styles.companySection}>
            <View style={styles.companyInfo}>
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

            <View style={styles.invoiceInfo}>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{invoice.status}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Details Cards */}
        <View style={styles.detailsRow}>
          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Invoice Details</Text>
            <Text style={styles.detailLabel}>Issue Date</Text>
            <Text style={styles.detailValue}>
              {format(new Date(invoice.issueDate), "MMMM dd, yyyy")}
            </Text>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>
              {format(new Date(invoice.dueDate), "MMMM dd, yyyy")}
            </Text>
          </View>

          <View style={styles.detailCard}>
            <Text style={styles.detailCardTitle}>Bill To</Text>
            {invoice.client && (
              <>
                <Text style={styles.detailLabel}>Client Name</Text>
                <Text style={styles.detailValue}>{invoice.client.name}</Text>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{invoice.client.email}</Text>
                {invoice.client.company && (
                  <>
                    <Text style={styles.detailLabel}>Company</Text>
                    <Text style={styles.detailValue}>{invoice.client.company}</Text>
                  </>
                )}
              </>
            )}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.tableSection}>
          <Text style={styles.tableTitle}>Items</Text>
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
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowAlt : {}
              ]}
            >
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

        {/* Notes and Terms */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {invoice.terms && (
          <View style={[styles.notesSection, { marginTop: 12 }]}>
            <Text style={styles.notesTitle}>Terms & Conditions</Text>
            <Text style={styles.notesText}>{invoice.terms}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {format(new Date(), "MMMM dd, yyyy")}
        </Text>

        {/* Decorative Bottom */}
        <View style={styles.decorativeBottom} />
      </Page>
    </Document>
  );
}
