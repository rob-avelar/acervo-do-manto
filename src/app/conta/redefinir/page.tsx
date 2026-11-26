import Link from "next/link";
import { ResetForm } from "@/components/reset-forms";
import { getServerLang } from "@/lib/lang-server";
import { dict } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function ResetPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const lang = getServerLang();
  const a = dict[lang].account;
  const token = searchParams.token ?? "";

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-bold mb-4">
          {a.resetTitle}
        </h1>
        <p className="text-red-300 text-sm mb-4">{a.invalidToken}</p>
        <Link href="/conta/esqueci" className="text-gold underline text-sm">
          {a.forgotTitle}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold mb-6">{a.resetTitle}</h1>
      <ResetForm
        token={token}
        labels={{
          newPassword: a.newPassword,
          passwordHint: a.passwordHint,
          save: a.resetBtn,
          back: a.backToLogin,
          errors: {
            fillAll: a.fillAll,
            shortPassword: a.shortPassword,
            invalidToken: a.invalidToken,
          },
        }}
      />
    </div>
  );
}
