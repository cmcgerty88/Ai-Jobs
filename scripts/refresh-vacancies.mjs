import { writeFile, rename } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { MAX_POOL_JOBS, parsePool, reedUrl } from '../src/vacancy-pool.mjs';

// Fixed public searches only. Never read a candidate profile, CV or browser query.
export const SEARCH_TOPICS = ['customer service', 'administration', 'operations', 'release manager', 'project coordinator', 'data analyst', 'sales', 'finance', 'human resources', 'IT support', 'engineering', 'healthcare', 'logistics', 'education', 'hospitality', 'retail'];
export function publicQueries() {
  // Search Northern Ireland explicitly as well as UK-wide, rather than relying only on a national first page.
  return SEARCH_TOPICS.flatMap(keywords => [
    { keywords, locationName: 'Northern Ireland' },
    { keywords, locationName: 'United Kingdom' }
  ]);
}
export function plainSummary(value) {
  if (typeof value !== 'string') return '';
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
  let result = value.slice(0, 80000);
  for (let i = 0; i < 2; i++) {
    result = result.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (all, code) => {
      if (code[0] !== '#') return entities[code.toLowerCase()] || all;
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : Number(code.slice(1));
      return n > 0 && n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff) ? String.fromCodePoint(n) : ' ';
    });
  }
  return result.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 20000);
}
export function closingTime(value) {
  if (!value) return '';
  if (typeof value !== 'string') return null;
  const uk = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : uk ? `${uk[3]}-${uk[2]}-${uk[1]}` : '';
  if (iso) {
    const ms = Date.parse(iso);
    if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0, 10) !== iso) return null;
    return new Date(ms + 86400000).toISOString();
  }
  // Require an explicit zone on timestamps; don't guess ambiguous provider dates.
  if (!/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null;
  const ms = Date.parse(value); return Number.isFinite(ms) ? new Date(ms).toISOString() : null;
}
export function convertListing(raw) {
  if (!raw || !/^\d{1,16}$/.test(String(raw.jobId))) return null;
  const id = `reed-${raw.jobId}`, title = plainSummary(raw.jobTitle).slice(0, 180), employer = plainSummary(raw.employerName).slice(0, 180);
  const location = plainSummary(raw.locationName).slice(0, 200), description = plainSummary(raw.jobDescription), url = reedUrl(raw.jobUrl);
  const expiresAt = closingTime(raw.expirationDate);
  if (!title || !employer || !url || description.length < 20 || expiresAt === null) return null;
  // Salary units and work eligibility are not asserted from search summaries.
  return { id, title, employer, location, description, url, expiresAt };
}
async function boundedJson(response) {
  if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}.`);
  const reader = response.body.getReader(); const chunks = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength; if (size > 4000000) throw new Error('Provider response is too large.');
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } finally { await reader.cancel().catch(() => {}); }
}
export async function collectPool({ apiKey, fetchImpl = fetch, now = Date.now(), pause = ms => new Promise(resolve => setTimeout(resolve, ms)) }) {
  if (typeof apiKey !== 'string' || !apiKey.trim()) throw new Error('REED_API_KEY is not configured. Existing pool left unchanged.');
  const jobs = new Map(); let successes = 0, failures = 0, received = 0, accepted = 0;
  for (const [index, query] of publicQueries().entries()) {
    if (index) await pause(350);
    const url = new URL('https://www.reed.co.uk/api/1.0/search');
    for (const [key, value] of Object.entries({ ...query, resultsToTake: '50', resultsToSkip: '0' })) url.searchParams.set(key, value);
    try {
      const response = await fetchImpl(url, { headers: { Authorization: `Basic ${Buffer.from(apiKey.trim() + ':').toString('base64')}`, Accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(15000) });
      if ([401, 403].includes(response.status)) throw new Error('auth');
      if (response.status === 429) throw new Error('rate-limit');
      const data = await boundedJson(response);
      if (!Array.isArray(data.results) || data.results.length > 1000) throw new Error('Unsupported provider response.');
      successes++; received += data.results.length;
      for (const raw of data.results) {
        const job = convertListing(raw); if (!job) continue;
        accepted++;
        if (job.expiresAt && Date.parse(job.expiresAt) <= now) continue;
        if (jobs.size < MAX_POOL_JOBS) jobs.set(job.id, job);
      }
    } catch (error) {
      if (error.message === 'auth') throw new Error('Reed did not authorise the request. Check the API account and secret. Existing pool left unchanged.');
      if (error.message === 'rate-limit') throw new Error('Reed rate limit reached. Existing pool left unchanged; wait before running again.');
      failures++;
    }
  }
  if (!successes || (received > 0 && accepted === 0)) throw new Error('No usable provider responses. Existing pool left unchanged.');
  const pool = { version: 1, provider: 'reed', status: 'ready', fetchedAt: new Date(now).toISOString(), partial: failures > 0, jobs: [...jobs.values()] };
  parsePool(pool, now); return pool;
}
async function main() {
  const pool = await collectPool({ apiKey: process.env.REED_API_KEY });
  const output = new URL('../data/vacancies.json', import.meta.url), temporary = new URL('../data/vacancies.tmp.json', import.meta.url);
  await writeFile(temporary, JSON.stringify(pool, null, 2) + '\n'); await rename(temporary, output);
  console.log(`Published ${pool.jobs.length} public listings${pool.partial ? ' with reduced coverage' : ''}. No candidate data processed.`);
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
