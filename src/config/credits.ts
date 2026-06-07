import type { CreditPool } from "../types/index.js";

/**
 * Standard sell rates from credit-policy.md §9.
 * Watch: $0.05/credit → $1 buys 20 credits.
 * Create: $0.10/credit → $1 buys 10 credits.
 */
export const CREDIT_CENTS_PER_UNIT: Record<CreditPool, number> = {
  watch: 5,
  create: 10,
};

export const CREDITS_PER_DOLLAR: Record<CreditPool, number> = {
  watch: 20,
  create: 10,
};

export function defaultPurchaseCredits(pool: CreditPool): number {
  return CREDITS_PER_DOLLAR[pool];
}

export function priceCentsForCredits(pool: CreditPool, credits: number): number {
  return Math.max(1, credits) * CREDIT_CENTS_PER_UNIT[pool];
}

export function formatCreditPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
