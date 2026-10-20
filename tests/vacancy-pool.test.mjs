import test from 'node:test';
import assert from 'node:assert/strict';
import { blankProfile, blankState, serialiseState, restoreState } from '../src/model.mjs';
import { parsePool, rankVacancies, POOL_MAX_AGE } from '../src/vacancy-pool.mjs';
import { collectPool, convertListing, publicQueries, closingTime } from '../scripts/refresh-vacancies.mjs';
const now = Date.parse('2026-10-19T12:00:00Z');
const listing = (id = 1, patch = {}) => ({ jobId: id, jobTitle: 'Operations manager', employerName: 'Synthetic employer', locationName: 'Belfast', jobDescription: '<p>Use Excel and scheduling to coordinate customer service.</p>', jobUrl: `https://www.reed.co.uk/jobs/synthetic/${id}`, expirationDate: '31/10/2026', ...patch });
const pool = (jobs, patch = {}) => ({ version: 1, status: 'ready', provider: 'reed', fetchedAt: new Date(now).toISOString(), partial: false, jobs, ...patch });

test('provider summaries are text, links stay on Reed and salary/eligibility are never invented', () => {
  const raw = listing(1, { jobDescription: '&lt;p&gt;Excel &amp; scheduling&lt;/p&gt;<script>danger()</script>', minimumSalary: 30, maximumSalary: 40 });
  const job = convertListing(raw);
  // Too-short summaries are rejected rather than silently filled with generated descriptions.
  assert.equal(job, null);
});

test('normalised real-provider contract imports safely and rejects executable or off-provider URLs', () => {
  const job = convertListing(listing(1, { jobDescription: '&lt;p&gt;Excel &amp; scheduling for customer service.&lt;/p&gt;<script>danger()</script>' }));
  assert.equal(job.description, 'Excel & scheduling for customer service.');
  for (const jobUrl of ['javascript:alert(1)', 'https://reed.co.uk.evil.example/jobs/1', 'https://name:password@www.reed.co.uk/jobs/1', 'https://example.com/jobs/1']) assert.equal(convertListing(listing(1, { jobUrl })), null);
  const imported = parsePool(pool([job]), now).jobs[0];
  for (const key of ['status', 'essentials', 'sponsorship', 'mode', 'country']) assert.equal(imported[key], key === 'status' ? 'unchecked' : 'unknown');
  assert.equal(imported.checkedAt, ''); assert.equal(imported.salaryMin, ''); assert.equal(imported.source.summaryOnly, true);
});

test('stale, future, malformed, duplicate and expired listings cannot appear as current suggestions', () => {
  const good = convertListing(listing());
  assert.equal(parsePool(pool([good, good]), now).jobs.length, 1);
  assert.equal(parsePool(pool([good]), now + POOL_MAX_AGE + 1).status, 'stale');
  assert.equal(parsePool(pool([good]), now + POOL_MAX_AGE + 1).jobs.length, 0);
  assert.throws(() => parsePool(pool([good], { fetchedAt: '2027-01-01' }), now), /date/);
  assert.equal(parsePool(pool([{ ...good, expiresAt: '2026-10-01' }]), now).jobs.length, 0);
  assert.equal(parsePool(pool([{ ...good, expiresAt: 'not a date' }]), now).jobs.length, 0);
  assert.throws(() => parsePool(pool([good], { status: 'invented' }), now));
  assert.equal(closingTime('31/02/2026'), null);
  assert.equal(closingTime('31/10/2026'), '2026-11-01T00:00:00.000Z');
});

