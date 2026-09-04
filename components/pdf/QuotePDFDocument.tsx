import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import path from "path";

Font.register({
  family: "NotoSans",
  fonts: [
    { src: path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf"), fontWeight: 400 },
    { src: path.join(process.cwd(), "public", "fonts", "NotoSans-Bold.ttf"), fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "NotoSans",
    fontSize: 9,
    padding: 40,
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#f97316",
  },
  companyBlock: { flex: 1 },
  companyName: {
    fontSize: 18,
    fontFamily: "NotoSans",
    fontWeight: 700,
    color: "#f97316",
    marginBottom: 3,
  },
  companyTagline: { fontSize: 8, color: "#6b7280", marginBottom: 6 },
  companyInfo: { fontSize: 8, color: "#6b7280", lineHeight: 1.5 },
  quoteInfoBlock: { alignItems: "flex-end" },
  quoteTitle: {
    fontSize: 14,
    fontFamily: "NotoSans",
    fontWeight: 700,
    color: "#1f2937",
    marginBottom: 4,
  },
  quoteNumber: {
    fontSize: 11,
    fontFamily: "NotoSans",
    fontWeight: 700,
    color: "#f97316",
    marginBottom: 8,
  },
  infoBadge: {
    fontSize: 7.5,
    color: "#6b7280",
    marginBottom: 2,
    textAlign: "right",
  },
  statusBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontFamily: "NotoSans",
    fontWeight: 700,
  },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "NotoSans",
    fontWeight: 700,
    color: "#374151",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  customerBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#f97316",
  },
  customerName: { fontSize: 10, fontFamily: "NotoSans",
    fontWeight: 700, color: "#1f2937", marginBottom: 3 },
  customerDetail: { fontSize: 8, color: "#6b7280", lineHeight: 1.5 },
  table: { marginTop: 4 },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 3,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontSize: 7.5,
    fontFamily: "NotoSans",
    fontWeight: 700,
    color: "#ffffff",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
  },
  tableRowAlt: { backgroundColor: "#f9fafb" },
  tableCell: { fontSize: 8, color: "#374151" },
  tableCellBold: { fontSize: 8, fontFamily: "NotoSans",
    fontWeight: 700, color: "#1f2937" },
  colNo: { width: "5%" },
  colProduct: { width: "32%" },
  colDesc: { width: "25%" },
  colQty: { width: "8%", textAlign: "right" },
  colUnit: { width: "8%" },
  colPrice: { width: "12%", textAlign: "right" },
  colTotal: { width: "10%", textAlign: "right" },
  totalsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  totalsBox: {
    width: 200,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: { fontSize: 8, color: "#6b7280" },
  totalValue: { fontSize: 8, color: "#374151" },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1.5,
    borderTopColor: "#f97316",
  },
  grandTotalLabel: { fontSize: 10, fontFamily: "NotoSans",
    fontWeight: 700, color: "#1f2937" },
  grandTotalValue: { fontSize: 10, fontFamily: "NotoSans",
    fontWeight: 700, color: "#f97316" },
  notes: {
    marginTop: 16,
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 4,
  },
  notesTitle: { fontSize: 8, fontFamily: "NotoSans",
    fontWeight: 700, color: "#374151", marginBottom: 4 },
  notesText: { fontSize: 8, color: "#6b7280", lineHeight: 1.5 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  footerText: { fontSize: 7, color: "#9ca3af" },
});

