import { normalise } from './model.mjs';
import { exploreRoles, roleById } from './roles.mjs';

// These are user-selected outbound searches, not imported or verified vacancies.
export function searchRoleOptions(profile, savedDirections = []) {
  const options = [], seen = new Set();
  const add = (title, reason) => {
    const key = normalise(title);
    if (!key || seen.has(key) || options.length >= 3) return;
    seen.add(key); options.push({ title, reason });
  };
  if (profile.targetRole?.trim()) add(profile.targetRole.trim().slice(0, 160), 'Your target role');
  else if (profile.currentRole?.trim()) add(profile.currentRole.trim().slice(0, 160), 'Your current role');
  for (const match of exploreRoles(profile, 3)) add(match.role.title, 'Related title to explore. ' + match.context.reason + (match.matches.length ? ' Confirmed skills: ' + match.matches.map(m => m.supplied).join(', ') : ' Review the requirements before applying.'));
  for (const id of savedDirections) {
    const role = roleById(id); if (role) add(role.title, 'A direction you saved to explore');
  }
  return options;
}
export function jobSearchLinks(role, location = '') {
  const title = String(role || '').trim().slice(0, 160);
  if (!title) return [];
  const place = String(location || '').trim().slice(0, 300) || 'United Kingdom';
  return [
    ['LinkedIn', 'https://www.linkedin.com/jobs/search/', { keywords: title, location: place }],
    ['Indeed', 'https://uk.indeed.com/jobs', { q: title, l: place }],
    ['CV-Library', 'https://www.cv-library.co.uk/search-jobs', { q: title, geo: place }]
  ].map(([site, base, parameters]) => {
    const url = new URL(base); for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, value);
    return { site, url: url.href };
  }).concat([
    {
      site: 'NIJobs',
      url: `https://www.nijobs.com/jobs/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}/in-${encodeURIComponent((String(location || '').trim() || 'Northern Ireland').slice(0, 300).toLowerCase().replace(/\s+/g, '-'))}`
    },
    { site: 'nijobfinder', url: 'https://www.nijobfinder.co.uk/jobs/', manualSearch: true }
  ]);
}
