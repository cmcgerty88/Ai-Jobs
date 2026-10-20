import { cleanJob, hasPhrase, normalise, safeJobUrl, sharedSkills } from './model.mjs';

export const POOL_MAX_AGE = 72 * 60 * 60 * 1000;
export const MAX_POOL_JOBS = 1000;
const text = (value, max) => typeof value === 'string' ? value.slice(0, max).trim() : '';
export function reedUrl(value) {
  const safe = safeJobUrl(value);
  if (!safe) return '';
  const url = new URL(safe);
  return ['www.reed.co.uk', 'reed.co.uk'].includes(url.hostname) && url.pathname.startsWith('/jobs/') && url.port === '' ? safe : '';
}
export function parsePool(value, now = Date.now()) {
  if (!value || value.version !== 1 || value.provider !== 'reed' || !Array.isArray(value.jobs) || value.jobs.length > MAX_POOL_JOBS) throw new Error('Unsupported vacancy pool.');
  if (value.status === 'not_configured' && value.jobs.length === 0) return { status: 'not_configured', jobs: [], fetchedAt: '', partial: false };
  if (value.status !== 'ready') throw new Error('Unsupported vacancy pool status.');
  const fetchedAt = Date.parse(value.fetchedAt);
  if (!Number.isFinite(fetchedAt) || fetchedAt > now + 60000) throw new Error('Invalid vacancy refresh date.');
  const stale = now - fetchedAt > POOL_MAX_AGE;
  const seen = new Set();
  const jobs = value.jobs.flatMap(raw => {
    if (!raw || !/^reed-\d{1,16}$/.test(raw.id) || seen.has(raw.id)) return [];
    const url = reedUrl(raw.url), title = text(raw.title, 180), employer = text(raw.employer, 180);
    const description = text(raw.description, 20000), location = text(raw.location, 200);
    const expiresAt = raw.expiresAt ? Date.parse(raw.expiresAt) : NaN;
    if (!url || !title || !employer || description.length < 20 || (raw.expiresAt && !Number.isFinite(expiresAt))) return [];
    seen.add(raw.id);
    if (Number.isFinite(expiresAt) && expiresAt <= now) return [];
    // Search-result summaries cannot prove essentials, sponsorship, working pattern or work authorisation.
    return [{ ...cleanJob({ id: raw.id, url, title, employer, description, location }),
      source: { provider: 'reed', fetchedAt: new Date(fetchedAt).toISOString(), expiresAt: Number.isFinite(expiresAt) ? new Date(expiresAt).toISOString() : '', summaryOnly: true } }];
  });
  return { status: stale ? 'stale' : 'ready', fetchedAt: new Date(fetchedAt).toISOString(), partial: value.partial === true, jobs: stale ? [] : jobs };
}
const stopWords = new Set(['a', 'an', 'and', 'the', 'of', 'in', 'for', 'to', 'with']);
export function titleTokens(value) { return [...new Set(normalise(value).split(' ').filter(w => w.length > 1 && !stopWords.has(w)))]; }
export function rankVacancies(jobs, profile, { targetRole = profile.targetRole || '', location = profile.locations || '' } = {}) {
  const target = titleTokens(targetRole);
  const locations = location.split(/[,;\n]/).map(s => s.trim()).filter(Boolean);
  const matches = [];
  for (const job of jobs) {
    if (locations.length && !locations.some(place => hasPhrase(job.location, place))) continue;
    const skills = sharedSkills(profile, job);
    const tokens = titleTokens(job.title);
    const common = target.filter(word => tokens.includes(word));
    const exactTitle = target.length > 0 && hasPhrase(job.title, targetRole);
    // An explicit target takes precedence. Skills alone cannot pull in an unrelated title.
    if (target.length ? common.length < Math.ceil(target.length * 0.75) : skills.length < 2) continue;
    const reasons = [];
    if (exactTitle) reasons.push(`Title includes “${text(targetRole, 160)}”.`);
    else if (common.length) reasons.push(`Title shares: ${common.join(', ')}.`);
    if (skills.length) reasons.push(`Advert summary mentions your confirmed skills: ${skills.slice(0, 6).join(', ')}.`);
    if (locations.length) reasons.push(`Listed location: ${job.location}.`);
    matches.push({ job, reasons, order: (exactTitle ? 100 : 0) + common.length * 10 + Math.min(skills.length, 9) });
  }
  return matches.sort((a, b) => b.order - a.order || a.job.title.localeCompare(b.job.title) || a.job.id.localeCompare(b.job.id));
}
