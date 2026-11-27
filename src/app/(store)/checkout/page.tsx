"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/currency";
import { useCurrency } from "@/lib/use-currency";
import { useLang } from "@/lib/use-lang";
import { dict } from "@/lib/i18n";
import { sizeLabel } from "@/lib/sizes";
import { customizationLabel } from "@/lib/customization";
import {
  createOrder,
  createStripeCheckout,
  getCheckoutPrefill,
} from "./actions";

export default function CheckoutPage() {
  const { items, subtotalCents, clear } = useCart();
  const currency = useCurrency();
  const lang = useLang();
  const t = dict[lang].checkout;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [saveDefault, setSaveDefault] = useState(false);
  const [useDefault, setUseDefault] = useState(true);
  const [defaultAddr, setDefaultAddr] = useState<null | {
    country: string;
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  }>(null);

  // Há algum item personalizado (nome/número/patch) no carrinho?
  const hasCustomization = items.some(
    (i) => i.extraCents > 0 || Boolean(i.customization),
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    country: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  // País padrão: primeiro pelo IP do cliente (cookie "cc" do middleware),
  // senão pela moeda detectada. Enquanto o cliente não escolher manualmente.
  const [countryTouched, setCountryTouched] = useState(false);
  useEffect(() => {
    if (countryTouched) return;
    const SUPPORTED = [
      "BR", "PT", "ES", "FR", "DE", "IT", "GB", "IE", "NL", "US", "CA",
    ];
    const m =
      typeof document !== "undefined"
        ? document.cookie.match(/(?:^|;\s*)cc=([A-Za-z]{2})/)
        : null;
    const geo = m ? m[1].toUpperCase() : null;
    const def =
      (geo && (SUPPORTED.includes(geo) ? geo : "OT")) ||
      (currency === "BRL" ? "BR" : currency === "EUR" ? "PT" : "US");
    setForm((f) => (f.country === def ? f : { ...f, country: def }));
  }, [currency, countryTouched]);

  // Pré-preenche dados do cliente logado + endereço padrão (editável)
  useEffect(() => {
    getCheckoutPrefill().then((me) => {
      if (!me) return;
      setLoggedIn(true);
      setForm((f) => ({
        ...f,
        name: f.name || me.name,
        email: f.email || me.email,
        phone: f.phone || me.phone,
      }));
      if (me.address) {
        setDefaultAddr(me.address);
        // Pré-marca "usar padrão" e preenche o endereço
        setForm((f) => ({ ...f, ...me.address }));
        setCountryTouched(true);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Alterna entre usar o endereço padrão (preenche) ou digitar outro (limpa)
  function toggleUseDefault(use: boolean) {
    setUseDefault(use);
    if (use && defaultAddr) {
      setForm((f) => ({ ...f, ...defaultAddr }));
      setCountryTouched(true);
    } else {
      setForm((f) => ({
        ...f,
        cep: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      }));
    }
  }

  const isBrazil = form.country === "BR";

  const shippingCents = subtotalCents >= 30000 ? 0 : 2490;
  const totalCents = subtotalCents + shippingCents;

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function lookupCep(cep: string) {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((f) => ({
          ...f,
          street: data.logradouro || f.street,
          neighborhood: data.bairro || f.neighborhood,
          city: data.localidade || f.city,
          state: data.uf || f.state,
        }));
      }
    } catch {
      // ignora — usuário preenche manual
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Itens personalizados exigem consentimento (não têm direito a devolução)
    if (hasCustomization && !consent) {
      setError(t.customConsentError);
      return;
    }

    setLoading(true);

    const payload = {
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        cpf: form.cpf,
      },
      address: {
        country: form.country || "BR",
        cep: form.cep,
        street: form.street,
        number: form.number,
        complement: form.complement,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
      },
      items: items.map((i) => ({
        productId: i.productId,
        size: i.size,
        quantity: i.quantity,
        priceCents: i.priceCents,
        customization: i.customization,
      })),
      // Salva como padrão se marcou, ou se usou o padrão existente (reafirma)
      saveDefault: loggedIn && (saveDefault || (useDefault && !!defaultAddr)),
    };

    // Fora do Brasil → pagamento online via Stripe. Brasil → fluxo manual.
    if (currency === "USD" || currency === "EUR") {
      const result = await createStripeCheckout(payload, currency);
      if (result.ok) {
        clear();
        window.location.href = result.url; // vai para o checkout do Stripe
        return;
      }
      setLoading(false);
      setError(result.error);
      return;
    }

    const result = await createOrder(payload);
    setLoading(false);
    if (result.ok) {
      clear();
      router.push(`/pedido/${result.orderNumber}`);
    } else {
      setError(result.error);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 text-center py-24">
        <h1 className="font-display text-3xl font-bold mb-2">{t.empty}</h1>
        <Link href="/" className="text-gold underline">
          {dict[lang].cart.seeCatalog}
        </Link>
      </div>
    );
  }

  const input =
    "w-full rounded-lg border border-ink-600 bg-ink-800 text-white placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:border-gold";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">{t.title}</h1>
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Dados do cliente */}
          <fieldset className="space-y-3">
            <legend className="font-bold mb-2">{t.yourData}</legend>
            <input
              className={input}
              placeholder={t.fullName}
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className={input}
                type="email"
                placeholder={t.email}
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
              <input
                className={input}
                placeholder={t.phone}
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
              />
            </div>
            {isBrazil && (
              <input
                className={input}
                placeholder="CPF"
                value={form.cpf}
                onChange={(e) => set("cpf", e.target.value)}
              />
            )}
          </fieldset>

          {/* Endereço */}
          <fieldset className="space-y-3">
            <legend className="font-bold mb-2">{t.addressTitle}</legend>

            {/* Usar endereço padrão (cliente logado com endereço salvo) */}
            {loggedIn && defaultAddr && (
              <label className="flex items-center gap-2 text-sm text-gray-200 bg-ink-800 border border-ink-600 rounded-lg px-3 py-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDefault}
                  onChange={(e) => toggleUseDefault(e.target.checked)}
                  className="h-4 w-4 accent-gold"
                />
                {t.useDefaultAddress}
              </label>
            )}

            {/* País */}
            <select
              className={input}
              value={form.country || "BR"}
              onChange={(e) => {
                setCountryTouched(true);
                set("country", e.target.value);
              }}
            >
              <option value="BR">Brasil</option>
              <option value="PT">Portugal</option>
              <option value="ES">España</option>
              <option value="FR">France</option>
              <option value="DE">Deutschland</option>
              <option value="IT">Italia</option>
              <option value="GB">United Kingdom</option>
              <option value="IE">Ireland</option>
              <option value="NL">Netherlands</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="OT">Outro / Other</option>
            </select>

            {isBrazil ? (
              <>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    className={input}
                    placeholder={t.postal}
                    required
                    value={form.cep}
                    onChange={(e) => set("cep", e.target.value)}
                    onBlur={(e) => lookupCep(e.target.value)}
                  />
                  <div className="text-xs text-gray-400 self-center">
                    {cepLoading ? t.searching : t.autofill}
                  </div>
                </div>
                <input
                  className={input}
                  placeholder={t.street}
                  required
                  value={form.street}
                  onChange={(e) => set("street", e.target.value)}
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    className={input}
                    placeholder={t.number}
                    required
                    value={form.number}
                    onChange={(e) => set("number", e.target.value)}
                  />
                  <input
                    className={input}
                    placeholder={t.complement}
                    value={form.complement}
                    onChange={(e) => set("complement", e.target.value)}
                  />
                </div>
                <input
                  className={input}
                  placeholder={t.neighborhood}
                  required
                  value={form.neighborhood}
                  onChange={(e) => set("neighborhood", e.target.value)}
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    className={input}
                    placeholder={t.city}
                    required
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                  <input
                    className={input}
                    placeholder="UF"
                    required
                    maxLength={2}
                    value={form.state}
                    onChange={(e) => set("state", e.target.value.toUpperCase())}
                  />
                </div>
              </>
            ) : (
              <>
                <input
                  className={input}
                  placeholder={t.addressLine}
                  required
                  value={form.street}
                  onChange={(e) => set("street", e.target.value)}
                />
                <input
                  className={input}
                  placeholder={t.apt}
                  value={form.complement}
                  onChange={(e) => set("complement", e.target.value)}
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    className={input}
                    placeholder={t.city}
                    required
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                  <input
                    className={input}
                    placeholder={t.state}
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                  />
                </div>
                <input
                  className={input}
                  placeholder={t.postal}
                  required
                  value={form.cep}
                  onChange={(e) => set("cep", e.target.value)}
                />
              </>
            )}

            {/* Salvar este endereço como padrão (logado, ao digitar/editar) */}
            {loggedIn && (!defaultAddr || !useDefault) && (
              <label className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={saveDefault}
                  onChange={(e) => setSaveDefault(e.target.checked)}
                  className="h-4 w-4 accent-gold"
                />
                {t.saveAsDefault}
              </label>
            )}
          </fieldset>

          <p className="text-xs text-gray-400">
            {currency === "USD" || currency === "EUR"
              ? t.payNoteCard
              : t.payNote}
          </p>
        </div>

        {/* Resumo */}
        <div className="border border-ink-600 bg-ink-800 rounded-xl p-5 h-fit">
          <h2 className="font-display text-xl font-bold mb-4">{t.yourOrder}</h2>
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {items.map((i) => (
              <div
                key={i.lineId}
                className="flex justify-between text-sm"
              >
                <span className="text-gray-300 truncate pr-2">
                  {i.quantity}× {i.name} ({sizeLabel(i.size, lang)})
                  {i.customization && (
                    <span className="block text-gold text-xs">
                      {customizationLabel(i.customization, lang)}
                    </span>
                  )}
                </span>
                <span className="whitespace-nowrap">
                  {formatMoney(
                    (i.priceCents + i.extraCents) * i.quantity,
                    currency,
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-ink-600 pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">{dict[lang].cart.subtotal}</span>
              <span>{formatMoney(subtotalCents, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{dict[lang].cart.shipping}</span>
              <span>
                {shippingCents === 0
                  ? t.free
                  : formatMoney(shippingCents, currency)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1">
              <span>{t.total}</span>
              <span className="text-gold">{formatMoney(totalCents, currency)}</span>
            </div>
          </div>

          {hasCustomization && (
            <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
              <p className="text-xs text-amber-200 leading-relaxed">
                {t.customNotice}
              </p>
              <label className="mt-3 flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-gold shrink-0"
                />
                <span className="text-xs text-gray-200">{t.customConsent}</span>
              </label>
              <Link
                href="/trocas"
                target="_blank"
                className="mt-2 inline-block text-xs text-gold underline"
              >
                {t.policyLink}
              </Link>
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || (hasCustomization && !consent)}
            className="mt-4 w-full rounded-lg bg-gold text-ink py-3 font-semibold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? t.processing
              : currency === "USD" || currency === "EUR"
                ? t.payCard
                : t.confirm}
          </button>
        </div>
      </form>
    </div>
  );
}