test('target title takes priority over skill overlap, location is explicit and no unrelated fallback is returned', () => {
  const jobs = parsePool(pool([convertListing(listing(1)), convertListing(listing(2, { jobTitle: 'Software developer' })), convertListing(listing(3, { locationName: 'London' }))]), now).jobs;
  const profile = { ...blankProfile(), targetRole: 'operations manager', skills: 'Excel, scheduling' };
  const ranked = rankVacancies(jobs, profile, { targetRole: profile.targetRole, location: 'Belfast' });
  assert.deepEqual(ranked.map(v => v.job.id), ['reed-1']);
  assert.ok(ranked[0].reasons.some(r => r.includes('Excel')));
  assert.equal(rankVacancies(jobs, { ...profile, targetRole: 'neurosurgeon' }).length, 0);
  assert.equal(rankVacancies(jobs, { ...profile, targetRole: '', skills: 'Excel' }).length, 0);
  assert.equal(rankVacancies(jobs, { ...profile, targetRole: '', skills: 'I have no Excel, not scheduling' }).length, 0);
  assert.equal(rankVacancies(jobs, { ...profile, targetRole: '', skills: 'Excel, scheduling' }).length, 3);
});

test('target role and imported provenance round-trip inside the existing encrypted-state payload; raw CV stays excluded', () => {
  const state = blankState(); state.profile.targetRole = 'Operations manager'; state.profile.rawCV = 'PRIVATE_CV';
  state.jobs = parsePool(pool([convertListing(listing())]), now).jobs;
  const raw = serialiseState(state), restored = restoreState(raw);
  assert.equal(restored.profile.targetRole, 'Operations manager');
  assert.equal(restored.jobs[0].source.provider, 'reed'); assert.equal(restored.jobs[0].status, 'unchecked');
  assert.ok(!raw.includes('PRIVATE_CV'));
  assert.equal(restoreState(JSON.stringify({ version: 1, profile: {}, jobs: [] })).profile.targetRole, '');
});

test('collector uses fixed public UK/NI queries, no candidate inputs, and no credential-bearing URLs or redirects', async () => {
  const calls = [];
  const result = await collectPool({ apiKey: 'SYNTHETIC_API_KEY', now, pause: async () => {}, fetchImpl: async (url, options) => {
    calls.push({ url, options }); return new Response(JSON.stringify({ results: [listing()] }), { status: 200 });
  } });
  assert.equal(result.jobs.length, 1); assert.equal(calls.length, publicQueries().length);
  assert.ok(calls.some(c => c.url.searchParams.get('locationName') === 'Northern Ireland'));
  assert.ok(calls.some(c => c.url.searchParams.get('locationName') === 'United Kingdom'));
  assert.ok(calls.some(c => c.url.searchParams.get('keywords') === 'release manager' && c.url.searchParams.get('locationName') === 'Northern Ireland'));
  assert.ok(calls.every(c => !c.url.toString().includes('SYNTHETIC_API_KEY') && c.options.redirect === 'error'));
  assert.ok(!JSON.stringify(result).includes('SYNTHETIC_API_KEY'));
});

test('Release Manager in Belfast is matched when present, without substituting other management roles', () => {
  const jobs = parsePool(pool([
    convertListing(listing(1, { jobTitle: 'Senior Release Manager', locationName: 'Belfast' })),
    convertListing(listing(2, { jobTitle: 'Release Manager', locationName: 'London' })),
    convertListing(listing(3, { jobTitle: 'Operations Manager', locationName: 'Belfast' }))
  ]), now).jobs;
  const profile = { ...blankProfile(), targetRole: 'Release Manager', locations: 'Belfast', skills: 'Excel, scheduling' };
  assert.deepEqual(rankVacancies(jobs, profile).map(item => item.job.id), ['reed-1']);
  assert.deepEqual(rankVacancies(jobs, profile, { location: '' }).map(item => item.job.id).sort(), ['reed-1', 'reed-2']);
});

