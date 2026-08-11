"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatBRL } from "@/lib/currency";
import { createOrder } from "./actions";

export default function CheckoutPage() {
  const { items, subtotalCents, clear } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

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
    const result = await createOrder({
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        cpf: form.cpf,
      },
      address: {
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
    });
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
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-2">Carrinho vazio</h1>
        <Link href="/" className="text-manto underline">
          Ver catálogo
        </Link>
      </div>
    );
  }

  const input =
    "w-full rounded border px-3 py-2 text-sm focus:outline-none focus:border-manto";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Finalizar pedido</h1>
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
            <input
              className={input}
              placeholder="CPF"
              value={form.cpf}
              onChange={(e) => set("cpf", e.target.value)}
            />
          </fieldset>

          {/* Endereço */}
          <fieldset className="space-y-3">
            <legend className="font-bold mb-2">Endereço de entrega</legend>
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
          </fieldset>

          <p className="text-xs text-gray-400">
            💳 O pagamento (Pix, boleto ou cartão) será combinado após a
            confirmação do pedido.
          </p>
        </div>

        {/* Resumo */}
        <div className="border rounded-lg p-4 h-fit">
          <h2 className="font-bold mb-4">Seu pedido</h2>
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {items.map((i) => (
              <div
                key={`${i.slug}-${i.size}`}
                className="flex justify-between text-sm"
              >
                <span className="text-gray-600 truncate pr-2">
                  {i.quantity}× {i.name} ({i.size})
                </span>
                <span className="whitespace-nowrap">
                  {formatBRL(i.priceCents * i.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatBRL(subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Frete</span>
              <span>
                {shippingCents === 0 ? "Grátis" : formatBRL(shippingCents)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-base pt-1">
              <span>Total</span>
              <span className="text-manto">{formatBRL(totalCents)}</span>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-manto text-white py-3 font-medium disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Confirmar pedido"}
          </button>
        </div>
      </form>
    </div>
  );
}
