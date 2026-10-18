// Device-only encryption. No server identity, password recovery or shared secret.
export const VAULT_KEY = 'rolebridge.encrypted-workspace.v1';
export const RETENTION_MS = 30 * 86400000;
const ITERATIONS = 600000;
const encoder = new TextEncoder();
const b64 = bytes => { let s = ''; for (const b of bytes) s += String.fromCharCode(b); return btoa(s); };
const bytes = value => Uint8Array.from(atob(value), c => c.charCodeAt(0));
const header = v => encoder.encode(JSON.stringify([v.version, v.iterations, v.salt, v.expiresAt]));
export function parseVault(raw) {
  if (typeof raw !== 'string' || raw.length > 1600000) throw new Error('Invalid workspace.');
  const v = JSON.parse(raw);
  if (!v || v.version !== 1 || v.iterations !== ITERATIONS || !Number.isSafeInteger(v.expiresAt) || v.expiresAt <= 0 ||
      typeof v.salt !== 'string' || typeof v.iv !== 'string' || typeof v.data !== 'string' || bytes(v.salt).length !== 16 || bytes(v.iv).length !== 12 || bytes(v.data).length < 16) throw new Error('Invalid workspace.');
  return v;
}
export const PASSWORD_REQUIREMENTS = 'Use 14–256 characters, including at least one uppercase letter and one special character (for example !, @ or #).';
export async function newKey(password) {
  if (typeof password !== 'string' || password.length < 14 || password.length > 256 || !/\p{Lu}/u.test(password) || !/[\p{P}\p{S}]/u.test(password)) throw new Error(PASSWORD_REQUIREMENTS);
  return deriveKey(password, crypto.getRandomValues(new Uint8Array(16)));
}
// Unlock uses the original length rules: changing creation policy must not lock
// existing users out of their encrypted workspace or backups.
async function deriveKey(password, salt) {
  if (typeof password !== 'string' || password.length < 14 || password.length > 256) throw new Error('Enter your existing password (14–256 characters).');
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: ITERATIONS }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  return { key, salt: b64(salt) };
}
export async function seal(json, session, now = Date.now()) {
  if (typeof json !== 'string' || json.length > 900000) throw new Error('Workspace is too large.');
  const v = { version: 1, iterations: ITERATIONS, salt: session.salt, expiresAt: now + RETENTION_MS, iv: b64(crypto.getRandomValues(new Uint8Array(12))) };
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: bytes(v.iv), additionalData: header(v) }, session.key, encoder.encode(json));
  const raw = JSON.stringify({ ...v, data: b64(new Uint8Array(data)) });
  // Multibyte document text can exceed the restore limit even when its string
  // length is below the plaintext limit. Never write a vault that cannot be reopened.
  if (raw.length > 1600000) throw new Error('Workspace is too large. Remove older vacancies or shorten document notes before saving.');
  return raw;
}
export async function unseal(raw, password, now = Date.now()) {
  const v = parseVault(raw);
  if (v.expiresAt <= now) throw new Error('This workspace has expired.');
  const session = await deriveKey(password, bytes(v.salt));
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(v.iv), additionalData: header(v) }, session.key, bytes(v.data));
  return { session, json: new TextDecoder('utf-8', { fatal: true }).decode(plain) };
}
