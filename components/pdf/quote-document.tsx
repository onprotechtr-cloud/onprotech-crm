import { Document, Page, StyleSheet, Text, View, Image } from "@react-pdf/renderer";
import { Quote, QuoteItem, Customer, User } from "@prisma/client";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    color: "#000",
    fontFamily: "Courier",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#10213D",
    paddingBottom: 10,
    marginBottom: 15,
  },
  companyInfo: {
    width: "50%",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10213D",
    marginBottom: 5,
  },
  logo: {
    width: 150,
    height: 40,
    objectFit: "contain",
  },
  companyDetail: {
    fontSize: 8,
    color: "#333",
    marginBottom: 2,
  },
  dateSection: {
    width: "40%",
    alignItems: "flex-end",
  },
  dateRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  dateLabel: {
    width: 80,
    fontWeight: "bold",
  },
  dateValue: {
    width: 100,
  },
  customerSection: {
    marginBottom: 15,
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#10213D",
  },
  customerRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  customerLabel: {
    width: 80,
    fontWeight: "bold",
  },
  table: {
    marginTop: 10,
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#10213D",
    color: "#fff",
    padding: 6,
    fontWeight: "bold",
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    padding: 5,
    minHeight: 30,
  },
  tableRowAlternate: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    padding: 5,
    minHeight: 30,
    backgroundColor: "#f9f9f9",
  },
  colImage: {
    width: "12%",
    textAlign: "center",
  },
  colProduct: {
    width: "40%",
    paddingRight: 5,
  },
  colQty: {
    width: "10%",
    textAlign: "center",
  },
  colPrice: {
    width: "18%",
    textAlign: "right",
  },
  colTotal: {
    width: "20%",
    textAlign: "right",
  },
  totalsSection: {
    width: "50%",
    marginLeft: "auto",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#10213D",
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: {
    fontWeight: "bold",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#000",
    fontSize: 11,
    fontWeight: "bold",
  },
  notesSection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  noteTitle: {
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 10,
  },
  noteText: {
    fontSize: 8,
    marginBottom: 3,
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: "#10213D",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    textAlign: "center",
    color: "#666",
  },
});

