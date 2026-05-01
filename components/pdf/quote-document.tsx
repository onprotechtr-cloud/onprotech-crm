import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { Quote, QuoteItem, Customer, User } from "@prisma/client";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    color: "#10213D",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  section: {
    marginTop: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 12,
    color: "#52627A",
    marginTop: 4,
  },
  label: {
    fontSize: 10,
    color: "#52627A",
    marginBottom: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#10213D",
    color: "#FFFFFF",
    padding: 8,
    marginTop: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    padding: 8,
  },
  totalBox: {
    marginLeft: "auto",
    width: 220,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
  },
});

function formatCurrency(value: number, currency: string = "TRY") {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  }
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
  }).format(value);
}

type QuoteDocumentProps = {
  quote: Quote & {
    customer: Customer;
    user: User;
    items: QuoteItem[];
  };
};

export function QuoteDocument({ quote }: QuoteDocumentProps) {
  const cur = quote.currency ?? "TRY";
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.row}>
          <View>
            <Text style={styles.title}>ONPROTECH</Text>
            <Text style={styles.subtitle}>Profesyonel CRM Teklif Dokümani</Text>
          </View>
          <View>
            <Text style={styles.label}>Teklif No</Text>
            <Text>{quote.quoteNumber}</Text>
            <Text style={[styles.label, { marginTop: 8 }]}>Tarih</Text>
            <Text>{new Date(quote.date).toLocaleDateString("tr-TR")}</Text>
            <Text style={[styles.label, { marginTop: 8 }]}>Para Birimi</Text>
            <Text>{cur}</Text>
          </View>
        </View>

        <View style={[styles.section, styles.row]}>
          <View style={{ width: "48%" }}>
            <Text style={styles.label}>Müsteri Bilgileri</Text>
            <Text>{quote.customer.name}</Text>
            <Text>{quote.customer.company ?? "-"}</Text>
            <Text>{quote.customer.email ?? "-"}</Text>
            <Text>{quote.customer.phone ?? "-"}</Text>
            <Text>{quote.customer.address ?? "-"}</Text>
          </View>
          <View style={{ width: "48%" }}>
            <Text style={styles.label}>Hazirlayan</Text>
            <Text>{quote.user.name}</Text>
            <Text>{quote.user.email}</Text>
            <Text style={[styles.label, { marginTop: 10 }]}>Gecerlilik</Text>
            <Text>{new Date(quote.validUntil).toLocaleDateString("tr-TR")}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.tableHeader}>
            <Text style={{ width: "28%" }}>Urun</Text>
            <Text style={{ width: "28%" }}>Aciklama</Text>
            <Text style={{ width: "12%" }}>Miktar</Text>
            <Text style={{ width: "12%" }}>Birim</Text>
            <Text style={{ width: "20%", textAlign: "right" }}>Tutar</Text>
          </View>
          {quote.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={{ width: "28%" }}>{item.productName}</Text>
              <Text style={{ width: "28%" }}>{item.description ?? "-"}</Text>
              <Text style={{ width: "12%" }}>{item.quantity}</Text>
              <Text style={{ width: "12%" }}>{item.unit}</Text>
              <Text style={{ width: "20%", textAlign: "right" }}>{formatCurrency(item.total, cur)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalBox}>
          <View style={styles.row}>
            <Text>Ara Toplam</Text>
            <Text>{formatCurrency(quote.subtotal, cur)}</Text>
          </View>
          <View style={[styles.row, { marginTop: 6 }]}>
            <Text>KDV (%{quote.taxRate})</Text>
            <Text>{formatCurrency(quote.taxAmount, cur)}</Text>
          </View>
          <View style={[styles.row, { marginTop: 6 }]}>
            <Text>Indirim</Text>
            <Text>{formatCurrency(quote.discount, cur)}</Text>
          </View>
          <View style={[styles.row, { marginTop: 10, fontSize: 13 }]}>
            <Text>Genel Toplam</Text>
            <Text>{formatCurrency(quote.total, cur)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notlar</Text>
          <Text>{quote.notes ?? "Ek not bulunmuyor."}</Text>
        </View>
      </Page>
    </Document>
  );
}
