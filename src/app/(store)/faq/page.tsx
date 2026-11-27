import Link from "next/link";
import { getServerLang } from "@/lib/lang-server";
import type { Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type QA = { q: string; a: string };
type FaqContent = { title: string; items: QA[] };

const FAQ: Record<Lang, FaqContent> = {
  pt: {
    title: "Perguntas Frequentes",
    items: [
      {
        q: "Quanto tempo leva a entrega?",
        a: "O prazo varia conforme o destino. Em geral, a entrega para a Europa leva de 10 a 20 dias úteis, e para o Brasil de 15 a 25 dias úteis, após a confirmação do pagamento. Você recebe o código de rastreio assim que o pedido é enviado.",
      },
      {
        q: "Vocês entregam no mundo todo?",
        a: "Sim! Enviamos para a Europa, o Brasil e a maior parte do mundo.",
      },
      {
        q: "Quais formas de pagamento são aceitas?",
        a: "Para pedidos internacionais, aceitamos cartão de crédito em um checkout seguro (Stripe). Para o Brasil, o pagamento é combinado após a confirmação do pedido.",
      },
      {
        q: "Como acompanho meu pedido?",
        a: "Você pode acompanhar pelo link do pedido que recebe por e-mail, ou criando uma conta em \"Minha conta\", onde vê o andamento e o código de rastreio de todos os seus pedidos.",
      },
      {
        q: "Posso personalizar a camisa com nome e número?",
        a: "Sim! Na página do produto você pode adicionar nome, número e patch da liga, com o valor adicional calculado automaticamente. Lembrando que itens personalizados não têm direito a cancelamento ou devolução.",
      },
      {
        q: "Como funcionam as trocas e devoluções?",
        a: "Consulte nossa Política de Trocas e Devoluções para todos os detalhes.",
      },
      {
        q: "Como escolho o tamanho?",
        a: "Os tamanhos seguem o padrão internacional (S, M, L, XL, 2XL...). Em caso de dúvida, fale com o suporte antes de comprar.",
      },
    ],
  },
  en: {
    title: "Frequently Asked Questions",
    items: [
      {
        q: "How long does delivery take?",
        a: "Delivery time depends on the destination. Generally, Europe takes 10–20 business days and Brazil 15–25 business days after payment confirmation. You'll receive a tracking code as soon as your order ships.",
      },
      {
        q: "Do you ship worldwide?",
        a: "Yes! We ship to Europe, Brazil and most of the world.",
      },
      {
        q: "Which payment methods do you accept?",
        a: "For international orders we accept credit card via a secure checkout (Stripe). For Brazil, payment is arranged after the order is confirmed.",
      },
      {
        q: "How do I track my order?",
        a: "You can track it from the order link you receive by email, or by creating an account under \"My account\", where you'll see the progress and tracking code of all your orders.",
      },
      {
        q: "Can I customize the shirt with a name and number?",
        a: "Yes! On the product page you can add a name, number and league patch, with the extra cost calculated automatically. Note that personalized items are not eligible for cancellation or return.",
      },
      {
        q: "How do returns and exchanges work?",
        a: "Please see our Returns & Refunds Policy for all the details.",
      },
      {
        q: "How do I choose my size?",
        a: "Sizes follow international standards (S, M, L, XL, 2XL...). If in doubt, contact support before buying.",
      },
    ],
  },
  es: {
    title: "Preguntas Frecuentes",
    items: [
      {
        q: "¿Cuánto tarda la entrega?",
        a: "El plazo depende del destino. En general, Europa tarda de 10 a 20 días hábiles y Brasil de 15 a 25 días hábiles tras la confirmación del pago. Recibirás un código de seguimiento en cuanto se envíe tu pedido.",
      },
      {
        q: "¿Envían a todo el mundo?",
        a: "¡Sí! Enviamos a Europa, Brasil y la mayor parte del mundo.",
      },
      {
        q: "¿Qué métodos de pago aceptan?",
        a: "Para pedidos internacionales aceptamos tarjeta de crédito en un pago seguro (Stripe). Para Brasil, el pago se acuerda tras confirmar el pedido.",
      },
      {
        q: "¿Cómo sigo mi pedido?",
        a: "Puedes seguirlo desde el enlace del pedido que recibes por correo, o creando una cuenta en \"Mi cuenta\", donde verás el estado y el código de seguimiento de todos tus pedidos.",
      },
      {
        q: "¿Puedo personalizar la camiseta con nombre y número?",
        a: "¡Sí! En la página del producto puedes añadir nombre, número y parche de liga, con el coste adicional calculado automáticamente. Ten en cuenta que los artículos personalizados no tienen derecho a cancelación ni devolución.",
      },
      {
        q: "¿Cómo funcionan los cambios y devoluciones?",
        a: "Consulta nuestra Política de Devoluciones para todos los detalles.",
      },
      {
        q: "¿Cómo elijo la talla?",
        a: "Las tallas siguen el estándar internacional (S, M, L, XL, 2XL...). Si tienes dudas, contacta con soporte antes de comprar.",
      },
    ],
  },
  nl: {
    title: "Veelgestelde vragen",
    items: [
      {
        q: "Hoe lang duurt de levering?",
        a: "De levertijd hangt af van de bestemming. Over het algemeen duurt Europa 10–20 werkdagen en Brazilië 15–25 werkdagen na betalingsbevestiging. Je ontvangt een trackingcode zodra je bestelling is verzonden.",
      },
      {
        q: "Verzenden jullie wereldwijd?",
        a: "Ja! We verzenden naar Europa, Brazilië en het grootste deel van de wereld.",
      },
      {
        q: "Welke betaalmethoden accepteren jullie?",
        a: "Voor internationale bestellingen accepteren we creditcard via een beveiligde checkout (Stripe). Voor Brazilië wordt de betaling geregeld na bevestiging van de bestelling.",
      },
      {
        q: "Hoe volg ik mijn bestelling?",
        a: "Je kunt deze volgen via de bestellink die je per e-mail ontvangt, of door een account aan te maken onder \"Mijn account\", waar je de status en trackingcode van al je bestellingen ziet.",
      },
      {
        q: "Kan ik het shirt personaliseren met naam en nummer?",
        a: "Ja! Op de productpagina kun je een naam, nummer en competitiebadge toevoegen, met de meerprijs automatisch berekend. Let op: gepersonaliseerde artikelen komen niet in aanmerking voor annulering of retour.",
      },
      {
        q: "Hoe werken ruilen en retourneren?",
        a: "Bekijk ons retour- en terugbetalingsbeleid voor alle details.",
      },
      {
        q: "Hoe kies ik mijn maat?",
        a: "Maten volgen de internationale standaard (S, M, L, XL, 2XL...). Twijfel je? Neem contact op met support voordat je koopt.",
      },
    ],
  },
};

export default function FaqPage() {
  const lang: Lang = getServerLang();
  const faq = FAQ[lang];
  const policyLabel = {
    pt: "Política de Trocas e Devoluções",
    en: "Returns & Refunds Policy",
    es: "Política de Devoluciones",
    nl: "Retour- en terugbetalingsbeleid",
  }[lang];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">{faq.title}</h1>
      <div className="space-y-3">
        {faq.items.map((item) => (
          <details
            key={item.q}
            className="group border border-ink-600 bg-ink-800 rounded-xl px-4 py-3"
          >
            <summary className="cursor-pointer font-semibold text-gray-100 list-none flex items-center justify-between">
              {item.q}
              <span className="text-gold transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="text-sm text-gray-300 mt-3 leading-relaxed">
              {item.a}{" "}
              {item.a.match(/Política|Policy|Devoluciones|beleid/) && (
                <Link href="/trocas" className="text-gold underline">
                  {policyLabel}
                </Link>
              )}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
