import nodemailer from "nodemailer";
import { formatBRL } from "./currency";

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

  // Dono (aviso de novo pedido, com valores em R$)
  if (owner) {
    sends.push(
      t.sendMail({
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