test('collector fails closed without keys, on rejected credentials, rate limits or total outage; partial coverage is explicit', async () => {
  await assert.rejects(collectPool({ apiKey: '' }), /not configured/);
  for (const status of [401, 403, 429, 500]) {
    let calls = 0;
    await assert.rejects(collectPool({ apiKey: 'SYNTHETIC', now, pause: async () => {}, fetchImpl: async () => { calls++; return new Response('', { status }); } }));
    if (status !== 500) assert.equal(calls, 1);
  }
  let n = 0;
  const result = await collectPool({ apiKey: 'SYNTHETIC', now, pause: async () => {}, fetchImpl: async () => ++n === 1 ? new Response('', { status: 500 }) : new Response(JSON.stringify({ results: [listing()] })) });
  assert.equal(result.partial, true); assert.equal(result.jobs.length, 1);
  await assert.rejects(collectPool({ apiKey: 'SYNTHETIC', now, pause: async () => {}, fetchImpl: async () => new Response(JSON.stringify({ results: [{ unexpected: 'shape' }] })) }), /No usable/);
});

test('popular-site searches encode only a chosen role/location and related titles require reviewed skill connections', async () => {
  const { jobSearchLinks, searchRoleOptions } = await import('../src/job-search-links.mjs');
  const profile = { ...blankProfile(), targetRole: 'Operations & reporting manager', name: 'PRIVATE_NAME', evidence: 'PRIVATE_CV', skills: 'Customer service, Excel' };
  const options = searchRoleOptions(profile);
  assert.equal(options[0].title, profile.targetRole); assert.equal(options.length, 1, 'generic customer service skills must not redirect a manager to a support occupation');
  const related = searchRoleOptions({ ...profile, targetRole: 'Release Manager', skills: 'Release planning, ITIL, IT change control, CI/CD, Stakeholder management' });
  assert.equal(related[0].title, 'Release Manager');
  assert.ok(related.slice(1).every(o => o.reason.includes('Related title') && /change|delivery/i.test(o.title)));
  const links = jobSearchLinks(options[0].title, 'Belfast & nearby');
  assert.deepEqual(links.map(l => new URL(l.url).hostname), ['www.linkedin.com', 'uk.indeed.com', 'www.cv-library.co.uk', 'www.nijobs.com', 'www.nijobfinder.co.uk']);
  assert.equal(new URL(links[0].url).searchParams.get('keywords'), profile.targetRole);
  assert.equal(new URL(links[0].url).searchParams.get('location'), 'Belfast & nearby');
  assert.equal(new URL(links[1].url).searchParams.get('q'), profile.targetRole);
  assert.equal(new URL(links[2].url).searchParams.get('q'), profile.targetRole);
  assert.equal(new URL(links[2].url).searchParams.has('keywords'), false);
  assert.equal(new URL(links[2].url).searchParams.get('geo'), 'Belfast & nearby');
  assert.equal(new URL(links[3].url).pathname, '/jobs/operations-%26-reporting-manager/in-belfast-%26-nearby');
  const finder = new URL(links[4].url);
  assert.equal(finder.pathname, '/jobs/', 'do not carry over the example link’s transport/warehousing category');
  assert.equal(finder.searchParams.get('Keywords'), profile.targetRole);
  assert.deepEqual([...finder.searchParams.keys()], ['Keywords']);
  assert.equal(finder.hash, '#browsing');
  assert.equal(jobSearchLinks('Release Manager', 'Belfast')[4].url, 'https://www.nijobfinder.co.uk/jobs/?Keywords=Release+Manager#browsing');
  assert.equal(new URL(jobSearchLinks('Release Manager')[3].url).pathname, '/jobs/release-manager/in-northern-ireland');
  assert.ok(!JSON.stringify(links).includes('PRIVATE_')); assert.ok(!JSON.stringify(links).includes('Excel'));
  assert.equal(new URL(jobSearchLinks('Coordinator')[0].url).searchParams.get('location'), 'United Kingdom');
  assert.deepEqual(jobSearchLinks(''), []);
  assert.deepEqual(searchRoleOptions({ ...blankProfile(), evidence: 'SQL Excel customer service' }), []);
});
