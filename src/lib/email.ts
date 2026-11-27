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

// --- Template de marca (tabela + estilos inline p/ compatibilidade) ---
const LOGO_URL = "https://acervodomanto.com/logo.png";
const IG_URL = "https://instagram.com/acervodomanto_";
const SITE_URL = "https://acervodomanto.com";
function supportAddr() {
  return process.env.SMTP_USER || "support@acervodomanto.com";
}

function emailShell(o: {
  heading: string;
  body: string;
  preheader?: string;
  button?: { label: string; url: string };
}): string {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0b0b0e;">
${
  o.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#0b0b0e;">${o.preheader}</div>`
    : ""
}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0e;padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:92%;">
      <tr><td align="center" style="padding:4px 0 18px;">
        <a href="${SITE_URL}"><img src="${LOGO_URL}" alt="Acervo do Manto" width="92" height="92" style="display:block;border:0;width:92px;height:92px;"></a>
      </td></tr>
      <tr><td style="background:#141419;border:1px solid #26262e;border-radius:14px;padding:28px;">
        <h1 style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:21px;line-height:1.3;color:#d4af37;">${o.heading}</h1>
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#e6e6e6;">${o.body}</div>
        ${
          o.button
            ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 2px;"><tr><td style="border-radius:8px;background:#d4af37;"><a href="${o.button.url}" style="display:inline-block;padding:12px 26px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#111111;text-decoration:none;border-radius:8px;">${o.button.label}</a></td></tr></table>`
            : ""
        }
      </td></tr>
      <tr><td align="center" style="padding:18px 10px 4px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8a8a8a;">
        <a href="${IG_URL}" style="color:#d4af37;text-decoration:none;">@acervodomanto_</a>
        &nbsp;·&nbsp;
        <a href="mailto:${supportAddr()}" style="color:#d4af37;text-decoration:none;">${supportAddr()}</a>
        <br>© ${year} Acervo do Manto
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// Bloco de itens estilizado para os e-mails.
function itemsTable(items: OrderEmailItem[]): string {
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:9px 0;border-bottom:1px solid #26262e;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#e6e6e6;"><strong style="color:#ffffff;">${i.quantity}×</strong> ${i.name} <span style="color:#9a9a9a;">(${i.size})</span>${
          i.customizationText
            ? `<br><span style="color:#d4af37;font-size:13px;">✨ ${i.customizationText}</span>`
            : ""
        }</td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 2px;">${rows}</table>`;
}

function addressBlock(a: OrderEmailData["address"]): string {
  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#c9c9c9;line-height:1.5;">${a.street}${
    a.number ? `, ${a.number}` : ""
  }${a.complement ? ` — ${a.complement}` : ""}<br>${
    a.neighborhood ? `${a.neighborhood} · ` : ""
  }${a.city}${a.state ? `/${a.state}` : ""} · ${a.cep} · ${a.country}</div>`;
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

/** Envia e-mail de confirmação ao cliente e aviso de novo pedido ao dono. */
export async function sendOrderEmails(data: OrderEmailData) {
  if (!emailEnabled()) return;
  const from = fromAddress();
  const owner = process.env.OWNER_EMAIL;
  const isBR = data.address.country.toUpperCase() === "BR";
  const t = getTransporter();

  const label = (pt: string, en: string) => (isBR ? pt : en);

  // Cliente
  const customerSubject = isBR
    ? `Pedido ${data.number} recebido — Acervo do Manto`
    : `Order ${data.number} received — Acervo do Manto`;

  const customerBody = emailShell({
    heading: label("Obrigado pelo seu pedido! ⚽", "Thank you for your order! ⚽"),
    preheader: label(
      `Pedido ${data.number} recebido`,
      `Order ${data.number} received`,
    ),
    body: `
<p style="margin:0 0 8px;">${label(
      `Recebemos seu pedido <strong style="color:#fff;">${data.number}</strong> e já estamos preparando com carinho.`,
      `We've received your order <strong style="color:#fff;">${data.number}</strong> and we're preparing it with care.`,
    )}</p>
