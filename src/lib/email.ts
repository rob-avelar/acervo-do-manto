import nodemailer from "nodemailer";
import { formatMoney } from "./currency";

// Envio via SMTP do Google Workspace (conta support@acervodomanto.com).
// Configurado por variáveis de ambiente no Vercel:
//   SMTP_USER  = support@acervodomanto.com
//   SMTP_PASS  = senha de app do Google (16 caracteres, sem espaços)
//   EMAIL_FROM = (opcional) remetente exibido; padrão usa SMTP_USER
//   OWNER_EMAIL= (opcional) e-mail que recebe aviso de novo pedido

let _transporter: nodemailer.Transporter | null = null;
function getTransporter(): nodemailer.Transporter {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER ?? "",
        pass: (process.env.SMTP_PASS ?? "").replace(/\s+/g, ""),
      },
    });
  }
  return _transporter;
}

export function emailEnabled() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

// Remetente: usa EMAIL_FROM se definido, senão monta a partir do SMTP_USER.
function fromAddress() {
  const user = process.env.SMTP_USER ?? "";
  return process.env.EMAIL_FROM || `Acervo do Manto <${user}>`;
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
  const from = fromAddress();
  const owner = process.env.OWNER_EMAIL;
  const isBR = data.address.country.toUpperCase() === "BR";
  const t = getTransporter();

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
    t.sendMail({
      from,
      to: data.customerEmail,
      subject: customerSubject,
      html: customerBody,
    }),
  ];

  // Dono (aviso de novo pedido, em inglês e com valores em euro)
  if (owner) {
    sends.push(
      t.sendMail({
        from,
        to: owner,
        subject: `🛒 New order ${data.number} — ${data.customerName}`,
        html: `<h2>New order: ${data.number}</h2>
<p><strong>Customer:</strong> ${data.customerName} · ${data.customerEmail}</p>
<p><strong>Delivery:</strong><br>${addressHtml(data.address)}</p>
<p><strong>Items:</strong></p><ul>${itemsHtml(data.items)}</ul>
<p>Subtotal: ${formatMoney(data.subtotalCents, "EUR")}<br>
Shipping: ${formatMoney(data.shippingCents, "EUR")}<br>
<strong>Total: ${formatMoney(data.totalCents, "EUR")}</strong></p>
<p>View in dashboard: https://acervodomanto.com/admin/pedidos</p>`,
      }),
    );
  }

  await Promise.allSettled(sends);
}

// ---- E-mail de atualização de status do pedido ----

type OrderStatusName =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

type StatusEmailData = {
  number: string;
  customerName: string;
  customerEmail: string;
  country: string;
  status: OrderStatusName;
  trackingCode?: string | null;
};

// Textos por status (pt para Brasil, en para o resto). Null = não envia e-mail
// para esse status (ex.: PENDING não vale uma notificação ao cliente).
function statusCopy(
  status: OrderStatusName,
  isBR: boolean,
  number: string,
  tracking?: string | null,
): { subject: string; html: string } | null {
  const track =
    tracking && tracking.trim()
      ? isBR
        ? `<p><strong>Código de rastreio:</strong> ${tracking}</p>`
        : `<p><strong>Tracking code:</strong> ${tracking}</p>`
      : "";

  const sign = isBR ? `<p>— Acervo do Manto</p>` : `<p>— Acervo do Manto</p>`;

  switch (status) {
    case "PAID":
      return isBR
        ? {
            subject: `Pagamento confirmado — Pedido ${number}`,
            html: `<h2>Pagamento confirmado! ✅</h2><p>Recebemos o pagamento do seu pedido <strong>${number}</strong>. Já vamos preparar o envio.</p>${sign}`,
          }
        : {
            subject: `Payment confirmed — Order ${number}`,
            html: `<h2>Payment confirmed! ✅</h2><p>We've received payment for your order <strong>${number}</strong>. We'll start preparing your shipment.</p>${sign}`,
          };
    case "PROCESSING":
      return isBR
        ? {
            subject: `Pedido em preparação — ${number}`,
            html: `<h2>Seu pedido está sendo preparado 📦</h2><p>O pedido <strong>${number}</strong> entrou em separação. Em breve ele será enviado.</p>${sign}`,
          }
        : {
            subject: `Order being prepared — ${number}`,
            html: `<h2>Your order is being prepared 📦</h2><p>Order <strong>${number}</strong> is now being packed. It will be shipped soon.</p>${sign}`,
          };
    case "SHIPPED":
      return isBR
        ? {
            subject: `Seu pedido foi enviado! — ${number}`,
            html: `<h2>Seu pedido está a caminho! 🚚</h2><p>O pedido <strong>${number}</strong> foi enviado.</p>${track}<p>Fique de olho, logo chega aí!</p>${sign}`,
          }
        : {
            subject: `Your order has shipped! — ${number}`,
            html: `<h2>Your order is on its way! 🚚</h2><p>Order <strong>${number}</strong> has been shipped.</p>${track}<p>Keep an eye out — it'll arrive soon!</p>${sign}`,
          };
    case "DELIVERED":
      return isBR
        ? {
            subject: `Pedido entregue — ${number}`,
            html: `<h2>Pedido entregue! 🎉</h2><p>O pedido <strong>${number}</strong> foi marcado como entregue. Esperamos que você curta sua nova camisa!</p><p>Qualquer coisa, é só responder este e-mail.</p>${sign}`,
          }
        : {
            subject: `Order delivered — ${number}`,
            html: `<h2>Order delivered! 🎉</h2><p>Order <strong>${number}</strong> has been marked as delivered. We hope you love your new shirt!</p><p>Reply to this email if you need anything.</p>${sign}`,
          };
    case "CANCELLED":
      return isBR
        ? {
            subject: `Pedido cancelado — ${number}`,
            html: `<h2>Pedido cancelado</h2><p>O pedido <strong>${number}</strong> foi cancelado. Se tiver qualquer dúvida sobre reembolso, responda este e-mail.</p>${sign}`,
          }
        : {
            subject: `Order cancelled — ${number}`,
            html: `<h2>Order cancelled</h2><p>Order <strong>${number}</strong> has been cancelled. If you have any questions about a refund, just reply to this email.</p>${sign}`,
          };
    default:
      return null; // PENDING não notifica
  }
}

/** Envia e-mail ao cliente quando o status do pedido muda. */
export async function sendStatusEmail(data: StatusEmailData) {
  if (!emailEnabled()) return;
  const isBR = data.country.toUpperCase() === "BR";
  const copy = statusCopy(data.status, isBR, data.number, data.trackingCode);
  if (!copy) return; // status sem notificação

  const from = fromAddress();
  await getTransporter().sendMail({
    from,
    to: data.customerEmail,
    subject: copy.subject,
    html: copy.html,
  });
}
