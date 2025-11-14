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

// Corporate Template - Professional and structured design
const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  headerBar: {
    backgroundColor: "#1e3a8a",
    padding: 30,
    marginBottom: 0,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    width: 70,
    height: 70,
  },
  companyInfo: {
    flex: 1,
    paddingLeft: 20,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 9,
    color: "#bfdbfe",
    lineHeight: 1.4,
  },
  titleSection: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 12,
    color: "#93c5fd",
    fontWeight: "bold",
  },
  grayBar: {
    backgroundColor: "#f1f5f9",
    padding: 20,
    paddingHorizontal: 30,
    borderBottomWidth: 3,
    borderBottomColor: "#1e3a8a",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaBox: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "bold",
  },
  metaValue: {
    fontSize: 11,
    color: "#0f172a",
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#1e3a8a",
    alignSelf: "flex-start",
    marginTop: 5,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#ffffff",
    letterSpacing: 1,
  },
  contentSection: {
    padding: 30,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1e3a8a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 2,
    borderBottomColor: "#1e3a8a",
    paddingBottom: 5,
  },
  clientSection: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderLeftWidth: 3,
    borderLeftColor: "#1e3a8a",
  },
  clientLabel: {
    fontSize: 8,
    color: "#64748b",
    marginBottom: 3,
    textTransform: "uppercase",
  },
  clientValue: {
    fontSize: 10,
    color: "#0f172a",
    marginBottom: 6,
  },
  table: {
    marginTop: 20,
    marginBottom: 25,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e3a8a",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc",
  },
  tableColDescription: {
    flex: 3,
  },
  tableColQuantity: {
    flex: 1,
    textAlign: "center",
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
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableText: {
    fontSize: 10,
    color: "#334155",
  },
  summarySection: {
    marginTop: 20,
    borderTopWidth: 2,
    borderTopColor: "#cbd5e1",
    paddingTop: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLeft: {
    flex: 1,
  },
  summaryRight: {
    width: "40%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 15,
  },
  totalLabel: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "right",
    color: "#0f172a",
  },
  grandTotal: {
    backgroundColor: "#1e3a8a",
    paddingVertical: 12,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  notesBox: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#78350f",
    textTransform: "uppercase",
  },
  notesText: {
    fontSize: 9,
    color: "#92400e",
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0f172a",
    padding: 15,
    textAlign: "center",
  },
  footerText: {
    color: "#94a3b8",
    fontSize: 8,
  },
});

export function CorporateTemplate({ invoice }: { invoice: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerContent}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              {invoice.businessProfile?.logo && (
                <Image src={invoice.businessProfile.logo} style={styles.logo} />
              )}
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
            </View>
            <View style={styles.titleSection}>
              <Text style={styles.title}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
            </View>
          </View>
        </View>

        {/* Gray Bar with Meta Info */}
        <View style={styles.grayBar}>
          <View style={styles.metaRow}>
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Issue Date</Text>
              <Text style={styles.metaValue}>
                {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
              </Text>
            </View>
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Due Date</Text>
              <Text style={styles.metaValue}>
                {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
              </Text>
            </View>
            <View style={styles.metaBox}>
              <Text style={styles.metaLabel}>Status</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{invoice.status}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Client Information */}
          <Text style={styles.sectionTitle}>Bill To</Text>
          <View style={styles.clientSection}>
            {invoice.client && (
              <>
                <Text style={styles.clientLabel}>Client Name</Text>
                <Text style={styles.clientValue}>{invoice.client.name}</Text>
                <Text style={styles.clientLabel}>Email Address</Text>
                <Text style={styles.clientValue}>{invoice.client.email}</Text>
                {invoice.client.phone && (
                  <>
                    <Text style={styles.clientLabel}>Phone Number</Text>
                    <Text style={styles.clientValue}>{invoice.client.phone}</Text>
                  </>
                )}
                {invoice.client.company && (
                  <>
                    <Text style={styles.clientLabel}>Company</Text>
                    <Text style={styles.clientValue}>{invoice.client.company}</Text>
                  </>
                )}
              </>
            )}
          </View>

          {/* Items Table */}
          <Text style={styles.sectionTitle}>Invoice Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.tableColDescription]}>
                Description
              </Text>
              <Text style={[styles.tableHeaderText, styles.tableColQuantity]}>
                Quantity
              </Text>
              <Text style={[styles.tableHeaderText, styles.tableColRate]}>
                Unit Price
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

          {/* Summary */}
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryLeft}>
                {invoice.notes && (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesTitle}>Notes</Text>
                    <Text style={styles.notesText}>{invoice.notes}</Text>
                  </View>
                )}
                {invoice.terms && (
                  <View style={[styles.notesBox, { marginTop: 10, backgroundColor: "#eff6ff", borderColor: "#3b82f6" }]}>
                    <Text style={[styles.notesTitle, { color: "#1e3a8a" }]}>Terms</Text>
                    <Text style={[styles.notesText, { color: "#1e40af" }]}>{invoice.terms}</Text>
                  </View>
                )}
              </View>

              <View style={styles.summaryRight}>
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
                  <Text style={styles.grandTotalLabel}>Total Due</Text>
                  <Text style={styles.grandTotalValue}>
                    ${invoice.total.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated on {format(new Date(), "MMMM dd, yyyy 'at' hh:mm a")} | Thank you for your business
          </Text>
        </View>
      </Page>
    </Document>
  );
}
