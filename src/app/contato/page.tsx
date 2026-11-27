import { getCurrentCustomer } from "@/lib/auth";
import { ContactForm } from "@/components/contact-form";
import { getServerLang } from "@/lib/lang-server";
import { dict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const lang = getServerLang();
  const c = dict[lang].contact;
  // Se estiver logado, pré-preenche nome e e-mail.
  const customer = await getCurrentCustomer();

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold mb-2">{c.title}</h1>
      <p className="text-gray-400 text-sm mb-6">{c.intro}</p>
      <ContactForm
        defaultName={customer?.name ?? ""}
        defaultEmail={customer?.email ?? ""}
        labels={{
          name: c.name,
          email: c.email,
          orderNumber: c.orderNumber,
          message: c.message,
          send: c.send,
          sent: c.sent,
          errors: {
            fillAll: c.fillAll,
            badEmail: c.badEmail,
            sendFail: c.sendFail,
          },
        }}
      />
    </div>
  );
}
