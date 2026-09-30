const attempts = new Map();

function clientKey(request, action) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return `${action}:${address}`;
}

export function chandaActionAllowed(request, action, maximum, windowMs) {
  if (attempts.size > 5000) {
    const now = Date.now();
    for (const [key, value] of attempts) if (value.resetAt <= now) attempts.delete(key);
  }
  const key = clientKey(request, action);
  const current = attempts.get(key);
  if (!current || current.resetAt <= Date.now()) {
    attempts.set(key, { count: 1, resetAt: Date.now() + windowMs });
    return true;
  }
  if (current.count >= maximum) return false;
  current.count += 1;
  return true;
}
