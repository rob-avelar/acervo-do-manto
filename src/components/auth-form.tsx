"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import type { AuthState } from "@/app/conta/actions";

export type AuthLabels = {
  name: string;
  email: string;
  password: string;
  passwordHint: string;
  submit: string;
  altPrompt: string;
  altLink: string;
  altHref: string;
  errors: Record<string, string>;
};

type Action = (prev: AuthState, formData: FormData) => Promise<AuthState>;

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

export function AuthForm({
  action,
  showName,
  labels,
}: {
  action: Action;
  showName: boolean;
  labels: AuthLabels;
}) {
  const [state, formAction] = useFormState<AuthState, FormData>(action, {});

  const inputCls =
    "w-full rounded-lg bg-ink border border-ink-600 px-3 py-2.5 text-sm focus:border-gold outline-none";

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-sm px-3 py-2">
          {labels.errors[state.error] ?? state.error}
        </p>
      )}

      {showName && (
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            {labels.name}
          </label>
          <input name="name" type="text" required className={inputCls} />
        </div>
      )}

      <div>
        <label className="block text-sm text-gray-300 mb-1">
          {labels.email}
        </label>
        <input name="email" type="email" required className={inputCls} />
      </div>

      <div>
        <label className="block text-sm text-gray-300 mb-1">
          {labels.password}
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className={inputCls}
        />
        {showName && (
          <p className="text-xs text-gray-500 mt-1">{labels.passwordHint}</p>
        )}
      </div>

      <SubmitButton label={labels.submit} />

      <p className="text-sm text-gray-400 text-center">
        {labels.altPrompt}{" "}
        <Link href={labels.altHref} className="text-gold underline">
          {labels.altLink}
        </Link>
      </p>
    </form>
  );
}
