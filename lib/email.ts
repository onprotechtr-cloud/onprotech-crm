import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'ONPROTECH CRM <onprotech@resend.dev>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: err };
  }
}

// Bildirim mail şablonları
export function createStockTransferEmail({
  productName,
  quantity,
  fromWarehouse,
  toWarehouse,
  transferNumber,
}: {
  productName: string;
  quantity: number;
  fromWarehouse: string;
  toWarehouse: string;
  transferNumber: string;
}) {
  return {
    subject: `Stok Transferi Tamamlandı - ${transferNumber}`,
    html: `
      <h2>Stok Transferi Bildirimi</h2>
      <p>Aşağıdaki stok transferi başarıyla tamamlandı:</p>
      <ul>
        <li><strong>Ürün:</strong> ${productName}</li>
        <li><strong>Miktar:</strong> ${quantity}</li>
        <li><strong>Kaynak Depo:</strong> ${fromWarehouse}</li>
        <li><strong>Hedef Depo:</strong> ${toWarehouse}</li>
        <li><strong>Transfer No:</strong> ${transferNumber}</li>
      </ul>
      <p>ONPROTECH CRM Sistemi</p>
    `,
  };
}

export function createNewCustomerEmail({
  customerName,
  customerEmail,
  customerPhone,
}: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}) {
  return {
    subject: `Yeni Müşteri Kaydı - ${customerName}`,
    html: `
      <h2>Yeni Müşteri Bildirimi</h2>
      <p>Sisteme yeni bir müşteri kaydedildi:</p>
      <ul>
        <li><strong>Ad Soyad:</strong> ${customerName}</li>
        <li><strong>E-posta:</strong> ${customerEmail}</li>
        <li><strong>Telefon:</strong> ${customerPhone}</li>
      </ul>
      <p>ONPROTECH CRM Sistemi</p>
    `,
  };
}

export function createNewQuoteEmail({
  quoteNumber,
  customerName,
  total,
  currency,
}: {
  quoteNumber: string;
  customerName: string;
  total: number;
  currency: string;
}) {
  return {
    subject: `Yeni Teklif Oluşturuldu - ${quoteNumber}`,
    html: `
      <h2>Yeni Teklif Bildirimi</h2>
      <p>Yeni bir teklif oluşturuldu:</p>
      <ul>
        <li><strong>Teklif No:</strong> ${quoteNumber}</li>
        <li><strong>Müşteri:</strong> ${customerName}</li>
        <li><strong>Tutar:</strong> ${total.toLocaleString('tr-TR')} ${currency}</li>
      </ul>
      <p>ONPROTECH CRM Sistemi</p>
    `,
  };
}

export function createNewInvoiceEmail({
  invoiceNumber,
  customerName,
  total,
  currency,
}: {
  invoiceNumber: string;
  customerName: string;
  total: number;
  currency: string;
}) {
  return {
    subject: `Yeni Fatura Oluşturuldu - ${invoiceNumber}`,
    html: `
      <h2>Yeni Fatura Bildirimi</h2>
      <p>Yeni bir fatura oluşturuldu:</p>
      <ul>
        <li><strong>Fatura No:</strong> ${invoiceNumber}</li>
        <li><strong>Müşteri:</strong> ${customerName}</li>
        <li><strong>Tutar:</strong> ${total.toLocaleString('tr-TR')} ${currency}</li>
      </ul>
      <p>ONPROTECH CRM Sistemi</p>
    `,
  };
}

export function createNewAppointmentEmail({
  customerName,
  date,
  startTime,
  title,
}: {
  customerName: string;
  date: string;
  startTime: string;
  title: string;
}) {
  return {
    subject: `Yeni Randevu Oluşturuldu - ${customerName}`,
    html: `
      <h2>Yeni Randevu Bildirimi</h2>
      <p>Yeni bir randevu oluşturuldu:</p>
      <ul>
        <li><strong>Müşteri:</strong> ${customerName}</li>
        <li><strong>Tarih:</strong> ${date}</li>
        <li><strong>Saat:</strong> ${startTime}</li>
        <li><strong>Konu:</strong> ${title}</li>
      </ul>
      <p>ONPROTECH CRM Sistemi</p>
    `,
  };
}

export function createNewServiceOrderEmail({
  orderNumber,
  customerName,
  type,
  priority,
}: {
  orderNumber: string;
  customerName: string;
  type: string;
  priority: string;
}) {
  return {
    subject: `Yeni Teknik Servis Kaydı - ${orderNumber}`,
    html: `
      <h2>Yeni Teknik Servis Bildirimi</h2>
      <p>Yeni bir teknik servis kaydı oluşturuldu:</p>
      <ul>
        <li><strong>Servis No:</strong> ${orderNumber}</li>
        <li><strong>Müşteri:</strong> ${customerName}</li>
        <li><strong>Tip:</strong> ${type}</li>
        <li><strong>Öncelik:</strong> ${priority}</li>
      </ul>
      <p>ONPROTECH CRM Sistemi</p>
    `,
  };
}