function formatCurrencyPDF(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDatePDF(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR").format(d);
}

const statusMap: Record<string, { label: string; bg: string; color: string }> = {
  DRAFT: { label: "TASLAK", bg: "#f3f4f6", color: "#6b7280" },
  SENT: { label: "GONDERİLDİ", bg: "#dbeafe", color: "#1d4ed8" },
  ACCEPTED: { label: "KABUL EDİLDİ", bg: "#dcfce7", color: "#15803d" },
  REJECTED: { label: "REDDEDİLDİ", bg: "#fee2e2", color: "#dc2626" },
};

interface QuoteData {
  quoteNumber: string;
  date: Date;
  validUntil: Date;
  status: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  notes: string | null;
  customer: {
    name: string;
    company: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
  };
  user: { name: string; email: string };
  items: {
    id: string;
    productName: string;
    description: string | null;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }[];
}

export default function QuotePDFDocument({ quote }: { quote: QuoteData }) {
  const status = statusMap[quote.status] ?? statusMap.DRAFT;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Başlık */}
        <View style={styles.header}>
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>ONPROTECH</Text>
            <Text style={styles.companyTagline}>Guvenlik Sistemleri</Text>
            <Text style={styles.companyInfo}>
              {"Teknik Destek: +90 212 555 0001\nEmail: info@onprotech.com\nwww.onprotech.com"}
            </Text>
          </View>
          <View style={styles.quoteInfoBlock}>
            <Text style={styles.quoteTitle}>SATIS TEKLİFİ</Text>
            <Text style={styles.quoteNumber}>{quote.quoteNumber}</Text>
            <Text style={styles.infoBadge}>Tarih: {formatDatePDF(quote.date)}</Text>
            <Text style={styles.infoBadge}>Gecerlilik: {formatDatePDF(quote.validUntil)}</Text>
            <Text style={styles.infoBadge}>Hazirlayan: {quote.user.name}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: status.bg, color: status.color },
              ]}
            >
              <Text>{status.label}</Text>
            </View>
          </View>
        </View>

        {/* Müşteri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Musteri Bilgileri</Text>
          <View style={styles.customerBox}>
            <Text style={styles.customerName}>{quote.customer.name}</Text>
            {quote.customer.company && (
              <Text style={styles.customerDetail}>{quote.customer.company}</Text>
            )}
            {quote.customer.phone && (
              <Text style={styles.customerDetail}>Tel: {quote.customer.phone}</Text>
            )}
            {quote.customer.email && (
              <Text style={styles.customerDetail}>E-posta: {quote.customer.email}</Text>
            )}
            {(quote.customer.address || quote.customer.city) && (
              <Text style={styles.customerDetail}>
                {[quote.customer.address, quote.customer.city].filter(Boolean).join(", ")}
              </Text>
            )}
          </View>
        </View>

        {/* Tablo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teklif Kalemleri</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colNo]}>#</Text>
              <Text style={[styles.tableHeaderText, styles.colProduct]}>Urun / Hizmet</Text>
              <Text style={[styles.tableHeaderText, styles.colDesc]}>Aciklama</Text>
              <Text style={[styles.tableHeaderText, styles.colQty]}>Miktar</Text>
              <Text style={[styles.tableHeaderText, styles.colUnit]}>Birim</Text>
              <Text style={[styles.tableHeaderText, styles.colPrice]}>Birim Fiyat</Text>
              <Text style={[styles.tableHeaderText, styles.colTotal]}>Toplam</Text>
            </View>
            {quote.items.map((item, idx) => (
              <View
                key={item.id}
                style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={[styles.tableCell, styles.colNo]}>{idx + 1}</Text>
                <Text style={[styles.tableCellBold, styles.colProduct]}>{item.productName}</Text>
                <Text style={[styles.tableCell, styles.colDesc]}>{item.description ?? ""}</Text>
                <Text style={[styles.tableCell, styles.colQty]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.colUnit]}>{item.unit}</Text>
                <Text style={[styles.tableCell, styles.colPrice]}>
                  {formatCurrencyPDF(item.unitPrice)}
                </Text>
                <Text style={[styles.tableCellBold, styles.colTotal]}>
                  {formatCurrencyPDF(item.total)}
                </Text>
              </View>
            ))}
          </View>

          {/* Toplamlar */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Ara Toplam</Text>
                <Text style={styles.totalValue}>{formatCurrencyPDF(quote.subtotal)}</Text>
              </View>
              {quote.discount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: "#dc2626" }]}>Indirim</Text>
                  <Text style={[styles.totalValue, { color: "#dc2626" }]}>
                    - {formatCurrencyPDF(quote.discount)}
                  </Text>
                </View>
              )}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>KDV (%{quote.taxRate})</Text>
                <Text style={styles.totalValue}>{formatCurrencyPDF(quote.taxAmount)}</Text>
              </View>
              <View style={styles.grandTotalRow}>
                <Text style={styles.grandTotalLabel}>GENEL TOPLAM</Text>
                <Text style={styles.grandTotalValue}>{formatCurrencyPDF(quote.total)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notlar */}
        {quote.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Notlar</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>ONPROTECH Guvenlik Sistemleri | www.onprotech.com</Text>
          <Text style={styles.footerText}>{quote.quoteNumber}</Text>
        </View>
      </Page>
    </Document>
  );
}
