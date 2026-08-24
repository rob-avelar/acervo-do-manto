import Stripe from "stripe";

// Cliente Stripe (usa a chave secreta do ambiente).
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export function hasStripe() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
