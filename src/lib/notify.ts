import { prisma } from "./prisma";
import { sendOrderEmails } from "./email";
import { productName } from "./product-name";

/**
 * Busca o pedido pelo número e envia os e-mails (cliente + dono).
 * Usado pelo webhook do Stripe, após o pagamento ser confirmado.
 */
export async function sendOrderEmailsByNumber(number: string) {
  const order = await prisma.order.findUnique({
    where: { number },
    include: {
      items: { include: { product: true } },
      address: true,
      customer: true,
    },
  });
  if (!order) return;

  const isBR = order.address.country.toUpperCase() === "BR";
  const lang = isBR ? "pt" : "en";

  await sendOrderEmails({
    number: order.number,
    customerName: order.customer.name,
    customerEmail: order.customer.email,
    items: order.items.map((i) => ({
      name: productName(i.product, lang),
      size: i.size,
      quantity: i.quantity,
      customizationText: i.customization,
    })),
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    totalCents: order.totalCents,
    address: {
      street: order.address.street,
      number: order.address.number,
      complement: order.address.complement,
      neighborhood: order.address.neighborhood,
      city: order.address.city,
      state: order.address.state,
      cep: order.address.cep,
      country: order.address.country,
    },
  });
}
