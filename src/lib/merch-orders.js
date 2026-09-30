export function merchOrdersEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.MERCH_ORDERS_ENABLED === "true";
}

export function kotiOrdersEnabled() {
  // The Koti page is intentionally unlisted, but its direct share link must work
  // without requiring a separate Vercel environment variable.
  return true;
}

export function kurtaOrdersEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.KURTA_ORDERS_ENABLED === "true";
}