<p style="margin:18px 0 4px;color:#d4af37;font-weight:bold;">${label("Itens", "Items")}</p>
${itemsTable(data.items)}
<p style="margin:18px 0 4px;color:#d4af37;font-weight:bold;">${label("Entrega", "Delivery")}</p>
${addressBlock(data.address)}
<p style="margin:18px 0 0;color:#b5b5b5;font-size:14px;">${label(
      "Em breve você recebe o código de rastreio. Qualquer dúvida, é só responder este e-mail.",
      "You'll receive a tracking code soon. Just reply to this email if you have any questions.",
    )}</p>`,
    button: {
      label: label("Acompanhar pedido", "Track order"),
      url: `${SITE_URL}/pedido/${data.number}`,
    },
  });

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
        html: emailShell({
          heading: `🛒 New order ${data.number}`,
          preheader: `${data.customerName} · ${formatMoney(data.totalCents, "EUR")}`,
          body: `
<p style="margin:0 0 4px;"><strong style="color:#fff;">Customer:</strong> ${data.customerName} · ${data.customerEmail}</p>
<p style="margin:14px 0 4px;color:#d4af37;font-weight:bold;">Delivery</p>
${addressBlock(data.address)}
<p style="margin:14px 0 4px;color:#d4af37;font-weight:bold;">Items</p>
${itemsTable(data.items)}
<p style="margin:16px 0 0;font-size:15px;">Subtotal: ${formatMoney(data.subtotalCents, "EUR")}<br>
Shipping: ${formatMoney(data.shippingCents, "EUR")}<br>
<strong style="color:#fff;">Total: ${formatMoney(data.totalCents, "EUR")}</strong></p>`,
          button: {
            label: "Open dashboard",
            url: `${SITE_URL}/admin/pedidos`,
          },
        }),
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
): { subject: string; heading: string; body: string } | null {
  const num = `<strong style="color:#fff;">${number}</strong>`;
  const track =
    tracking && tracking.trim()
      ? isBR
        ? `<p style="margin:14px 0 4px;color:#d4af37;font-weight:bold;">Código de rastreio</p><p style="margin:0;font-size:16px;color:#fff;letter-spacing:0.5px;">${tracking}</p>`
        : `<p style="margin:14px 0 4px;color:#d4af37;font-weight:bold;">Tracking code</p><p style="margin:0;font-size:16px;color:#fff;letter-spacing:0.5px;">${tracking}</p>`
      : "";

  switch (status) {
    case "PAID":
      return isBR
        ? {
            subject: `Pagamento confirmado — Pedido ${number}`,
            heading: "Pagamento confirmado! ✅",
            body: `<p style="margin:0;">Recebemos o pagamento do seu pedido ${num}. Já vamos preparar o envio.</p>`,
          }
        : {
            subject: `Payment confirmed — Order ${number}`,
            heading: "Payment confirmed! ✅",
            body: `<p style="margin:0;">We've received payment for your order ${num}. We'll start preparing your shipment.</p>`,
          };
    case "PROCESSING":
      return isBR
        ? {
            subject: `Pedido em preparação — ${number}`,
            heading: "Seu pedido está sendo preparado 📦",
            body: `<p style="margin:0;">O pedido ${num} entrou em separação. Em breve ele será enviado.</p>`,
          }
        : {
            subject: `Order being prepared — ${number}`,
            heading: "Your order is being prepared 📦",
            body: `<p style="margin:0;">Order ${num} is now being packed. It will be shipped soon.</p>`,
          };
    case "SHIPPED":
      return isBR
        ? {
            subject: `Seu pedido foi enviado! — ${number}`,
            heading: "Seu pedido está a caminho! 🚚",
            body: `<p style="margin:0;">O pedido ${num} foi enviado.</p>${track}<p style="margin:14px 0 0;color:#b5b5b5;">Fique de olho, logo chega aí!</p>`,
          }
        : {
            subject: `Your order has shipped! — ${number}`,
            heading: "Your order is on its way! 🚚",
            body: `<p style="margin:0;">Order ${num} has been shipped.</p>${track}<p style="margin:14px 0 0;color:#b5b5b5;">Keep an eye out — it'll arrive soon!</p>`,
          };
    case "DELIVERED":
      return isBR
        ? {
            subject: `Pedido entregue — ${number}`,
            heading: "Pedido entregue! 🎉",
            body: `<p style="margin:0;">O pedido ${num} foi marcado como entregue. Esperamos que você curta sua nova camisa!</p>`,
          }
        : {
            subject: `Order delivered — ${number}`,
            heading: "Order delivered! 🎉",
            body: `<p style="margin:0;">Order ${num} has been marked as delivered. We hope you love your new shirt!</p>`,
          };
    case "CANCELLED":
      return isBR
        ? {
            subject: `Pedido cancelado — ${number}`,
            heading: "Pedido cancelado",
            body: `<p style="margin:0;">O pedido ${num} foi cancelado. Se tiver qualquer dúvida sobre reembolso, responda este e-mail.</p>`,
          }
        : {
            subject: `Order cancelled — ${number}`,
            heading: "Order cancelled",
            body: `<p style="margin:0;">Order ${num} has been cancelled. If you have any questions about a refund, just reply to this email.</p>`,
          };
    default:
      return null; // PENDING não notifica
  }
}

