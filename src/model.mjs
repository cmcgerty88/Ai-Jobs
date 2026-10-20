import { blankCv, cleanCv, cleanPacks } from './application-data.mjs';
import { cleanProgress, GOALS } from './progress-model.mjs';
import { normalise } from './skills.mjs';
export { normalise, findSkillMentions } from './skills.mjs';
export const STORAGE_KEY = 'rolebridge.private-profile.v1';
export const MAX_TEXT = 100_000;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const blankProfile = () => ({ name: '', currentRole: '', targetRole: '', evidence: '', skills: '', country: 'unknown', currency: 'GBP', minimumSalary: '', locations: '', workMode: 'any', maxOfficeDays: '5', hours: 'any', sponsorship: 'unknown', goal: 'clarity', expectedOutcome: '' });
export const blankState = () => ({ version: 1, profile: blankProfile(), jobs: [], roleDirections: [], feedback: { useful: '', return: '' }, cv: blankCv(), packs: [] });
const text = (value, limit = 4000) => typeof value === 'string' ? value.slice(0, limit) : '';
const choice = (value, options, fallback) => options.includes(value) ? value : fallback;
export function cleanProfile(value = {}) {
  const p = value && typeof value === 'object' ? value : {};
  return {
    name: text(p.name, 100), currentRole: text(p.currentRole, 160), targetRole: text(p.targetRole, 160), evidence: text(p.evidence, 12000), skills: text(p.skills, 2000),
    country: choice(p.country, ['GB', 'IE', 'unknown'], 'unknown'), currency: choice(p.currency, ['GBP', 'EUR'], 'GBP'),
    minimumSalary: numericInput(p.minimumSalary), locations: text(p.locations, 300),
    workMode: choice(p.workMode, ['any', 'remote', 'hybrid', 'onsite'], 'any'),
    maxOfficeDays: choice(String(p.maxOfficeDays), ['0', '1', '2', '3', '4', '5'], '5'),
    hours: choice(p.hours, ['any', 'full-time', 'part-time'], 'any'),
    sponsorship: choice(p.sponsorship, ['yes', 'no', 'unknown'], 'unknown'),
    goal: choice(p.goal, Object.keys(GOALS), 'clarity'), expectedOutcome: text(p.expectedOutcome, 300)
  };
}
export function numericInput(value) {
  if (value === '' || value === null || value === undefined) return '';
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 10_000_000 ? String(n) : '';
}
export function safeJobUrl(value) {
  if (!value || String(value).length > 3000 || !String(value).trim()) return '';
  try {
    const url = new URL(String(value).trim());
    if (url.protocol !== 'https:' || url.username || url.password) return '';
    return url.href;
  } catch { return ''; }
}
export function cleanJob(value = {}) {
  const j = value && typeof value === 'object' ? value : {};
  return {
    id: text(j.id, 80), title: text(j.title, 180), employer: text(j.employer, 180), url: safeJobUrl(j.url),
    description: text(j.description, 20000), country: choice(j.country, ['GB', 'IE', 'unknown'], 'unknown'),
    currency: choice(j.currency, ['GBP', 'EUR'], 'GBP'), salaryMin: numericInput(j.salaryMin), salaryMax: numericInput(j.salaryMax),
    location: text(j.location, 200), mode: choice(j.mode, ['remote', 'hybrid', 'onsite', 'unknown'], 'unknown'),
    officeDays: choice(String(j.officeDays), ['', '0', '1', '2', '3', '4', '5'], ''),
    hours: choice(j.hours, ['full-time', 'part-time', 'unknown'], 'unknown'),
    sponsorship: choice(j.sponsorship, ['yes', 'no', 'unknown'], 'unknown'),
    essentials: choice(j.essentials, ['yes', 'no', 'unknown'], 'unknown'),
    locationFits: choice(j.locationFits, ['yes', 'no', 'unknown'], 'unknown'),
    status: choice(j.status, ['unchecked', 'open', 'closed'], 'unchecked'),
    checkedAt: text(j.checkedAt, 40), selected: j.selected === true, progress: cleanProgress(j.progress),
    source: j.source?.provider === 'reed' ? { provider: 'reed', fetchedAt: text(j.source.fetchedAt, 40), expiresAt: text(j.source.expiresAt, 40), summaryOnly: true } : null
  };
}
export function serialiseState(value) {
  const jobs = (value.jobs || []).slice(0, 30).map(cleanJob).filter(j => j.id && j.title);
  return JSON.stringify({ version: 1, profile: cleanProfile(value.profile), jobs, roleDirections: cleanRoleDirections(value.roleDirections), feedback: cleanFeedback(value.feedback), cv: cleanCv(value.cv), packs: cleanPacks(value.packs, jobs.map(j => j.id)) });
}
export function cleanRoleDirections(value) {
  return Array.isArray(value) ? [...new Set(value.filter(id => typeof id === 'string' && /^[a-z][a-z0-9-]{0,59}$/.test(id)))].slice(0, 5) : [];
}
export function restoreState(raw) {
  if (!raw || raw.length > 900_000) throw new Error('Saved data is too large or empty.');
  const value = JSON.parse(raw);
  if (!value || value.version !== 1 || !value.profile || !Array.isArray(value.jobs)) throw new Error('Unrecognised saved profile.');
  const jobs = value.jobs.slice(0, 30).map(cleanJob).filter(j => j.id && j.title);
  return { version: 1, profile: cleanProfile(value.profile), jobs, roleDirections: cleanRoleDirections(value.roleDirections), feedback: cleanFeedback(value.feedback), cv: cleanCv(value.cv), packs: cleanPacks(value.packs, jobs.map(j => j.id)) };
}
export function hasPhrase(haystack, needle) { return (` ${normalise(haystack)} `).includes(` ${normalise(needle)} `); }
export function sharedSkills(profile, job) {
  return [...new Set(profile.skills.split(/[,;\n]/).map(s => s.trim()).filter(Boolean))].filter(skill => hasPhrase(job.description, skill));
}

export function cleanFeedback(value) { return { useful: choice(value?.useful, ['yes', 'partly', 'no'], ''), return: choice(value?.return, ['yes', 'maybe', 'no'], '') }; }