function formatCurrency(value: number, currency: string = "TRY") {
  if (currency === "USD") {
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
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
  const currencySymbol = cur === "USD" ? "$" : "TL";
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Firma Bilgileri */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Image 
              style={styles.logo} 
              src="https://crm.onprotech.com.tr/onprotech-logo.png" 
            />
            <Text style={styles.companyDetail}>Halil Rıfat Paşa Mah. Perpa Tic. Merk.</Text>
            <Text style={styles.companyDetail}>A Blok Kat:5, No:458 Şişli/İSTANBUL</Text>
            <Text style={styles.companyDetail}>Tel: 0212 521 11 21 / 0532 392 82 72</Text>
            <Text style={styles.companyDetail}>E-mail: info@onprotech.com.tr</Text>
            <Text style={styles.companyDetail}>Web: www.onprotech.com.tr</Text>
          </View>
          <View style={styles.dateSection}>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Tarih:</Text>
              <Text style={styles.dateValue}>{formatDate(quote.date)}</Text>
            </View>
            <View style={styles.dateRow}>
              <Text style={styles.dateLabel}>Teklif No:</Text>
              <Text style={styles.dateValue}>{quote.quoteNumber}</Text>
            </View>
          </View>
        </View>

        {/* Müşteri Bilgileri */}
        <View style={styles.customerSection}>
          <Text style={styles.sectionTitle}>DİKKATİNE</Text>
          <View style={styles.customerRow}>
            <Text style={styles.customerLabel}>Firma:</Text>
            <Text>{quote.customer.company || quote.customer.name}</Text>
          </View>
          <View style={styles.customerRow}>
            <Text style={styles.customerLabel}>İlgili:</Text>
            <Text>{quote.customer.name}</Text>
          </View>
          <View style={styles.customerRow}>
            <Text style={styles.customerLabel}>Telefon:</Text>
            <Text>{quote.customer.phone || "-"}</Text>
          </View>
          <View style={styles.customerRow}>
            <Text style={styles.customerLabel}>E-mail:</Text>
            <Text>{quote.customer.email || "-"}</Text>
          </View>
        </View>

        {/* Ürün Tablosu */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colImage}>ÜRÜN GÖRSELİ</Text>
            <Text style={styles.colProduct}>MALZEME CİNSİ VE ÖZELLİKLERİ</Text>
            <Text style={styles.colQty}>MİKTAR</Text>
            <Text style={styles.colPrice}>FİYAT ({currencySymbol})</Text>
            <Text style={styles.colTotal}>TOPLAM ({currencySymbol})</Text>
          </View>
          
          {quote.items.map((item, index) => (
            <View key={item.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlternate}>
              <Text style={styles.colImage}>-</Text>
              <Text style={styles.colProduct}>{item.productName}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.unitPrice, cur)}</Text>
              <Text style={styles.colTotal}>{formatCurrency(item.total, cur)}</Text>
            </View>
          ))}
        </View>

        {/* Toplamlar */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOPLAM:</Text>
            <Text>{formatCurrency(quote.subtotal, cur)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>KDV %{quote.taxRate}:</Text>
            <Text>{formatCurrency(quote.taxAmount, cur)}</Text>
          </View>
          {quote.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>İNDİRİM:</Text>
              <Text>-{formatCurrency(quote.discount, cur)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text>GENEL TOPLAM:</Text>
            <Text>{formatCurrency(quote.total, cur)}</Text>
          </View>
          {cur === "USD" && (
            <Text style={{ fontSize: 7, marginTop: 5, fontStyle: "italic" }}>
              * Fatura kesildiği günki Merkez Bankası dolar satış kuru üzerinden hesaplanır.
            </Text>
          )}
        </View>

        {/* Notlar ve Şartlar */}
        <View style={styles.notesSection}>
          <Text style={styles.noteTitle}>TESLİMAT</Text>
          <Text style={styles.noteText}>
            Teslimat, kesin sipariş ve ön ödemeyi takiben, stok durumuna göre 1 (bir) hafta içerisinde yapılacaktır.
          </Text>
          
          <Text style={styles.noteTitle}>ÖDEME ŞEKLİ ve ZAMANI</Text>
          <Text style={styles.noteText}>
            Anlaşma sağlandığında fatura tutarının %50 peşin, %50 tutar fatura tarihinden itibaren 3 iş günü içerisinde ödemenin tamamı alınacaktır.
          </Text>
          
          <Text style={styles.noteTitle}>GARANTİ ve BAKIM</Text>
          <Text style={styles.noteText}>
            Teklifimize konu ürünler, teslim tarihinden itibaren, üretim hatalarına karşı 2 (iki) yıl süre ile üretici firmanın belirlediği şartlar dahilinde garanti kapsamındadır. Montajı yapılan ürünler 2 yıl, uygulanan işçilik firmamız tarafından 1 yıl garantilidir.
          </Text>
          
          {quote.notes && (
            <>
              <Text style={styles.noteTitle}>NOT</Text>
              <Text style={styles.noteText}>{quote.notes}</Text>
            </>
          )}
          
          <Text style={styles.noteTitle}>MONTAJ KURULUM ve MÜHENDİSLİK BEDELİ</Text>
          <Text style={styles.noteText}>
            Montaj kurulum ve mühendislik bedeli teklif kapsamında değerlendirilmelidir. Kullanıcıdan kaynaklı problemlerde servis ücreti alınacaktır.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ONPROTECH GÜVENLİK SİSTEMLERİ | info@onprotech.com.tr | www.onprotech.com.tr | Tel: 0212 521 11 21
          </Text>
        </View>
      </Page>
    </Document>
  );
}
