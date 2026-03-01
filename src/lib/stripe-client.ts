import { loadStripe } from "@stripe/stripe-js";

let promise: ReturnType<typeof loadStripe> | null = null;

export function getStripe() {
  if (!promise) {
    promise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return promise;
}
