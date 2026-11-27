"use client";

import { useFormState, useFormStatus } from "react-dom";
import { sendContactAction, type ContactState } from "@/app/contato/actions";

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

export function ContactForm({
  labels,
  defaultName = "",
  defaultEmail = "",
}: {
  labels: {
    name: string;
    email: string;
    orderNumber: string;
    message: string;
    send: string;
    sent: string;
    errors: Record<string, string>;
  };
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, action] = useFormState<ContactState, FormData>(
    sendContactAction,
    {},
  );

  if (state?.sent) {
    return (
      <p className="rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-sm px-4 py-4">
        {labels.sent}
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-sm px-3 py-2">
          {labels.errors[state.error] ?? state.error}
        </p>
      )}
      <div>
        <label className="block text-sm text-gray-300 mb-1">
          {labels.name}
        </label>
        <input
          name="name"
          type="text"
          required
          defaultValue={defaultName}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">
          {labels.email}
        </label>
        <input
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          className={inputCls}
        />
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">
          {labels.orderNumber}
        </label>
        <input name="orderNumber" type="text" className={inputCls} />
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">
          {labels.message}
        </label>
        <textarea
          name="message"
          required
          rows={5}
          className={`${inputCls} resize-y`}
        />
      </div>
      <SubmitButton label={labels.send} />
    </form>
  );
}
