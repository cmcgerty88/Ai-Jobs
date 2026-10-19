import test from 'node:test';
import assert from 'node:assert/strict';
import { blankProfile, cleanJob, safeJobUrl, restoreState, serialiseState, findSkillMentions, sharedSkills } from '../src/model.mjs';
import { assessJob } from '../src/matching.mjs';

const now = Date.UTC(2026, 9, 17, 12);
const profile = { ...blankProfile(), currentRole: 'Support lead', evidence: 'Led a team of 9 and improved customer service.', skills: 'Excel, customer service, SQL', country: 'GB', currency: 'GBP', minimumSalary: '40000', workMode: 'hybrid', maxOfficeDays: '2', hours: 'full-time', sponsorship: 'no' };
const job = cleanJob({ id: 'synthetic', title: 'Synthetic service coordinator', employer: 'Example employer', url: 'https://example.com/jobs/1', description: 'Customer service and Excel reporting. No SQL requirement is specified.', country: 'GB', currency: 'GBP', salaryMin: '40000', salaryMax: '46000', mode: 'hybrid', officeDays: '2', locationFits: 'yes', hours: 'full-time', essentials: 'yes', status: 'open', checkedAt: new Date(now).toISOString() });

test('fully entered, user-confirmed requirements can be considered without a hiring probability', () => {
  const result = assessJob(profile, job, now);
  assert.equal(result.status, 'consider');
  assert.deepEqual(result.failures, []); assert.deepEqual(result.questions, []);
  assert.equal(result.probability, undefined);
});
test('salary maximum below floor is ruled out; overlapping range remains uncertain', () => {
  assert.equal(assessJob(profile, { ...job, salaryMin: '30000', salaryMax: '39000' }, now).status, 'skip');
  const overlap = assessJob(profile, { ...job, salaryMin: '38000', salaryMax: '46000' }, now);
  assert.equal(overlap.status, 'investigate'); assert.match(overlap.questions.join(' '), /crosses your minimum/);
});
test('missing, partial and cross-currency salaries are not inferred', () => {
  for (const patch of [{ salaryMin: '', salaryMax: '' }, { salaryMax: '' }, { currency: 'EUR' }, { salaryMin: '90000', salaryMax: '40000' }]) {
    assert.equal(assessJob(profile, { ...job, ...patch }, now).status, 'investigate');
  }
});
test('zero is a valid explicit floor; a missing floor does not invent one', () => {
  assert.equal(assessJob({ ...profile, minimumSalary: '' }, { ...job, salaryMin: '', salaryMax: '' }, now).status, 'consider');
  assert.equal(assessJob({ ...profile, minimumSalary: '0' }, { ...job, salaryMin: '', salaryMax: '' }, now).status, 'investigate');
});
test('remote does not imply worldwide eligibility', () => {
  const result = assessJob({ ...profile, workMode: 'remote' }, { ...job, mode: 'remote', country: 'IE' }, now);
  assert.equal(result.status, 'skip'); assert.match(result.failures.join(' '), /work country/);
});
test('unknown country, office days and commute require investigation', () => {
  for (const patch of [{ country: 'unknown' }, { officeDays: '' }, { locationFits: 'unknown' }]) assert.equal(assessJob(profile, { ...job, ...patch }, now).status, 'investigate');
});
test('office-day limit and hours are explicit hard constraints', () => {
  assert.equal(assessJob(profile, { ...job, officeDays: '3' }, now).status, 'skip');
  assert.equal(assessJob(profile, { ...job, hours: 'part-time' }, now).status, 'skip');
});
test('sponsorship must be established when needed', () => {
  const candidate = { ...profile, sponsorship: 'yes' };
  assert.equal(assessJob(candidate, { ...job, sponsorship: 'no' }, now).status, 'skip');
  assert.equal(assessJob(candidate, { ...job, sponsorship: 'unknown' }, now).status, 'investigate');
});
test('essential experience cannot be assumed from matching skill text', () => {
  assert.equal(assessJob(profile, { ...job, essentials: 'unknown' }, now).status, 'investigate');
  assert.equal(assessJob(profile, { ...job, essentials: 'no' }, now).status, 'skip');
});
test('closed, unchecked, stale, future and invalid source checks are handled separately', () => {
  assert.equal(assessJob(profile, { ...job, status: 'closed' }, now).status, 'skip');
  for (const patch of [{ status: 'unchecked' }, { url: '' }, { checkedAt: 'invalid' }, { checkedAt: new Date(now - 8 * 86400000).toISOString() }, { checkedAt: new Date(now + 86400000).toISOString() }]) {
    assert.equal(assessJob(profile, { ...job, ...patch }, now).status, 'investigate');
  }
});
test('vacancy links exclude executable schemes and embedded credentials', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,hello', 'http://example.com', 'https://user:password@example.com', 'not a URL']) assert.equal(safeJobUrl(value), '');
  assert.equal(safeJobUrl('https://example.com/jobs/1'), 'https://example.com/jobs/1');
});
test('saved data excludes raw CV content, files and unexpected fields', () => {
  const saved = serialiseState({ profile: { ...profile, cvText: 'RAW_CV_SECRET', token: 'SECRET' }, jobs: [job], rawCv: 'RAW_CV_SECRET', email: 'private@example.com' });
  assert.ok(!saved.includes('RAW_CV_SECRET')); assert.ok(!saved.includes('SECRET')); assert.ok(!saved.includes('private@example.com'));
  assert.equal(restoreState(saved).profile.currentRole, profile.currentRole);
  assert.throws(() => restoreState('{broken')); assert.throws(() => restoreState('{"version":7}'));
});
test('stored inputs are constrained and unsafe URLs are removed on restore', () => {
  const restored = restoreState(JSON.stringify({ version: 1, profile: { country: 'invented', minimumSalary: '-20' }, jobs: [{ ...job, url: 'javascript:alert(1)' }] }));
  assert.equal(restored.profile.country, 'unknown'); assert.equal(restored.profile.minimumSalary, ''); assert.equal(restored.jobs[0].url, '');
});
test('skill extraction detects literal terms, not substrings or an assessment of ability', () => {
  assert.ok(findSkillMentions('Customer support and Excel reporting').includes('Customer service'));
  assert.ok(!findSkillMentions('Excellent work with MySQL').includes('Excel'));
  assert.ok(!findSkillMentions('Excellent work with MySQL').includes('SQL'));
  assert.deepEqual(sharedSkills({ skills: 'Java, SQL' }, { description: 'JavaScript and MySQL' }), []);
});

test('skipping optional preferences leaves country unknown instead of inventing a match or conflict', () => {
  for (const country of ['GB', 'IE']) {
    const result = assessJob({ ...profile, country: blankProfile().country }, { ...job, country }, now);
    assert.equal(result.status, 'investigate');
    assert.equal(result.failures.length, 0);
    assert.match(result.questions.join(' '), /Choose the country/);
    assert.ok(!result.fits.some(fit => fit.includes('work country')));
  }
});
