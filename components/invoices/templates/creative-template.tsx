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

// Creative Template - Bold, colorful, and highly aesthetic design
const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // Decorative gradient header
  gradientHeader: {
    height: 200,
    backgroundColor: "#6366f1",
    position: "relative",
    padding: 30,
    paddingTop: 40,
  },
  // Geometric accent shapes
  accentCircle: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#818cf8",
    top: -150,
    right: -150,
    opacity: 0.3,
  },
  accentCircleSmall: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#c7d2fe",
    bottom: -40,
    left: 50,
    opacity: 0.4,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    position: "relative",
    zIndex: 10,
  },
  logoSection: {
    flex: 1,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 15,
    borderRadius: 35,
    backgroundColor: "#ffffff",
    padding: 5,
  },
  companyName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#ffffff",
  },
  companyDetails: {
    fontSize: 9,
    color: "#e0e7ff",
    lineHeight: 1.6,
  },
  titleSection: {
    alignItems: "flex-end",
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
    letterSpacing: 2,
  },
  invoiceNumber: {
    fontSize: 14,
    color: "#e0e7ff",
    fontWeight: "bold",
    backgroundColor: "#4f46e5",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    alignSelf: "flex-end",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#fff",
    letterSpacing: 1,
  },
  // Content section with offset for visual interest
  contentSection: {
    padding: 40,
    marginTop: -30,
    position: "relative",
    zIndex: 20,
  },
  infoCards: {
    flexDirection: "row",
    marginBottom: 35,
    gap: 15,
  },
  infoCard: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#6366f1",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  infoCardAlt: {
    borderLeftColor: "#ec4899",
  },
  infoCardTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoCardTitleAlt: {
    color: "#ec4899",
  },
  infoLabel: {
    fontSize: 8,
    color: "#94a3b8",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 11,
    color: "#0f172a",
    fontWeight: "bold",
    marginBottom: 10,
  },
  // Decorative section divider
  sectionDivider: {
    height: 3,
    backgroundColor: "#6366f1",
    marginVertical: 25,
    borderRadius: 2,
    width: "30%",
  },
  table: {
    marginTop: 20,
    marginBottom: 30,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#0f172a",
    flexDirection: "row",
    alignItems: "center",
  },
  tableTitleAccent: {
    width: 6,
    height: 20,
    backgroundColor: "#ec4899",
    marginRight: 10,
    borderRadius: 3,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 3,
    borderBottomColor: "#6366f1",
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 4,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc",
    borderLeftColor: "#c7d2fe",
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
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tableText: {
    fontSize: 10,
    color: "#1e293b",
  },
  tableTextBold: {
    fontWeight: "bold",
  },
  totalsSection: {
    marginTop: 25,
    marginLeft: "50%",
    padding: 20,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  totalLabel: {
    fontSize: 10,
    color: "#64748b",
    marginRight: 40,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "right",
    color: "#1e293b",
  },
  grandTotal: {
    marginTop: 10,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 15,
    backgroundColor: "#6366f1",
    borderRadius: 8,
    marginHorizontal: -10,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  grandTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  // Creative notes section with gradient
  notesWrapper: {
    marginTop: 35,
  },
  notesCard: {
    padding: 18,
    backgroundColor: "#fef9c3",
    borderRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#eab308",
    marginBottom: 12,
  },
  notesCardAlt: {
    backgroundColor: "#ddd6fe",
    borderLeftColor: "#8b5cf6",
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#713f12",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  notesTitleAlt: {
    color: "#5b21b6",
  },
  notesText: {
    fontSize: 9,
    color: "#854d0e",
    lineHeight: 1.6,
  },
  notesTextAlt: {
    color: "#6b21a8",
  },
  // Decorative footer
  footerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: "#6366f1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  footerCircle: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#818cf8",
    opacity: 0.3,
    left: -20,
    bottom: -20,
  },
  footerText: {
    color: "#e0e7ff",
    fontSize: 8,
    textAlign: "center",
    zIndex: 10,
  },
});

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return { backgroundColor: "#10b981" };
    case "sent":
      return { backgroundColor: "#3b82f6" };
    case "overdue":
      return { backgroundColor: "#ef4444" };
    case "cancelled":
      return { backgroundColor: "#6b7280" };
    default:
      return { backgroundColor: "#8b5cf6" };
  }
};

export function CreativeTemplate({ invoice }: { invoice: InvoiceData }) {
  const statusColors = getStatusColor(invoice.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Gradient Header with Geometric Shapes */}
        <View style={styles.gradientHeader}>
          {/* Decorative circles */}
          <View style={styles.accentCircle} />
          <View style={styles.accentCircleSmall} />

          <View style={styles.headerContent}>
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
                    </Text>
                  )}
                </>
              )}
            </View>

            <View style={styles.titleSection}>
              <Text style={styles.title}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
              <View style={[styles.statusBadge, statusColors]}>
                <Text style={styles.statusText}>{invoice.status}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Info Cards with Color Accents */}
          <View style={styles.infoCards}>
            <View style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Invoice Details</Text>
              <Text style={styles.infoLabel}>Issue Date</Text>
              <Text style={styles.infoValue}>
                {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
              </Text>
              <Text style={styles.infoLabel}>Due Date</Text>
              <Text style={styles.infoValue}>
                {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
              </Text>
            </View>

            <View style={[styles.infoCard, styles.infoCardAlt]}>
              <Text style={[styles.infoCardTitle, styles.infoCardTitleAlt]}>
                Bill To
              </Text>
              {invoice.client && (
                <>
                  <Text style={styles.infoLabel}>Client Name</Text>
                  <Text style={styles.infoValue}>{invoice.client.name}</Text>
                  <Text style={styles.infoLabel}>Email Address</Text>
                  <Text style={styles.infoValue}>{invoice.client.email}</Text>
                  {invoice.client.company && (
                    <>
                      <Text style={styles.infoLabel}>Company</Text>
                      <Text style={styles.infoValue}>{invoice.client.company}</Text>
                    </>
                  )}
                </>
              )}
            </View>
          </View>

          {/* Decorative Divider */}
          <View style={styles.sectionDivider} />

          {/* Items Table with Creative Styling */}
          <View style={styles.table}>
            <View style={styles.tableTitle}>
              <View style={styles.tableTitleAccent} />
              <Text>Items & Services</Text>
            </View>

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
                <Text style={[styles.tableText, styles.tableTextBold, styles.tableColAmount]}>
                  ${item.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Totals with Gradient Accent */}
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
                <Text style={[styles.totalValue, { color: "#10b981" }]}>
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
              <Text style={styles.grandTotalLabel}>Total Amount</Text>
              <Text style={styles.grandTotalValue}>
                ${invoice.total.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Creative Notes Section */}
          {(invoice.notes || invoice.terms) && (
            <View style={styles.notesWrapper}>
              {invoice.notes && (
                <View style={styles.notesCard}>
                  <Text style={styles.notesTitle}>Notes</Text>
                  <Text style={styles.notesText}>{invoice.notes}</Text>
                </View>
              )}

              {invoice.terms && (
                <View style={[styles.notesCard, styles.notesCardAlt]}>
                  <Text style={[styles.notesTitle, styles.notesTitleAlt]}>
                    Terms & Conditions
                  </Text>
                  <Text style={[styles.notesText, styles.notesTextAlt]}>
                    {invoice.terms}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Decorative Footer Bar */}
        <View style={styles.footerBar}>
          <View style={styles.footerCircle} />
          <Text style={styles.footerText}>
            Generated on {format(new Date(), "MMMM dd, yyyy 'at' hh:mm a")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