/** Envia uma mensagem de contato do cliente para o suporte/dono. */
export async function sendContactEmail(data: {
  name: string;
  email: string;
  orderNumber?: string;
  message: string;
  subject?: string;
}) {
  if (!emailEnabled()) return;
  const to = process.env.OWNER_EMAIL || process.env.SMTP_USER;
  if (!to) return;

  await getTransporter().sendMail({
    from: fromAddress(),
    to,
    replyTo: data.email, // responder vai direto para o cliente
    subject: `📨 ${data.subject || "Contato"}: ${data.name}${
      data.orderNumber ? ` — Pedido ${data.orderNumber}` : ""
    }`,
    html: emailShell({
      heading: "📨 Nova mensagem de contato",
      preheader: `${data.name} — ${data.subject || "Contato"}`,
      body: `
<p style="margin:0 0 4px;"><strong style="color:#fff;">Nome:</strong> ${data.name}</p>
<p style="margin:0 0 4px;"><strong style="color:#fff;">E-mail:</strong> <a href="mailto:${data.email}" style="color:#d4af37;">${data.email}</a></p>
${data.subject ? `<p style="margin:0 0 4px;"><strong style="color:#fff;">Assunto:</strong> ${data.subject}</p>` : ""}
${data.orderNumber ? `<p style="margin:0 0 4px;"><strong style="color:#fff;">Pedido:</strong> ${data.orderNumber}</p>` : ""}
<p style="margin:16px 0 4px;color:#d4af37;font-weight:bold;">Mensagem</p>
<p style="margin:0;color:#e6e6e6;">${data.message.replace(/\n/g, "<br>")}</p>`,
    }),
  });
}

/** Envia o e-mail com o link de redefinição de senha. */
export async function sendPasswordReset(
  to: string,
  name: string,
  link: string,
  lang: "pt" | "en" | "es" | "nl",
) {
  if (!emailEnabled()) return;
  const copy = {
    pt: {
      subject: "Redefinir sua senha — Acervo do Manto",
      heading: `Olá, ${name}! 🔑`,
      intro:
        "Recebemos um pedido para redefinir sua senha. Clique no botão abaixo (válido por 1 hora):",
      btn: "Redefinir senha",
      foot: "Se você não pediu isso, pode ignorar este e-mail com segurança.",
    },
    en: {
      subject: "Reset your password — Acervo do Manto",
      heading: `Hi, ${name}! 🔑`,
      intro:
        "We received a request to reset your password. Click the button below (valid for 1 hour):",
      btn: "Reset password",
      foot: "If you didn't request this, you can safely ignore this email.",
    },
    es: {
      subject: "Restablecer tu contraseña — Acervo do Manto",
      heading: `¡Hola, ${name}! 🔑`,
      intro:
        "Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón (válido 1 hora):",
      btn: "Restablecer contraseña",
      foot: "Si no lo solicitaste, puedes ignorar este correo con seguridad.",
    },
    nl: {
      subject: "Reset je wachtwoord — Acervo do Manto",
      heading: `Hoi, ${name}! 🔑`,
      intro:
        "We hebben een verzoek ontvangen om je wachtwoord te resetten. Klik op de knop (1 uur geldig):",
      btn: "Wachtwoord resetten",
      foot: "Heb je dit niet aangevraagd? Negeer deze e-mail dan gerust.",
    },
  }[lang];

  await getTransporter().sendMail({
    from: fromAddress(),
    to,
    subject: copy.subject,
    html: emailShell({
      heading: copy.heading,
      preheader: copy.subject,
      body: `<p style="margin:0;">${copy.intro}</p><p style="margin:16px 0 0;color:#9a9a9a;font-size:13px;">${copy.foot}</p>`,
      button: { label: copy.btn, url: link },
    }),
  });
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
    html: emailShell({
      heading: copy.heading,
      preheader: copy.subject,
      body: copy.body,
      button: {
        label: isBR ? "Acompanhar pedido" : "Track order",
        url: `${SITE_URL}/pedido/${data.number}`,
      },
    }),
  });
}
