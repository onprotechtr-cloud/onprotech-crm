"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ServiceStatus, ServiceType } from "@prisma/client";
import { sendEmail, createNewServiceOrderEmail } from "@/lib/email";

export async function getServiceOrders(filters?: {
  status?: string;
  type?: string;
  priority?: string;
  assignedToId?: string;
  search?: string;
}) {
  return prisma.serviceOrder.findMany({
    where: {
      ...(filters?.status && filters.status !== "ALL"
        ? { status: filters.status as ServiceStatus }
        : {}),
      ...(filters?.type && filters.type !== "ALL"
        ? { type: filters.type as ServiceType }
        : {}),
      ...(filters?.priority && filters.priority !== "ALL"
        ? { priority: filters.priority }
        : {}),
      ...(filters?.assignedToId && filters.assignedToId !== "ALL"
        ? { assignedToId: filters.assignedToId }
        : {}),
      ...(filters?.search
        ? {
            OR: [
              { title: { contains: filters.search } },
              { orderNumber: { contains: filters.search } },
              { customer: { name: { contains: filters.search } } },
              { location: { contains: filters.search } },
            ],
          }
        : {}),
    },
    include: {
      customer: { select: { id: true, name: true, company: true } },
      assignedTo: { select: { id: true, name: true } },
      usedParts: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getServiceOrderById(id: string) {
  return prisma.serviceOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      assignedTo: { select: { id: true, name: true, role: true } },
      usedParts: {
        include: {
          product: { select: { id: true, name: true, code: true, unit: true, unitPrice: true, stockQuantity: true } },
        },
      },
    },
  });
}

async function generateServiceOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.serviceOrder.count({
    where: { orderNumber: { startsWith: `SRV-${year}-` } },
  });
  return `SRV-${year}-${String(count + 1).padStart(3, "0")}`;
}

export async function createServiceOrder(data: {
  customerId: string;
  assignedToId?: string;
  type: string;
  priority: string;
  title: string;
  description?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  location?: string;
  customerNotes?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { error: "Oturum açmanız gerekiyor" };

  const orderNumber = await generateServiceOrderNumber();

  const order = await prisma.serviceOrder.create({
    data: {
      orderNumber,
      customerId: data.customerId,
      assignedToId: data.assignedToId || null,
      type: data.type as ServiceType,
      priority: data.priority,
      title: data.title,
      description: data.description || null,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
      scheduledTime: data.scheduledTime || null,
      location: data.location || null,
      customerNotes: data.customerNotes || null,
    },
    include: {
      customer: { select: { name: true } },
    },
  });

  // Mail bildirimi gönder
  try {
    if (order.customer) {
      const emailContent = createNewServiceOrderEmail({
        orderNumber,
        customerName: order.customer.name,
        type: data.type,
        priority: data.priority,
      });
      
      await sendEmail({
        to: "onprotechtr@gmail.com",
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }
  } catch (emailError) {
    console.error("Mail gönderme hatası:", emailError);
  }

  revalidatePath("/dashboard/teknik-servis");
  return { data: order };
}

export async function updateServiceOrder(
  id: string,
  data: {
    customerId?: string;
    assignedToId?: string;
    type?: string;
    priority?: string;
    title?: string;
    description?: string;
    scheduledDate?: string;
    scheduledTime?: string;
    location?: string;
    customerNotes?: string;
    technicianNotes?: string;
  }
) {
  const order = await prisma.serviceOrder.update({
    where: { id },
    data: {
      ...(data.customerId ? { customerId: data.customerId } : {}),
      assignedToId: data.assignedToId || null,
      ...(data.type ? { type: data.type as ServiceType } : {}),
      ...(data.priority ? { priority: data.priority } : {}),
      ...(data.title ? { title: data.title } : {}),
      description: data.description ?? undefined,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
      scheduledTime: data.scheduledTime || null,
      location: data.location || null,
      customerNotes: data.customerNotes ?? undefined,
      technicianNotes: data.technicianNotes ?? undefined,
    },
  });

  revalidatePath("/dashboard/teknik-servis");
  revalidatePath(`/dashboard/teknik-servis/${id}`);
  return { data: order };
}

export async function updateServiceOrderStatus(id: string, status: ServiceStatus) {
  const data: { status: ServiceStatus; completedDate?: Date | null } = { status };
  if (status === ServiceStatus.TAMAMLANDI) {
    data.completedDate = new Date();
  }

  const order = await prisma.serviceOrder.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/teknik-servis");
  revalidatePath(`/dashboard/teknik-servis/${id}`);
  return { data: order };
}

export async function deleteServiceOrder(id: string) {
  await prisma.serviceOrder.delete({ where: { id } });
  revalidatePath("/dashboard/teknik-servis");
  return { success: true };
}

export async function addServicePart(data: {
  serviceOrderId: string;
  productId: string;
  quantity: number;
}) {
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) return { error: "Ürün bulunamadı" };
  if (product.stockQuantity < data.quantity) {
    return { error: `Yetersiz stok. Mevcut: ${product.stockQuantity} ${product.unit}` };
  }

  const [part] = await prisma.$transaction([
    prisma.servicePart.create({
      data: {
        serviceOrderId: data.serviceOrderId,
        productId: data.productId,
        quantity: data.quantity,
      },
    }),
    prisma.product.update({
      where: { id: data.productId },
      data: { stockQuantity: { decrement: data.quantity } },
    }),
  ]);

  revalidatePath(`/dashboard/teknik-servis/${data.serviceOrderId}`);
  revalidatePath("/dashboard/stok");
  return { data: part };
}

export async function removeServicePart(partId: string, serviceOrderId: string) {
  const part = await prisma.servicePart.findUnique({ where: { id: partId } });
  if (!part) return { error: "Parça bulunamadı" };

  await prisma.$transaction([
    prisma.servicePart.delete({ where: { id: partId } }),
    prisma.product.update({
      where: { id: part.productId },
      data: { stockQuantity: { increment: part.quantity } },
    }),
  ]);

  revalidatePath(`/dashboard/teknik-servis/${serviceOrderId}`);
  revalidatePath("/dashboard/stok");
  return { success: true };
}

export async function getTechnicians() {
  return prisma.user.findMany({
    where: { role: { in: ["ADMIN", "TEKNISYEN"] } },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });
}

export async function getPendingServiceCount() {
  return prisma.serviceOrder.count({
    where: { status: { in: [ServiceStatus.BEKLEMEDE, ServiceStatus.ATANDI, ServiceStatus.YOLDA, ServiceStatus.BASLADIM] } },
  });
}

export async function getRecentServiceOrders(limit = 5) {
  return prisma.serviceOrder.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true, company: true } },
      assignedTo: { select: { name: true } },
    },
  });
}
