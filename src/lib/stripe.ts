import Stripe from "stripe";

// Cliente Stripe criado sob demanda (evita erro no build quando a chave
// ainda não está definida no ambiente).
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY não configurada");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export function hasStripe() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
