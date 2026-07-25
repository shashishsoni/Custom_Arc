import { badRequest } from '../errors.ts'

/** Enrich TLS/cert failures with a Bun-oriented hint. */
export function tlsHint(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (/certificate|CERT_|SSL|TLS|unable to get local issuer/i.test(msg)) {
    return `${msg} (Bun TLS — ensure NODE_USE_SYSTEM_CA=1; check antivirus HTTPS scanning)`
  }
  return msg
}

/** `fetch` that maps network/TLS failures to a 400 with a labeled message. */
export async function fetchOrThrow(
  label: string,
  url: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch (e) {
    throw badRequest(`${label}: ${tlsHint(e)}`)
  }
}
