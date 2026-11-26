"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import {
  requestResetAction,
  resetPasswordAction,
  type ResetState,
  type AuthState,
} from "@/app/conta/actions";

const inputCls =
  "w-full rounded-lg bg-ink border border-ink-600 px-3 py-2.5 text-sm focus:border-gold outline-none";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-gold text-ink font-semibold py-3 hover:brightness-110 disabled:opacity-60 transition"
    >
      {pending ? "..." : label}
    </button>
  );
}

export function ForgotForm({
  labels,
}: {
  labels: {
    intro: string;
    email: string;
    send: string;
    sent: string;
    back: string;
  };
}) {
  const [state, action] = useFormState<ResetState, FormData>(
    requestResetAction,
    {},
  );

  if (state?.sent) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-sm px-3 py-3">
          {labels.sent}
        </p>
        <Link href="/conta/entrar" className="text-gold underline text-sm">
          {labels.back}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <p className="text-gray-400 text-sm">{labels.intro}</p>
      <div>
        <label className="block text-sm text-gray-300 mb-1">
          {labels.email}
        </label>
        <input name="email" type="email" required className={inputCls} />
      </div>
      <SubmitButton label={labels.send} />
      <p className="text-center">
        <Link href="/conta/entrar" className="text-gold underline text-sm">
          {labels.back}
        </Link>
      </p>
    </form>
  );
}

export function ResetForm({
  token,
  labels,
}: {
  token: string;
  labels: {
    newPassword: string;
    passwordHint: string;
    save: string;
    back: string;
    errors: Record<string, string>;
  };
}) {
  const [state, action] = useFormState<AuthState, FormData>(
    resetPasswordAction,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      {state?.error && (
        <p className="rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-sm px-3 py-2">
          {labels.errors[state.error] ?? state.error}
        </p>
      )}
      <div>
        <label className="block text-sm text-gray-300 mb-1">
          {labels.newPassword}
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className={inputCls}
        />
        <p className="text-xs text-gray-500 mt-1">{labels.passwordHint}</p>
      </div>
      <SubmitButton label={labels.save} />
      <p className="text-center">
        <Link href="/conta/entrar" className="text-gold underline text-sm">
          {labels.back}
        </Link>
      </p>
    </form>
  );
}
