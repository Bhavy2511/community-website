const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function keyFor(request) { return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"; }

export function loginAllowed(request) {
  const key = keyFor(request);
  const current = attempts.get(key);
  if (!current || current.resetAt < Date.now()) return true;
  return current.count < MAX_ATTEMPTS;
}

export function registerLoginFailure(request) {
  const key = keyFor(request);
  const current = attempts.get(key);
  const active = current && current.resetAt >= Date.now() ? current : { count: 0, resetAt: Date.now() + WINDOW_MS };
  attempts.set(key, { ...active, count: active.count + 1 });
}

export function clearLoginFailures(request) { attempts.delete(keyFor(request)); }
