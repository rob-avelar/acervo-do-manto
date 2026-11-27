"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import type { AuthState } from "@/app/conta/actions";

export type AuthLabels = {
  name: string;
  email: string;
  password: string;
  passwordHint: string;
  confirmPassword: string;
  showPassword: string;
  hidePassword: string;
  submit: string;
  altPrompt: string;
  altLink: string;
  altHref: string;
  errors: Record<string, string>;
};

type Action = (prev: AuthState, formData: FormData) => Promise<AuthState>;

const inputCls =
  "w-full rounded-lg bg-ink border border-ink-600 px-3 py-2.5 pr-10 text-sm focus:border-gold outline-none";

function EyeToggle({
  show,
  onToggle,
  showLabel,
  hideLabel,
}: {
  show: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? hideLabel : showLabel}
      title={show ? hideLabel : showLabel}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold p-1"
      tabIndex={-1}
    >
      {show ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      )}
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
  const [show, setShow] = useState(false);
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");

  // No cadastro (showName), valida a confirmação localmente
  const mismatch = showName && confirm.length > 0 && pwd !== confirm;
  const inputType = show ? "text" : "password";

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
        <div className="relative">
          <input
            name="password"
            type={inputType}
            required
            minLength={6}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className={inputCls}
          />
          <EyeToggle
            show={show}
            onToggle={() => setShow((s) => !s)}
            showLabel={labels.showPassword}
            hideLabel={labels.hidePassword}
          />
        </div>
        {showName && (
          <p className="text-xs text-gray-500 mt-1">{labels.passwordHint}</p>
        )}
      </div>

      {showName && (
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            {labels.confirmPassword}
          </label>
          <div className="relative">
            <input
              name="confirmPassword"
              type={inputType}
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`${inputCls} ${
                mismatch ? "border-red-500/60" : ""
              }`}
            />
            <EyeToggle
              show={show}
              onToggle={() => setShow((s) => !s)}
              showLabel={labels.showPassword}
              hideLabel={labels.hidePassword}
            />
          </div>
          {mismatch && (
            <p className="text-xs text-red-400 mt-1">
              {labels.errors.passwordMismatch}
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={mismatch}
        className="w-full rounded-lg bg-gold text-ink font-semibold py-3 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition"
      >
        <SubmitLabel label={labels.submit} />
      </button>

      <p className="text-sm text-gray-400 text-center">
        {labels.altPrompt}{" "}
        <Link href={labels.altHref} className="text-gold underline">
          {labels.altLink}
        </Link>
      </p>
    </form>
  );
}

function SubmitLabel({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return <>{pending ? "..." : label}</>;
}
