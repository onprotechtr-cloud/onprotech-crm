import {
  AccountType,
  AppointmentStatus,
  AttendanceStatus,
  EmployeeStatus,
  ExpenseStatus,
  InvoiceStatus,
  InvoiceType,
  LeaveStatus,
  LeaveType,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
  QuoteStatus,
  SalaryPeriod,
  ServiceStatus,
  ServiceType,
  SubscriptionStatus,
  SubscriptionType,
  TicketPriority,
  TicketStatus,
  TransactionType,
  UserRole,
  WorkPlanPriority,
  WorkPlanStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean up in dependency order
  await prisma.ticketMessage.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.workPlan.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.companySettings.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.cashAccount.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.subscriptionPayment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.stockTransfer.deleteMany();
  await prisma.warehouseStock.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.servicePart.deleteMany();
  await prisma.serviceOrder.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  const [admin, satis, muhasebe, teknisyen] = await Promise.all([
    prisma.user.create({ data: { name: "Onur Ertekin", email: "admin@onprotech.com", password: await hash("admin123"), role: UserRole.ADMIN, phone: "+90 555 100 2026" } }),
    prisma.user.create({ data: { name: "Selin Kara", email: "satis@onprotech.com", password: await hash("satis123"), role: UserRole.SATIS, phone: "+90 535 200 3040" } }),
    prisma.user.create({ data: { name: "Baris Demir", email: "muhasebe@onprotech.com", password: await hash("muhasebe123"), role: UserRole.MUHASEBE, phone: "+90 542 300 5060" } }),
    prisma.user.create({ data: { name: "Kemal Ozkan", email: "teknisyen@onprotech.com", password: await hash("teknis123"), role: UserRole.TEKNISYEN, phone: "+90 530 400 7080" } }),
  ]);

  const customerData = [
    ["Ahmet Kaya", "Kaya Insaat", "ahmet@kayainsaat.com", "Istanbul"],
    ["Zeynep Demir", "Demir Yapi", "zeynep@demiryapi.com", "Ankara"],
    ["Mehmet Arslan", "Arslan Enerji", "mehmet@arslanenerji.com", "Izmir"],
    ["Elif Sahin", "Sahin Mimarlik", "elif@sahinmimarlik.com", "Bursa"],
    ["Can Yildiz", "Yildiz Teknoloji", "can@yildizteknoloji.com", "Antalya"],
    ["Ece Aksoy", "Aksoy Otomasyon", "ece@aksoyoto.com", "Konya"],
    ["Burak Cetin", "Cetin Endustri", "burak@cetinendustri.com", "Kocaeli"],
    ["Merve Aydin", "Aydin Tasarim", "merve@aydintas.com", "Eskisehir"],
    ["Selim Koc", "Koc Mekanik", "selim@kocmekanik.com", "Adana"],
    ["Derya Ozturk", "Ozturk Proje", "derya@ozturkproje.com", "Samsun"],
  ] as const;

  const customers = await Promise.all(
    customerData.map(([name, company, email, city], i) =>
      prisma.customer.create({
        data: { name, company, email, city, phone: `+90 530 000 10${i}`, address: `${city} OSB No:${i + 1}`, notes: "Ornek kayit" },
      }),
    ),
  );

  const productDefs = [
    ["IP Kamera 4MP", "CAM-4MP-001", "Kamera", "adet", 2850, "TRY", 45, 10],
    ["IP Kamera 8MP", "CAM-8MP-002", "Kamera", "adet", 280, "USD", 30, 8],
    ["NVR 8 Kanal", "NVR-8CH-003", "Kayit Cihazi", "adet", 3500, "TRY", 20, 5],
    ["NVR 16 Kanal", "NVR-16CH-004", "Kayit Cihazi", "adet", 380, "USD", 3, 5],
    ["Sabit Disk 4TB", "HDD-4TB-005", "Aksesuar", "adet", 1800, "TRY", 2, 10],
    ["PoE Switch 8 Port", "SW-POE8-006", "Ag", "adet", 1250, "TRY", 35, 8],
    ["Montaj Kiti", "KIT-MNT-007", "Aksesuar", "adet", 450, "TRY", 80, 20],
    ["Koaksiyel Kablo 100m", "CBL-COX-008", "Kablo", "top", 380, "TRY", 60, 15],
    ["Cat6 Kablo 305m", "CBL-CAT6-009", "Kablo", "kutu", 650, "TRY", 25, 10],
    ["Alarm Paneli", "ALM-PNL-010", "Alarm", "adet", 2200, "TRY", 18, 5],
    ["Hareket Sensoru", "SEN-MOT-011", "Alarm", "adet", 320, "TRY", 90, 20],
    ["Kurulum Hizmeti", "SVC-INST-012", "Hizmet", "paket", 1500, "TRY", 999, 1],
    ["Lisans - VMS Pro", "LIC-VMS-013", "Yazilim", "adet", 150, "USD", 50, 5],
    ["Sunucu Donanim", "SRV-HW-014", "Donanim", "adet", 1200, "USD", 10, 2],
  ] as const;

  const products = await Promise.all(
    productDefs.map(([name, code, category, unit, unitPrice, currency, stockQuantity, minStockLevel]) =>
      prisma.product.create({ data: { name, code, category, unit, unitPrice, currency, stockQuantity, minStockLevel } }),
    ),
  );

  // Quotes
  const quoteDefs = [
    { ci: 0, userId: admin.id, status: QuoteStatus.ACCEPTED, base: 12500, currency: "TRY" },
    { ci: 1, userId: satis.id, status: QuoteStatus.SENT, base: 18200, currency: "TRY" },
    { ci: 2, userId: admin.id, status: QuoteStatus.DRAFT, base: 8750, currency: "TRY" },
    { ci: 3, userId: satis.id, status: QuoteStatus.REJECTED, base: 22000, currency: "TRY" },
    { ci: 4, userId: admin.id, status: QuoteStatus.SENT, base: 15300, currency: "TRY" },
    { ci: 5, userId: satis.id, status: QuoteStatus.DRAFT, base: 4200, currency: "USD" },
  ];

  for (let i = 0; i < quoteDefs.length; i++) {
    const { ci, userId, status, base, currency } = quoteDefs[i];
    const taxAmount = base * 0.2;
    const discount = i % 2 === 0 ? (currency === "USD" ? 100 : 500) : 0;
    await prisma.quote.create({
      data: {
        quoteNumber: `ONP-2026-${String(i + 1).padStart(3, "0")}`,
        customerId: customers[ci].id,
        userId,
        date: new Date(2026, 3, i + 1),
        validUntil: new Date(2026, 3, i + 30),
        status,
        currency,
        subtotal: base,
        taxRate: 20,
        taxAmount,
        discount,
        total: base + taxAmount - discount,
        notes: "Montaj ve devreye alma dahildir.",
        items: {
          create: i === 5
            ? [
                { productId: products[1].id, productName: products[1].name, description: "IP Kamera 8MP - Dis mekan", quantity: 8, unit: products[1].unit, unitPrice: products[1].unitPrice, currency, total: 8 * products[1].unitPrice, order: 1 },
                { productId: products[3].id, productName: products[3].name, description: "NVR 16 Kanal - Kayit unitesi", quantity: 1, unit: products[3].unit, unitPrice: products[3].unitPrice, currency, total: products[3].unitPrice, order: 2 },
                { productId: products[12].id, productName: products[12].name, description: "VMS Pro Lisans x5", quantity: 5, unit: products[12].unit, unitPrice: products[12].unitPrice, currency, total: 5 * products[12].unitPrice, order: 3 },
              ]
            : [
                { productId: products[0].id, productName: products[0].name, description: "Dis mekan", quantity: 4, unit: products[0].unit, unitPrice: products[0].unitPrice, currency, total: 4 * products[0].unitPrice, order: 1 },
                { productId: products[2].id, productName: products[2].name, description: "Kayit unitesi", quantity: 1, unit: products[2].unit, unitPrice: products[2].unitPrice, currency, total: products[2].unitPrice, order: 2 },
                { productId: products[11].id, productName: products[11].name, description: "Kurulum + egitim", quantity: 1, unit: products[11].unit, unitPrice: products[11].unitPrice, currency, total: products[11].unitPrice, order: 3 },
              ],
        },
      },
    });
  }

  // Appointments
  type AS = AppointmentStatus;
  const apptDefs: Array<[string, number, string, number, string, string, AS]> = [
    ["Kesif Toplantisi", 0, admin.id, 0, "09:00", "10:00", AppointmentStatus.PLANNED],
    ["Teklif Sunumu", 1, satis.id, 0, "11:00", "12:00", AppointmentStatus.PLANNED],
    ["Saha Ziyareti", 2, admin.id, 1, "14:00", "15:30", AppointmentStatus.COMPLETED],
    ["Bakim Planlama", 3, satis.id, 2, "16:00", "17:00", AppointmentStatus.CANCELLED],
    ["Demo Kurulumu", 4, admin.id, 0, "10:30", "11:30", AppointmentStatus.PLANNED],
    ["Revizyon Gorusmesi", 5, satis.id, 1, "13:00", "14:00", AppointmentStatus.COMPLETED],
    ["Teslimat Hazirligi", 6, admin.id, 2, "15:00", "16:00", AppointmentStatus.PLANNED],
    ["Sozlesme Imzasi", 7, admin.id, 0, "17:00", "18:00", AppointmentStatus.PLANNED],
  ];

  await Promise.all(
    apptDefs.map(([title, ci, userId, dayOffset, startTime, endTime, status]) =>
      prisma.appointment.create({
        data: {
          title,
          customerId: customers[ci].id,
          userId,
          date: new Date(2026, 3, 23 + dayOffset),
          startTime,
          endTime,
          location: `${customers[ci].city} Ofisi`,
          status,
          notes: "Ornek randevu",
          color: status === AppointmentStatus.COMPLETED ? "#16a34a" : status === AppointmentStatus.CANCELLED ? "#dc2626" : "#f97316",
        },
      }),
    ),
  );

  // Warehouses
  const [merkezDepo, arac1Depo, arac2Depo] = await Promise.all([
    prisma.warehouse.create({
      data: {
        name: "Merkez Depo",
        type: "MERKEZ",
        description: "Ana depo - tum urun kategorileri",
        address: "Istanbul OSB, No:1",
        responsible: "Onur Ertekin",
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Arac 1 Depo",
        type: "ARAC",
        description: "Teknisyen Kemal - arac deposu",
        address: "Sahil garaj",
        responsible: "Kemal Ozkan",
      },
    }),
    prisma.warehouse.create({
      data: {
        name: "Arac 2 Depo",
        type: "ARAC",
        description: "Ikinci arac - yedek malzeme",
        responsible: "Onur Ertekin",
      },
    }),
  ]);

  // Warehouse stocks - distribute products across warehouses
  const stockDefs: Array<[string, string, number]> = [
    [merkezDepo.id, products[0].id, 30],  // IP Kamera 4MP
    [merkezDepo.id, products[1].id, 20],  // IP Kamera 8MP
    [merkezDepo.id, products[2].id, 15],  // NVR 8 Kanal
    [merkezDepo.id, products[3].id, 3],   // NVR 16 Kanal
    [merkezDepo.id, products[4].id, 2],   // Sabit Disk 4TB
    [merkezDepo.id, products[5].id, 25],  // PoE Switch
    [merkezDepo.id, products[6].id, 50],  // Montaj Kiti
    [merkezDepo.id, products[7].id, 40],  // Kablo
    [merkezDepo.id, products[8].id, 20],  // Cat6
    [merkezDepo.id, products[9].id, 12],  // Alarm
    [merkezDepo.id, products[10].id, 60], // Hareket Sensoru
    [merkezDepo.id, products[12].id, 50], // Lisans VMS Pro (USD)
    [merkezDepo.id, products[13].id, 10], // Sunucu Donanim (USD)
    [arac1Depo.id, products[0].id, 10],   // IP Kamera 4MP
    [arac1Depo.id, products[2].id, 4],    // NVR 8 Kanal
    [arac1Depo.id, products[6].id, 20],   // Montaj Kiti
    [arac1Depo.id, products[7].id, 15],   // Kablo
    [arac1Depo.id, products[10].id, 20],  // Hareket Sensoru
    [arac2Depo.id, products[0].id, 5],    // IP Kamera 4MP
    [arac2Depo.id, products[6].id, 10],   // Montaj Kiti
    [arac2Depo.id, products[8].id, 5],    // Cat6
  ];

  await Promise.all(
    stockDefs.map(([warehouseId, productId, quantity]) =>
      prisma.warehouseStock.create({
        data: { warehouseId, productId, quantity },
      }),
    ),
  );

  // Service Orders
  const serviceOrders = await Promise.all([
    prisma.serviceOrder.create({
      data: {
        orderNumber: "SRV-2026-001",
        customerId: customers[0].id,
        assignedToId: teknisyen.id,
        type: ServiceType.KURULUM,
        status: ServiceStatus.BASLADIM,
        priority: "YUKSEK",
        title: "Kaya Insaat - IP Kamera Kurulumu",
        description: "10 adet IP kamera ve 1 adet NVR kurulumu yapilacak.",
        scheduledDate: new Date(2026, 3, 24),
        scheduledTime: "09:00",
        location: "Istanbul Kaya Insaat Merkez Ofis",
        customerNotes: "Ofis mesai saatlerinde musait.",
      },
    }),
    prisma.serviceOrder.create({
      data: {
        orderNumber: "SRV-2026-002",
        customerId: customers[1].id,
        assignedToId: teknisyen.id,
        type: ServiceType.BAKIM,
        status: ServiceStatus.ATANDI,
        priority: "NORMAL",
        title: "Demir Yapi - Yillik Bakim",
        description: "Mevcut kamera sisteminin yillik bakimi ve temizligi.",
        scheduledDate: new Date(2026, 3, 25),
        scheduledTime: "10:00",
        location: "Ankara Demir Yapi Fabrikasi",
      },
    }),
    prisma.serviceOrder.create({
      data: {
        orderNumber: "SRV-2026-003",
        customerId: customers[2].id,
        type: ServiceType.ARIZA,
        status: ServiceStatus.BEKLEMEDE,
        priority: "ACIL",
        title: "Arslan Enerji - Kamera Arizasi",
        description: "3 numarali kamera goruntu vermiyor. Acil mudahale gerekiyor.",
        scheduledDate: new Date(2026, 3, 23),
        location: "Izmir Arslan Enerji Tesisi",
        customerNotes: "Guvenlik gerekceyle kamera kesinlikle calismali.",
      },
    }),
    prisma.serviceOrder.create({
      data: {
        orderNumber: "SRV-2026-004",
        customerId: customers[3].id,
        assignedToId: admin.id,
        type: ServiceType.KONTROL,
        status: ServiceStatus.TAMAMLANDI,
        priority: "NORMAL",
        title: "Sahin Mimarlik - Sistem Kontrolu",
        description: "Kurulum sonrasi devreye alma ve sistem kontrolu.",
        scheduledDate: new Date(2026, 3, 20),
        scheduledTime: "14:00",
        completedDate: new Date(2026, 3, 20),
        location: "Bursa Sahin Mimarlik",
        technicianNotes: "Tum sistemler calisiyor. Test edildi.",
      },
    }),
    prisma.serviceOrder.create({
      data: {
        orderNumber: "SRV-2026-005",
        customerId: customers[4].id,
        type: ServiceType.REVIZYON,
        status: ServiceStatus.BEKLEMEDE,
        priority: "DUSUK",
        title: "Yildiz Teknoloji - Kablo Revizyonu",
        description: "Mevcut kablo altyapisinin revize edilmesi.",
        scheduledDate: new Date(2026, 4, 5),
        location: "Antalya Yildiz Teknoloji",
      },
    }),
  ]);

  // Service Parts (for completed order)
  await prisma.servicePart.createMany({
    data: [
      { serviceOrderId: serviceOrders[3].id, productId: products[0].id, quantity: 2 },
      { serviceOrderId: serviceOrders[3].id, productId: products[6].id, quantity: 5 },
    ],
  });

  // Stock Transfers
  await Promise.all([
    prisma.stockTransfer.create({
      data: {
        transferNumber: "TRN-2026-001",
        fromWarehouseId: merkezDepo.id,
        toWarehouseId: arac1Depo.id,
        productId: products[0].id,
        quantity: 5,
        status: "TAMAMLANDI",
        notes: "Kurulum icin arac deposuna transfer",
        createdById: admin.id,
      },
    }),
    prisma.stockTransfer.create({
      data: {
        transferNumber: "TRN-2026-002",
        fromWarehouseId: merkezDepo.id,
        toWarehouseId: arac2Depo.id,
        productId: products[6].id,
        quantity: 10,
        status: "TAMAMLANDI",
        notes: "Montaj malzemesi transferi",
        createdById: admin.id,
      },
    }),
    prisma.stockTransfer.create({
      data: {
        transferNumber: "TRN-2026-003",
        fromWarehouseId: arac1Depo.id,
        toWarehouseId: merkezDepo.id,
        productId: products[2].id,
        quantity: 2,
        status: "TAMAMLANDI",
        notes: "Kullanilmayan ekipman iadesi",
        createdById: teknisyen.id,
      },
    }),
  ]);

  console.log("Seed tamamlandi.");
  console.log("admin@onprotech.com / admin123");
  console.log("satis@onprotech.com / satis123");
  console.log("muhasebe@onprotech.com / muhasebe123");
  console.log("teknisyen@onprotech.com / teknis123");

  // === FINANCIAL SEED DATA ===

  // Expense Categories
  const [catYakit, catYemek, catUlasim, catOfis, catDiger] = await Promise.all([
    prisma.expenseCategory.create({ data: { name: "Yakıt", description: "Araç yakıt giderleri" } }),
    prisma.expenseCategory.create({ data: { name: "Yemek", description: "Yemek ve ikram giderleri" } }),
    prisma.expenseCategory.create({ data: { name: "Ulaşım", description: "Toplu taşıma, taksi vb." } }),
    prisma.expenseCategory.create({ data: { name: "Ofis", description: "Ofis malzemeleri ve kırtasiye" } }),
    prisma.expenseCategory.create({ data: { name: "Diğer", description: "Çeşitli giderler" } }),
  ]);

  // Cash Accounts
  const [kasaAccount, bankaAccount] = await Promise.all([
    prisma.cashAccount.create({
      data: { name: "Ana Kasa", type: AccountType.KASA, currency: "TRY", balance: 25000, isActive: true },
    }),
    prisma.cashAccount.create({
      data: { name: "İş Bankası", type: AccountType.BANKA, bankName: "İş Bankası", accountNumber: "0123456789", iban: "TR123456789012345678901234", currency: "TRY", balance: 150000, isActive: true },
    }),
  ]);

  // Invoices (5 sample)
  const invoiceDefs = [
    { ci: 0, status: InvoiceStatus.ODENDI, daysAgo: 30, dueDays: 15, paidPct: 1.0 },
    { ci: 1, status: InvoiceStatus.GONDERILDI, daysAgo: 10, dueDays: 30, paidPct: 0 },
    { ci: 2, status: InvoiceStatus.TASLAK, daysAgo: 2, dueDays: 30, paidPct: 0 },
    { ci: 3, status: InvoiceStatus.GECIKTI, daysAgo: 45, dueDays: -15, paidPct: 0 },
    { ci: 4, status: InvoiceStatus.ODENDI, daysAgo: 20, dueDays: 10, paidPct: 1.0 },
  ];

  const now = new Date(2026, 3, 23);
  const invoices = await Promise.all(
    invoiceDefs.map(async ({ ci, status, daysAgo, dueDays, paidPct }, idx) => {
      const base = [18500, 22000, 9800, 31500, 14200][idx];
      const taxAmount = base * 0.2;
      const total = base + taxAmount;
      const paidAmount = Math.round(total * paidPct * 100) / 100;
      const date = new Date(now.getTime() - daysAgo * 86400000);
      const dueDate = new Date(date.getTime() + (dueDays + daysAgo) * 86400000);
      return prisma.invoice.create({
        data: {
          invoiceNumber: `FTR-2026-${String(idx + 1).padStart(3, "0")}`,
          customerId: customers[ci].id,
          userId: admin.id,
          type: InvoiceType.SATIS,
          date,
          dueDate,
          status,
          currency: "TRY",
          subtotal: base,
          taxRate: 20,
          taxAmount,
          discount: 0,
          total,
          paidAmount,
          remainingAmount: Math.round((total - paidAmount) * 100) / 100,
          notes: "Ödeme 30 gün içinde yapılmalıdır.",
          items: {
            create: [
              { productName: products[0].name, description: "Kamera sistemi", quantity: 4, unit: "adet", unitPrice: base / 4 / 1.2, taxRate: 20, total: base / 1.2, order: 1 },
              { productName: products[11].name, description: "Kurulum hizmeti", quantity: 1, unit: "paket", unitPrice: base * 0.2 / 1.2, taxRate: 20, total: base * 0.2 / 1.2, order: 2 },
            ],
          },
        },
      });
    }),
  );

  // Subscriptions (5 sample: 3 monthly, 2 yearly)
  const subscriptionDefs = [
    { ci: 5, planName: "VMS Pro Lisans", type: SubscriptionType.AYLIK, amount: 500, status: SubscriptionStatus.AKTIF, startDaysAgo: 60 },
    { ci: 6, planName: "Uzaktan İzleme", type: SubscriptionType.AYLIK, amount: 350, status: SubscriptionStatus.AKTIF, startDaysAgo: 30 },
    { ci: 7, planName: "Destek Paketi", type: SubscriptionType.AYLIK, amount: 750, status: SubscriptionStatus.PASIF, startDaysAgo: 90 },
    { ci: 8, planName: "Bakım Kontratı", type: SubscriptionType.YILLIK, amount: 8400, status: SubscriptionStatus.AKTIF, startDaysAgo: 15 },
    { ci: 9, planName: "Kamera Kiralama", type: SubscriptionType.YILLIK, amount: 12000, status: SubscriptionStatus.AKTIF, startDaysAgo: 180 },
  ];

  const subs = await Promise.all(
    subscriptionDefs.map(({ ci, planName, type, amount, status, startDaysAgo }) => {
      const startDate = new Date(now.getTime() - startDaysAgo * 86400000);
      const monthsToAdd = type === SubscriptionType.YILLIK ? 12 : 1;
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + (type === SubscriptionType.YILLIK ? 12 : 1));
      const nextBillingDate = new Date(startDate);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + monthsToAdd);
      return prisma.subscription.create({
        data: {
          customerId: customers[ci].id,
          planName,
          type,
          amount,
          currency: "TRY",
          startDate,
          endDate,
          nextBillingDate,
          status,
          autoRenew: true,
          notes: "Otomatik yenileme aktif.",
        },
      });
    }),
  );

  // Subscription payments
  await Promise.all([
    prisma.subscriptionPayment.create({ data: { subscriptionId: subs[0].id, amount: 500, currency: "TRY", paymentDate: new Date(2026, 2, 23), status: PaymentStatus.ODENDI, method: PaymentMethod.HAVALE } }),
    prisma.subscriptionPayment.create({ data: { subscriptionId: subs[0].id, amount: 500, currency: "TRY", paymentDate: new Date(2026, 3, 1), status: PaymentStatus.ODENDI, method: PaymentMethod.HAVALE } }),
    prisma.subscriptionPayment.create({ data: { subscriptionId: subs[1].id, amount: 350, currency: "TRY", paymentDate: new Date(2026, 3, 1), status: PaymentStatus.ODENDI, method: PaymentMethod.KREDI_KARTI } }),
    prisma.subscriptionPayment.create({ data: { subscriptionId: subs[3].id, amount: 8400, currency: "TRY", paymentDate: new Date(2026, 3, 8), status: PaymentStatus.ODENDI, method: PaymentMethod.HAVALE, notes: "Yıllık tek seferlik ödeme" } }),
  ]);

  // Transactions
  await Promise.all([
    prisma.transaction.create({ data: { accountId: bankaAccount.id, type: TransactionType.GELIR, category: "Fatura Tahsilatı", description: `Fatura FTR-2026-001 ödemesi`, amount: invoices[0].total, currency: "TRY", date: new Date(2026, 3, 10), relatedInvoiceId: invoices[0].id, createdBy: admin.id } }),
    prisma.transaction.create({ data: { accountId: bankaAccount.id, type: TransactionType.GELIR, category: "Abonelik Tahsilatı", description: "VMS Pro Lisans - Nisan", amount: 500, currency: "TRY", date: new Date(2026, 3, 1), relatedSubscriptionId: subs[0].id, createdBy: admin.id } }),
    prisma.transaction.create({ data: { accountId: kasaAccount.id, type: TransactionType.GIDER, category: "Ofis Giderleri", description: "Kırtasiye alımı", amount: 850, currency: "TRY", date: new Date(2026, 3, 15), createdBy: muhasebe.id } }),
    prisma.transaction.create({ data: { accountId: kasaAccount.id, type: TransactionType.GIDER, category: "Yakıt", description: "Araç yakıt gideri", amount: 1200, currency: "TRY", date: new Date(2026, 3, 18), createdBy: muhasebe.id } }),
    prisma.transaction.create({ data: { accountId: bankaAccount.id, type: TransactionType.GELIR, category: "Fatura Tahsilatı", description: `Fatura FTR-2026-005 ödemesi`, amount: invoices[4].total, currency: "TRY", date: new Date(2026, 3, 20), relatedInvoiceId: invoices[4].id, createdBy: admin.id } }),
  ]);

  // Expenses (5 sample)
  const expenseDefs = [
    { cat: catYakit, title: "Nisan Yakıt", amount: 2400, status: ExpenseStatus.ONAYLANDI, method: PaymentMethod.NAKIT },
    { cat: catYemek, title: "Müşteri Yemeği", amount: 850, status: ExpenseStatus.ONAYLANDI, method: PaymentMethod.KREDI_KARTI },
    { cat: catUlasim, title: "İstanbul Uçak Bileti", amount: 1250, status: ExpenseStatus.BEKLEMEDE, method: PaymentMethod.KREDI_KARTI },
    { cat: catOfis, title: "Yazıcı Kartuşu", amount: 420, status: ExpenseStatus.ONAYLANDI, method: PaymentMethod.NAKIT },
    { cat: catDiger, title: "Temizlik Malzemesi", amount: 380, status: ExpenseStatus.REDDEDILDI, method: PaymentMethod.NAKIT },
  ];

  await Promise.all(
    expenseDefs.map(({ cat, title, amount, status, method }, idx) =>
      prisma.expense.create({
        data: {
          categoryId: cat.id,
          title,
          amount,
          currency: "TRY",
          date: new Date(2026, 3, 5 + idx * 3),
          paymentMethod: method,
          status,
          createdById: satis.id,
          approvedById: status !== ExpenseStatus.BEKLEMEDE ? admin.id : null,
        },
      }),
    ),
  );

  console.log("Finans seed tamamlandi: faturalar, abonelikler, kasa/banka, masraflar.");

  // ─── Phase 3B: Employees ────────────────────────────────────────────────────
  const employeeDefs = [
    { firstName: "Onur", lastName: "Ertekin", email: "onur.ertekin@onprotech.com", phone: "+90 555 100 2026", department: "Yönetim", position: "Genel Müdür", salary: 45000, salaryPeriod: SalaryPeriod.AYLIK, status: EmployeeStatus.AKTIF, startDate: new Date(2020, 0, 1), userId: admin.id },
    { firstName: "Selin", lastName: "Kara", email: "selin.kara@onprotech.com", phone: "+90 535 200 3040", department: "Satış", position: "Satış Uzmanı", salary: 28000, salaryPeriod: SalaryPeriod.AYLIK, status: EmployeeStatus.AKTIF, startDate: new Date(2021, 5, 15), userId: satis.id },
    { firstName: "Baris", lastName: "Demir", email: "baris.demir@onprotech.com", phone: "+90 542 300 5060", department: "Muhasebe", position: "Muhasebe Uzmanı", salary: 30000, salaryPeriod: SalaryPeriod.AYLIK, status: EmployeeStatus.AKTIF, startDate: new Date(2021, 8, 1), userId: muhasebe.id },
    { firstName: "Kemal", lastName: "Ozkan", email: "kemal.ozkan@onprotech.com", phone: "+90 530 400 7080", department: "Teknik", position: "Kıdemli Teknisyen", salary: 25000, salaryPeriod: SalaryPeriod.AYLIK, status: EmployeeStatus.AKTIF, startDate: new Date(2022, 2, 10), userId: teknisyen.id },
    { firstName: "Ayse", lastName: "Yildiz", email: "ayse.yildiz@onprotech.com", phone: "+90 532 500 9090", department: "Teknik", position: "Teknisyen", salary: 20000, salaryPeriod: SalaryPeriod.AYLIK, status: EmployeeStatus.IZINLI, startDate: new Date(2023, 6, 20), userId: null },
  ];

  const employees = await Promise.all(
    employeeDefs.map(({ userId, ...rest }) =>
      prisma.employee.create({
        data: {
          ...rest,
          address: "İstanbul, Türkiye",
          emergencyContact: "Aile",
          emergencyPhone: "+90 500 000 0000",
          userId: userId ?? undefined,
        },
      }),
    ),
  );

  // ─── Leave Requests ──────────────────────────────────────────────────────────
  await Promise.all([
    prisma.leaveRequest.create({
      data: {
        employeeId: employees[1].id,
        type: LeaveType.YILLIK_IZIN,
        startDate: new Date(2026, 4, 5),
        endDate: new Date(2026, 4, 9),
        totalDays: 5,
        status: LeaveStatus.ONAYLANDI,
        reason: "Yıllık tatil",
        approvedById: admin.id,
      },
    }),
    prisma.leaveRequest.create({
      data: {
        employeeId: employees[3].id,
        type: LeaveType.HASTALIK,
        startDate: new Date(2026, 3, 20),
        endDate: new Date(2026, 3, 22),
        totalDays: 3,
        status: LeaveStatus.ONAYLANDI,
        reason: "Hastalık raporu",
        approvedById: admin.id,
      },
    }),
    prisma.leaveRequest.create({
      data: {
        employeeId: employees[4].id,
        type: LeaveType.YILLIK_IZIN,
        startDate: new Date(2026, 3, 23),
        endDate: new Date(2026, 4, 2),
        totalDays: 8,
        status: LeaveStatus.BEKLEMEDE,
        reason: "Uzun dönem yıllık izin",
      },
    }),
  ]);

  // ─── Attendance ──────────────────────────────────────────────────────────────
  const attendanceDates = [18, 19, 20, 21, 22].map((d) => new Date(2026, 3, d));
  for (const emp of [employees[0], employees[1], employees[2]]) {
    for (const date of attendanceDates) {
      await prisma.attendance.create({
        data: {
          employeeId: emp.id,
          date,
          checkIn: "09:00",
          checkOut: "18:00",
          totalHours: 9,
          status: AttendanceStatus.NORMAL,
        },
      });
    }
  }

  // ─── Work Plans ──────────────────────────────────────────────────────────────
  const workPlanDefs = [
    { title: "Kaya İnşaat Kamera Kurulumu Planla", priority: WorkPlanPriority.YUKSEK, status: WorkPlanStatus.YAPILACAK, category: "Kurulum", assignedToId: teknisyen.id, customerId: customers[0].id, dueDate: new Date(2026, 4, 5) },
    { title: "Q2 Teklif Takibi", priority: WorkPlanPriority.NORMAL, status: WorkPlanStatus.DEVAM_EDIYOR, category: "Satış", assignedToId: satis.id, customerId: null, dueDate: new Date(2026, 3, 30) },
    { title: "Demir Yapı Yıllık Bakım Organizasyonu", priority: WorkPlanPriority.NORMAL, status: WorkPlanStatus.DEVAM_EDIYOR, category: "Bakım", assignedToId: teknisyen.id, customerId: customers[1].id, dueDate: new Date(2026, 4, 10) },
    { title: "Muhasebe Raporları Hazırla", priority: WorkPlanPriority.DUSUK, status: WorkPlanStatus.TAMAMLANDI, category: "Muhasebe", assignedToId: muhasebe.id, customerId: null, dueDate: new Date(2026, 3, 20) },
    { title: "Yeni Ürün Kataloğu Güncelle", priority: WorkPlanPriority.DUSUK, status: WorkPlanStatus.YAPILACAK, category: "Pazarlama", assignedToId: satis.id, customerId: null, dueDate: new Date(2026, 4, 15) },
    { title: "Acil: Arslan Enerji Arıza Gider", priority: WorkPlanPriority.ACIL, status: WorkPlanStatus.DEVAM_EDIYOR, category: "Servis", assignedToId: teknisyen.id, customerId: customers[2].id, dueDate: new Date(2026, 3, 24) },
    { title: "Sistem Güvenlik Denetimi", priority: WorkPlanPriority.YUKSEK, status: WorkPlanStatus.YAPILACAK, category: "BT", assignedToId: admin.id, customerId: null, dueDate: new Date(2026, 4, 20) },
    { title: "Persone Eğitim Programı Planla", priority: WorkPlanPriority.NORMAL, status: WorkPlanStatus.TAMAMLANDI, category: "İK", assignedToId: admin.id, customerId: null, dueDate: new Date(2026, 3, 15) },
    { title: "Stok Sayımı Gerçekleştir", priority: WorkPlanPriority.NORMAL, status: WorkPlanStatus.YAPILACAK, category: "Depo", assignedToId: muhasebe.id, customerId: null, dueDate: new Date(2026, 4, 1) },
    { title: "Müşteri Memnuniyeti Anketi", priority: WorkPlanPriority.DUSUK, status: WorkPlanStatus.IPTAL, category: "Satış", assignedToId: satis.id, customerId: null, dueDate: new Date(2026, 3, 25) },
  ];

  await Promise.all(
    workPlanDefs.map((def) =>
      prisma.workPlan.create({
        data: {
          ...def,
          createdById: admin.id,
          completedDate: def.status === WorkPlanStatus.TAMAMLANDI ? new Date(2026, 3, 20) : null,
        },
      }),
    ),
  );

  // ─── Company Settings ────────────────────────────────────────────────────────
  await prisma.companySettings.create({
    data: {
      companyName: "Onprotech Bilişim Teknolojileri",
      email: "info@onprotech.com",
      phone: "+90 555 100 2026",
      address: "Atatürk Cd. No:42 Kat:3",
      city: "İstanbul",
      taxNumber: "1234567890",
      taxOffice: "Bağcılar Vergi Dairesi",
      website: "https://onprotech.com",
      defaultCurrency: "TRY",
      defaultTaxRate: 20,
      invoicePrefix: "INV",
      quotePrefix: "ONP",
      servicePrefix: "SRV",
    },
  });

  // ─── Support Tickets ─────────────────────────────────────────────────────────
  const ticketDefs = [
    { customerId: customers[0].id, subject: "Kamera görüntüsü bulanık", status: TicketStatus.COZULDU, priority: TicketPriority.NORMAL, category: "Teknik Destek", assignedToId: teknisyen.id },
    { customerId: customers[1].id, subject: "NVR kayıt sorunu", status: TicketStatus.ACIK, priority: TicketPriority.YUKSEK, category: "Teknik Destek", assignedToId: null },
    { customerId: customers[2].id, subject: "Acil: Kamera sistemi çöktü", status: TicketStatus.YANIT_BEKLENIYOR, priority: TicketPriority.ACIL, category: "Arıza", assignedToId: teknisyen.id },
    { customerId: customers[3].id, subject: "Yeni kamera kurulum talebi", status: TicketStatus.KAPANDI, priority: TicketPriority.DUSUK, category: "Kurulum", assignedToId: satis.id },
    { customerId: customers[4].id, subject: "Lisans yenileme bilgisi", status: TicketStatus.ACIK, priority: TicketPriority.NORMAL, category: "Lisans", assignedToId: null },
  ];

  for (let i = 0; i < ticketDefs.length; i++) {
    const def = ticketDefs[i];
    const year = 2026;
    const ticketNumber = `TKT-${year}-${String(i + 1).padStart(3, "0")}`;

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        customerId: def.customerId,
        createdById: satis.id,
        assignedToId: def.assignedToId ?? null,
        subject: def.subject,
        status: def.status,
        priority: def.priority,
        category: def.category,
      },
    });

    await prisma.ticketMessage.createMany({
      data: [
        {
          ticketId: ticket.id,
          senderId: satis.id,
          message: `Merhaba, ${def.subject} konusunda yardım almak istiyoruz.`,
          isInternal: false,
        },
        {
          ticketId: ticket.id,
          senderId: def.assignedToId ?? admin.id,
          message: "Talebiniz alındı. En kısa sürede ilgilenilecektir.",
          isInternal: false,
        },
        ...(def.status === TicketStatus.COZULDU || def.status === TicketStatus.KAPANDI
          ? [{
              ticketId: ticket.id,
              senderId: def.assignedToId ?? admin.id,
              message: "Sorun çözüldü. Gerekli işlemler yapıldı.",
              isInternal: false,
            }]
          : []),
      ],
    });
  }

  console.log("Phase 3B seed tamamlandi: personel, is-plani, ayarlar, destek.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
