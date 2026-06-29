// lib/email-domain.ts
// Server-side only — cheap anti-abuse check at registration: does this
// email's domain even have a mail server? Filters typos and garbage
// domains (asdf@asdf.com, test@test.test) instantly, with zero dependency
// on actual delivery succeeding — unlike email verification, this can
// never lock out a real student whose institution's mail gateway happens
// to block a specific sender.
import dns from 'dns';

const LOOKUP_TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); }
    );
  });
}

/** true = found, false = definitively no such record, null = inconclusive (timeout/transient) */
async function tryLookup(fn: () => Promise<unknown[]>): Promise<boolean | null> {
  try {
    const result = await withTimeout(fn(), LOOKUP_TIMEOUT_MS);
    return Array.isArray(result) && result.length > 0;
  } catch (err) {
    const code = (err as { code?: string })?.code;
    if (code === 'ENOTFOUND' || code === 'ENODATA') return false;
    return null; // our own timeout, or some other transient/network error
  }
}

/**
 * Fail-open by design: a transient/timed-out lookup never blocks
 * registration — only a domain that *definitively* has no MX, A, or AAAA
 * record (i.e. doesn't exist at all) is rejected.
 */
export async function domainAcceptsMail(domain: string): Promise<boolean> {
  const results = await Promise.all([
    tryLookup(() => dns.promises.resolveMx(domain)),
    tryLookup(() => dns.promises.resolve4(domain)),
    tryLookup(() => dns.promises.resolve6(domain)),
  ]);

  if (results.some((r) => r === true)) return true;
  if (results.some((r) => r === null)) return true; // inconclusive — fail open
  return false; // all three definitively came back empty/nonexistent
}
