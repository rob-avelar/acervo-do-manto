"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/currency";
import { useCurrency } from "@/lib/use-currency";
import { createOrder, createStripeCheckout } from "./actions";

export default function CheckoutPage() {
  const { items, subtotalCents, clear } = useCart();
  const currency = useCurrency();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);

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

  // País padrão conforme a moeda detectada (só se ainda não escolhido)
  useEffect(() => {
    setForm((f) => {
      if (f.country) return f;
      const def =
        currency === "BRL" ? "BR" : currency === "EUR" ? "PT" : "US";
      return { ...f, country: def };
    });
  }, [currency]);

  const isBrazil = (form.country || "BR") === "BR";

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
      })),
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
        <h1 className="font-display text-3xl font-bold mb-2">Carrinho vazio</h1>
        <Link href="/" className="text-gold underline">
          Ver catálogo
        </Link>
      </div>
    );
  }

  const input =
    "w-full rounded-lg border border-ink-600 bg-ink-800 text-white placeholder-gray-500 px-3 py-2 text-sm focus:outline-none focus:border-gold";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold mb-6">Finalizar pedido</h1>
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Dados do cliente */}
          <fieldset className="space-y-3">
            <legend className="font-bold mb-2">Seus dados</legend>
            <input
              className={input}
              placeholder="Nome completo"
              required
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                className={input}
                type="email"
                placeholder="E-mail"
                required
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
              <input
                className={input}
                placeholder="Telefone / WhatsApp"
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
            <legend className="font-bold mb-2">
              {isBrazil ? "Endereço de entrega" : "Shipping address"}
            </legend>

            {/* País */}
            <select
              className={input}
              value={form.country || "BR"}
              onChange={(e) => set("country", e.target.value)}
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
                    placeholder="CEP"
                    required
                    value={form.cep}
                    onChange={(e) => set("cep", e.target.value)}
                    onBlur={(e) => lookupCep(e.target.value)}
                  />
                  <div className="text-xs text-gray-400 self-center">
                    {cepLoading ? "Buscando endereço..." : "Preenche automático"}
                  </div>
                </div>
                <input
                  className={input}
                  placeholder="Rua / logradouro"
                  required
                  value={form.street}
                  onChange={(e) => set("street", e.target.value)}
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    className={input}
                    placeholder="Número"
                    required
                    value={form.number}
                    onChange={(e) => set("number", e.target.value)}
                  />
                  <input
                    className={input}
                    placeholder="Complemento (opcional)"
                    value={form.complement}
                    onChange={(e) => set("complement", e.target.value)}
                  />
                </div>
                <input
                  className={input}
                  placeholder="Bairro"
                  required
                  value={form.neighborhood}
                  onChange={(e) => set("neighborhood", e.target.value)}
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    className={input}
                    placeholder="Cidade"
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
                  placeholder="Address line (street, number)"
                  required
                  value={form.street}
                  onChange={(e) => set("street", e.target.value)}
                />
                <input
                  className={input}
                  placeholder="Apartment / unit (optional)"
                  value={form.complement}
                  onChange={(e) => set("complement", e.target.value)}
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    className={input}
                    placeholder="City"
                    required
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                  <input
                    className={input}
                    placeholder="State / Province"
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                  />
                </div>
                <input
                  className={input}
                  placeholder="Postal code / ZIP"
                  required
                  value={form.cep}
                  onChange={(e) => set("cep", e.target.value)}
                />
              </>
            )}
          </fieldset>

          <p className="text-xs text-gray-400">
            {currency === "USD" || currency === "EUR"
              ? "💳 You'll be redirected to a secure card payment page (Stripe)."
              : "💳 O pagamento (Pix, boleto ou cartão) será combinado após a confirmação do pedido."}
          </p>
        </div>

        {/* Resumo */}
        <div className="border border-ink-600 bg-ink-800 rounded-xl p-5 h-fit">
          <h2 className="font-display text-xl font-bold mb-4">Seu pedido</h2>
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {items.map((i) => (
              <div
                key={`${i.slug}-${i.size}`}
                className="flex justify-between text-sm"
              >
                <span className="text-gray-300 truncate pr-2">
                  {i.quantity}× {i.name} ({i.size})
                </span>
                <span className="whitespace-nowrap">
                  {formatMoney(i.priceCents * i.quantity, currency)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-ink-600 pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span>{formatMoney(subtotalCents, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Frete</span>
              <span>
                {shippingCents === 0 ? "Grátis" : formatMoney(shippingCents, currency)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1">
              <span>Total</span>
              <span className="text-gold">{formatMoney(totalCents, currency)}</span>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-gold text-ink py-3 font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {loading
              ? "Processando..."
              : currency === "USD" || currency === "EUR"
                ? "Pagar com cartão"
                : "Confirmar pedido"}
          </button>
        </div>
      </form>
    </div>
  );
}
