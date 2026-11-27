import { getServerLang } from "@/lib/lang-server";
import type { Lang } from "@/lib/i18n";

export const dynamic = "force-dynamic";

type Section = { h: string; p: string[] };
type Policy = { title: string; updated: string; sections: Section[] };

const SUPPORT = "support@acervodomanto.com";

const POLICY: Record<Lang, Policy> = {
  pt: {
    title: "Política de Trocas e Devoluções",
    updated: "Última atualização: novembro de 2026",
    sections: [
      {
        h: "1. Direito de arrependimento (14 dias)",
        p: [
          "Para compras feitas online na União Europeia, você tem o direito de se arrepender e devolver o produto em até 14 dias após o recebimento, sem precisar justificar, conforme a Diretiva UE 2011/83.",
          "O produto deve ser devolvido sem uso, com as etiquetas e na embalagem original. O reembolso é feito após recebermos e conferirmos o item.",
        ],
      },
      {
        h: "2. Itens personalizados (nome, número, patch)",
        p: [
          "Produtos personalizados sob a sua especificação — camisas com nome, número ou patch adicionados — NÃO têm direito de arrependimento, conforme o art. 16(c) da Diretiva UE 2011/83, por serem feitos exclusivamente para você.",
          "Ao finalizar um pedido com personalização, você confirma estar ciente de que esse item não pode ser cancelado nem devolvido após a confirmação.",
        ],
      },
      {
        h: "3. Defeitos ou erro nosso",
        p: [
          "Independentemente de ser personalizado ou não, se o produto chegar com defeito, com erro de personalização causado por nós, ou diferente do pedido, você tem direito a troca ou reembolso integral. Basta nos contatar com fotos.",
        ],
      },
      {
        h: "4. Como solicitar",
        p: [
          `Envie um e-mail para ${SUPPORT} com o número do pedido e o motivo. Responderemos com as instruções.`,
        ],
      },
      {
        h: "5. Clientes no Brasil",
        p: [
          "Para clientes no Brasil, aplica-se o direito de arrependimento de 7 dias do Código de Defesa do Consumidor (art. 49). Itens personalizados feitos sob encomenda podem não ser elegíveis, pela natureza do produto.",
        ],
      },
    ],
  },
  en: {
    title: "Returns & Refunds Policy",
    updated: "Last updated: November 2026",
    sections: [
      {
        h: "1. Right of withdrawal (14 days)",
        p: [
          "For online purchases within the European Union, you have the right to withdraw and return your product within 14 days of delivery, with no need to justify, under EU Directive 2011/83.",
          "The product must be returned unused, with tags and in its original packaging. The refund is issued after we receive and check the item.",
        ],
      },
      {
        h: "2. Personalized items (name, number, patch)",
        p: [
          "Products made to your specification — shirts with an added name, number or patch — are NOT eligible for the right of withdrawal, under Art. 16(c) of EU Directive 2011/83, as they are made exclusively for you.",
          "By placing an order with personalization, you confirm you understand this item cannot be cancelled or returned after confirmation.",
        ],
      },
      {
        h: "3. Defects or our error",
        p: [
          "Whether personalized or not, if the product arrives defective, with a personalization error caused by us, or different from your order, you are entitled to an exchange or a full refund. Just contact us with photos.",
        ],
      },
      {
        h: "4. How to request",
        p: [
          `Email ${SUPPORT} with your order number and the reason. We'll reply with instructions.`,
        ],
      },
      {
        h: "5. Customers in Brazil",
        p: [
          "For customers in Brazil, the 7-day right of regret under the Consumer Defense Code (art. 49) applies. Made-to-order personalized items may not be eligible, due to the nature of the product.",
        ],
      },
    ],
  },
  es: {
    title: "Política de Devoluciones",
    updated: "Última actualización: noviembre de 2026",
    sections: [
      {
        h: "1. Derecho de desistimiento (14 días)",
        p: [
          "Para compras online dentro de la Unión Europea, tienes derecho a desistir y devolver tu producto en un plazo de 14 días desde la entrega, sin necesidad de justificación, según la Directiva UE 2011/83.",
          "El producto debe devolverse sin usar, con etiquetas y en su embalaje original. El reembolso se realiza tras recibir y verificar el artículo.",
        ],
      },
      {
        h: "2. Artículos personalizados (nombre, número, parche)",
        p: [
          "Los productos hechos según tu especificación — camisetas con nombre, número o parche añadidos — NO tienen derecho de desistimiento, según el art. 16(c) de la Directiva UE 2011/83, por fabricarse exclusivamente para ti.",
          "Al realizar un pedido con personalización, confirmas que entiendes que ese artículo no puede cancelarse ni devolverse tras la confirmación.",
        ],
      },
      {
        h: "3. Defectos o error nuestro",
        p: [
          "Sea personalizado o no, si el producto llega defectuoso, con un error de personalización causado por nosotros, o distinto a tu pedido, tienes derecho a cambio o reembolso íntegro. Solo contáctanos con fotos.",
        ],
      },
      {
        h: "4. Cómo solicitarlo",
        p: [
          `Escribe a ${SUPPORT} con tu número de pedido y el motivo. Te responderemos con las instrucciones.`,
        ],
      },
      {
        h: "5. Clientes en Brasil",
        p: [
          "Para clientes en Brasil, se aplica el derecho de arrepentimiento de 7 días del Código de Defensa del Consumidor (art. 49). Los artículos personalizados hechos por encargo pueden no ser elegibles, por la naturaleza del producto.",
        ],
      },
    ],
  },
  nl: {
    title: "Retour- en terugbetalingsbeleid",
    updated: "Laatst bijgewerkt: november 2026",
    sections: [
      {
        h: "1. Herroepingsrecht (14 dagen)",
        p: [
          "Voor online aankopen binnen de Europese Unie heb je het recht om je product binnen 14 dagen na levering te herroepen en te retourneren, zonder opgaaf van reden, volgens EU-richtlijn 2011/83.",
          "Het product moet ongebruikt worden geretourneerd, met labels en in de originele verpakking. De terugbetaling vindt plaats nadat we het artikel hebben ontvangen en gecontroleerd.",
        ],
      },
      {
        h: "2. Gepersonaliseerde artikelen (naam, nummer, badge)",
        p: [
          "Producten die op jouw specificatie zijn gemaakt — shirts met een toegevoegde naam, nummer of badge — komen NIET in aanmerking voor het herroepingsrecht, volgens art. 16(c) van EU-richtlijn 2011/83, omdat ze exclusief voor jou worden gemaakt.",
          "Door een bestelling met personalisatie te plaatsen, bevestig je dat je begrijpt dat dit artikel na bevestiging niet kan worden geannuleerd of geretourneerd.",
        ],
      },
      {
        h: "3. Defecten of onze fout",
        p: [
          "Of het nu gepersonaliseerd is of niet, als het product defect aankomt, met een personalisatiefout door ons, of anders dan je bestelling, heb je recht op omruiling of volledige terugbetaling. Neem contact met ons op met foto's.",
        ],
      },
      {
        h: "4. Hoe aanvragen",
        p: [
          `Mail naar ${SUPPORT} met je bestelnummer en de reden. We reageren met instructies.`,
        ],
      },
      {
        h: "5. Klanten in Brazilië",
        p: [
          "Voor klanten in Brazilië geldt het herroepingsrecht van 7 dagen volgens de consumentenwet (art. 49). Op bestelling gemaakte gepersonaliseerde artikelen komen mogelijk niet in aanmerking, vanwege de aard van het product.",
        ],
      },
    ],
  },
};

export default function ReturnsPage() {
  const lang: Lang = getServerLang();
  const policy = POLICY[lang];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display text-3xl font-bold">{policy.title}</h1>
      <p className="text-gray-500 text-sm mt-1">{policy.updated}</p>

      <div className="mt-8 space-y-6">
        {policy.sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-display text-lg font-bold text-gold">{s.h}</h2>
            {s.p.map((para, i) => (
              <p key={i} className="text-sm text-gray-300 mt-2 leading-relaxed">
                {para}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
