"use client";

import { useState } from "react";
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

export type ContactLabels = {
  name: string;
  email: string;
  subject: string;
  subjectGeneral: string;
  subjectOrder: string;
  subjectExchange: string;
  subjectOther: string;
  orderNumber: string; // label quando opcional
  orderNumberReq: string; // label quando obrigatório
  message: string;
  send: string;
  sent: string;
  errors: Record<string, string>;
};

export function ContactForm({
  labels,
  defaultName = "",
  defaultEmail = "",
}: {
  labels: ContactLabels;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, action] = useFormState<ContactState, FormData>(
    sendContactAction,
    {},
  );
  const [subject, setSubject] = useState("general");

  // Pedido obrigatório quando o assunto for sobre um pedido / troca
  const orderRequired = subject === "order" || subject === "exchange";

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
          {labels.subject}
        </label>
        <select
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={inputCls}
        >
          <option value="general">{labels.subjectGeneral}</option>
          <option value="order">{labels.subjectOrder}</option>
          <option value="exchange">{labels.subjectExchange}</option>
          <option value="other">{labels.subjectOther}</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">
          {orderRequired ? labels.orderNumberReq : labels.orderNumber}
          {orderRequired && <span className="text-gold"> *</span>}
        </label>
        <input
          name="orderNumber"
          type="text"
          required={orderRequired}
          placeholder="AM-..."
          className={inputCls}
        />
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
