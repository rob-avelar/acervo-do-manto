import { redirect } from "next/navigation";
import { getSessionCustomerId } from "@/lib/auth";
import { ForgotForm } from "@/components/reset-forms";
import { getServerLang } from "@/lib/lang-server";
import { dict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ForgotPage() {
  if (await getSessionCustomerId()) redirect("/conta");

  const lang = getServerLang();
  const a = dict[lang].account;

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold mb-6">{a.forgotTitle}</h1>
      <ForgotForm
        labels={{
          intro: a.forgotIntro,
          email: a.email,
          send: a.sendLink,
          sent: a.resetSent,
          back: a.backToLogin,
        }}
      />
    </div>
  );
}
