import { redirect } from "next/navigation";
import { getSessionCustomerId } from "@/lib/auth";
import { signupAction } from "../actions";
import { AuthForm } from "@/components/auth-form";
import { getServerLang } from "@/lib/lang-server";
import { dict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  if (await getSessionCustomerId()) redirect("/conta");

  const lang = getServerLang();
  const a = dict[lang].account;

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold mb-6">{a.signupTitle}</h1>
      <AuthForm
        action={signupAction}
        showName={true}
        labels={{
          name: a.name,
          email: a.email,
          password: a.password,
          passwordHint: a.passwordHint,
          submit: a.signupBtn,
          altPrompt: a.hasAccount,
          altLink: a.goLogin,
          altHref: "/conta/entrar",
          errors: {
            fillAll: a.fillAll,
            shortPassword: a.shortPassword,
            wrongLogin: a.wrongLogin,
            emailInUse: a.emailInUse,
          },
        }}
      />
    </div>
  );
}
