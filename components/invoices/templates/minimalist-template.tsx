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

// Minimalist Template - Clean and minimal design
const styles = StyleSheet.create({
  page: {
    padding: 60,
    fontSize: 9,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 50,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "normal",
    color: "#000",
  },
  logo: {
    width: 50,
    height: 50,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 6,
  },
  companyDetails: {
    fontSize: 8,
    color: "#666",
    lineHeight: 1.5,
  },
  invoiceInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  invoiceNumber: {
    fontSize: 11,
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 8,
    color: "#666",
    marginBottom: 2,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  clientSection: {
    marginTop: 40,
    marginBottom: 40,
  },
  clientLabel: {
    fontSize: 8,
    color: "#999",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  clientName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  clientDetails: {
    fontSize: 9,
    color: "#666",
    lineHeight: 1.4,
  },
  table: {
    marginTop: 30,
    marginBottom: 40,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
  },
  tableColDescription: {
    flex: 3,
  },
  tableColQuantity: {
    flex: 0.8,
    textAlign: "right",
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
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "#000",
  },
  tableText: {
    fontSize: 9,
    color: "#333",
  },
  totalsSection: {
    marginLeft: "60%",
    marginTop: 20,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 9,
    color: "#666",
    marginRight: 40,
  },
  totalValue: {
    fontSize: 9,
    textAlign: "right",
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 10,
    marginTop: 8,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: "bold",
  },
  grandTotalValue: {
    fontSize: 11,
    fontWeight: "bold",
  },
  notesSection: {
    marginTop: 50,
  },
  notesTitle: {
    fontSize: 9,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 8,
    color: "#666",
    lineHeight: 1.6,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 60,
    right: 60,
    textAlign: "center",
    color: "#bbb",
    fontSize: 7,
    paddingTop: 15,
    borderTopWidth: 0.5,
    borderTopColor: "#e0e0e0",
  },
});

export function MinimalistTemplate({ invoice }: { invoice: InvoiceData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Invoice</Text>
            {invoice.businessProfile?.logo && (
              <Image src={invoice.businessProfile.logo} style={styles.logo} />
            )}
          </View>

          <View style={styles.metaRow}>
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
                    </Text>
                  )}
                </>
              )}
            </View>

            <View style={styles.invoiceInfo}>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
              <Text style={styles.invoiceDate}>
                Issued: {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
              </Text>
              <Text style={styles.invoiceDate}>
                Due: {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
              </Text>
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>{invoice.status}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Client Section */}
        <View style={styles.clientSection}>
          <Text style={styles.clientLabel}>Billed To</Text>
          {invoice.client && (
            <>
              <Text style={styles.clientName}>{invoice.client.name}</Text>
              <Text style={styles.clientDetails}>{invoice.client.email}</Text>
              {invoice.client.phone && (
                <Text style={styles.clientDetails}>{invoice.client.phone}</Text>
              )}
              {invoice.client.company && (
                <Text style={styles.clientDetails}>{invoice.client.company}</Text>
              )}
            </>
          )}
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
          <View style={[styles.notesSection, { marginTop: 20 }]}>
            <Text style={styles.notesTitle}>Terms</Text>
            <Text style={styles.notesText}>{invoice.terms}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          {format(new Date(), "MMMM dd, yyyy")}
        </Text>
      </Page>
    </Document>
  );
}
