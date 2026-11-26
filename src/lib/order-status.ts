import type { Lang } from "./i18n";

export type OrderStatusName =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

// Rótulos por status em cada idioma.
export const STATUS_LABELS: Record<OrderStatusName, Record<Lang, string>> = {
  PENDING: {
    pt: "Aguardando pagamento",
    en: "Awaiting payment",
    es: "Esperando pago",
    nl: "Wacht op betaling",
  },
  PAID: { pt: "Pago", en: "Paid", es: "Pagado", nl: "Betaald" },
  PROCESSING: {
    pt: "Em preparação",
    en: "Processing",
    es: "En preparación",
    nl: "In verwerking",
  },
  SHIPPED: { pt: "Enviado", en: "Shipped", es: "Enviado", nl: "Verzonden" },
  DELIVERED: {
    pt: "Entregue",
    en: "Delivered",
    es: "Entregado",
    nl: "Geleverd",
  },
  CANCELLED: {
    pt: "Cancelado",
    en: "Cancelled",
    es: "Cancelado",
    nl: "Geannuleerd",
  },
};

export const STATUS_COLORS: Record<OrderStatusName, string> = {
  PENDING: "bg-amber-500/20 text-amber-300",
  PAID: "bg-emerald-500/20 text-emerald-300",
  PROCESSING: "bg-blue-500/20 text-blue-300",
  SHIPPED: "bg-cyan-500/20 text-cyan-300",
  DELIVERED: "bg-green-600/20 text-green-300",
  CANCELLED: "bg-red-500/20 text-red-300",
};

// Etapas visíveis na linha do tempo (fluxo normal).
export const STATUS_FLOW: OrderStatusName[] = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export function statusLabel(status: string, lang: Lang): string {
  return STATUS_LABELS[status as OrderStatusName]?.[lang] ?? status;
}

// "Código de rastreio" por idioma.
export const TRACKING_LABEL: Record<Lang, string> = {
  pt: "Código de rastreio",
  en: "Tracking code",
  es: "Código de seguimiento",
  nl: "Trackingcode",
};
