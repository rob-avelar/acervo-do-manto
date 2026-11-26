import { Resend } from "resend";
import { formatBRL } from "./currency";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? "");
  return _resend;
}

export function emailEnabled() {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

type OrderEmailItem = {
  name: string;
  size: string;
  quantity: number;
  customizationText?: string | null;
};

type OrderEmailData = {
  number: string;
  customerName: string;
  customerEmail: string;
  items: OrderEmailItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  address: {
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
    country: string;
  };
};

function itemsHtml(items: OrderEmailItem[]) {
  return items
    .map(
      (i) =>
        `<li>${i.quantity}× ${i.name} (${i.size})${
          i.customizationText ? ` — <em>${i.customizationText}</em>` : ""
        }</li>`,
    )
    .join("");
}

function addressHtml(a: OrderEmailData["address"]) {
  return `${a.street}${a.number ? `, ${a.number}` : ""}${
    a.complement ? ` — ${a.complement}` : ""
  }<br>${a.neighborhood ? `${a.neighborhood} · ` : ""}${a.city}${
    a.state ? `/${a.state}` : ""
  } · ${a.cep} · ${a.country}`;
}

/** Envia e-mail de confirmação ao cliente e aviso de novo pedido ao dono. */
export async function sendOrderEmails(data: OrderEmailData) {
  if (!emailEnabled()) return;
  const from = process.env.EMAIL_FROM as string;
  const owner = process.env.OWNER_EMAIL;
  const isBR = data.address.country.toUpperCase() === "BR";

  // Cliente
  const customerSubject = isBR
    ? `Pedido ${data.number} recebido — Acervo do Manto`
    : `Order ${data.number} received — Acervo do Manto`;
  const customerBody = isBR
    ? `<h2>Obrigado pelo seu pedido!</h2>
<p>Recebemos seu pedido <strong>${data.number}</strong> e já estamos preparando.</p>
<p><strong>Itens:</strong></p><ul>${itemsHtml(data.items)}</ul>
<p><strong>Entrega:</strong><br>${addressHtml(data.address)}</p>
<p>Em breve você recebe o código de rastreio. Qualquer dúvida, é só responder este e-mail.</p>
<p>— Acervo do Manto</p>`
    : `<h2>Thank you for your order!</h2>
<p>We've received your order <strong>${data.number}</strong> and we're preparing it.</p>
<p><strong>Items:</strong></p><ul>${itemsHtml(data.items)}</ul>
<p><strong>Delivery:</strong><br>${addressHtml(data.address)}</p>
<p>You'll receive a tracking code soon. Reply to this email if you have any questions.</p>
<p>— Acervo do Manto</p>`;

  const sends: Promise<unknown>[] = [
    getResend().emails.send({
      from,
      to: data.customerEmail,
      subject: customerSubject,
      html: customerBody,
    }),
  ];

  // Dono (aviso de novo pedido, com valores em R$)
  if (owner) {
    sends.push(
      getResend().emails.send({
        from,
        to: owner,
        subject: `🛒 Novo pedido ${data.number} — ${data.customerName}`,
        html: `<h2>Novo pedido: ${data.number}</h2>
<p><strong>Cliente:</strong> ${data.customerName} · ${data.customerEmail}</p>
<p><strong>Entrega:</strong><br>${addressHtml(data.address)}</p>
<p><strong>Itens:</strong></p><ul>${itemsHtml(data.items)}</ul>
<p>Subtotal: ${formatBRL(data.subtotalCents)}<br>
Frete: ${formatBRL(data.shippingCents)}<br>
<strong>Total: ${formatBRL(data.totalCents)}</strong></p>
<p>Veja no painel: https://acervodomanto.com/admin/pedidos</p>`,
      }),
    );
  }

  await Promise.allSettled(sends);
}
