import test from 'node:test';
import assert from 'node:assert/strict';
import { blankState, serialiseState, restoreState } from '../src/model.mjs';
import { ROLE_CATALOGUE, exploreRoles, matchRole, roleById, prepareSearchTerms } from '../src/roles.mjs';

test('connected directions explain only the distinct skills actually confirmed', () => {
  const result = matchRole({ skills: 'Customer support, Microsoft Excel, Excel' }, roleById('service-delivery-coordinator'));
  assert.equal(result.relevant, true);
  assert.equal(result.matches.length, 2);
  assert.deepEqual(result.matches.map(match => match.supplied), ['Customer support', 'Microsoft Excel']);
  assert.ok(result.prompts.includes('Scheduling'));
});

test('a job title, raw CV or experience paragraph never silently creates confirmed skills', () => {
  const candidates = [
    { skills: '', currentRole: 'SQL reporting analyst', evidence: 'Excel SQL reporting and data analysis', rawCv: 'SQL Excel' },
    { skills: 'I have no SQL, not Excel, excellent communication' },
    { skills: 'MySQL, JavaScript' }
  ];
  for (const candidate of candidates) assert.deepEqual(exploreRoles(candidate), []);
});

test('generic overlap and a single skill are not enough to suggest a role', () => {
  assert.deepEqual(exploreRoles({ skills: 'Excel' }), []);
  assert.deepEqual(exploreRoles({ skills: 'Excel, Communication' }), []);
  assert.equal(matchRole({ skills: 'SQL, Power BI' }, roleById('reporting-analyst')).relevant, false);
  assert.equal(matchRole({ skills: 'SQL, Data analysis' }, roleById('reporting-analyst')).relevant, true);
});

test('ranking is bounded, reproducible and independent of name, country and salary', () => {
  const candidate = { skills: 'Customer service, Team leadership, Scheduling, Reporting, Excel, Training, Administration, Communication, Operations, Process improvement' };
  const result = exploreRoles(candidate);
  assert.equal(result.length, 5);
  assert.deepEqual(result, exploreRoles({ ...candidate, name: 'Different name', country: 'IE', minimumSalary: '90000' }));
  for (const item of result) {
    assert.ok(item.relevant); assert.ok(item.matches.length >= 2); assert.ok(item.matches.some(match => match.core));
    assert.equal(item.probability, undefined);
  }
});

test('the editorial catalogue has unique ids and actionable prompts without advertised jobs or pay', () => {
  assert.equal(ROLE_CATALOGUE.length, 12);
  assert.equal(new Set(ROLE_CATALOGUE.map(role => role.id)).size, 12);
  for (const role of ROLE_CATALOGUE) {
    assert.ok(role.signals.some(signal => signal.core));
    assert.ok(role.checks.length >= 2); assert.ok(role.terms.length >= 2); assert.ok(role.example.length > 20);
    assert.equal(role.salary, undefined); assert.equal(role.employer, undefined); assert.equal(role.url, undefined);
  }
});

test('search phrases use selected country and location but never candidate identity or CV text', () => {
  const role = roleById('reporting-analyst');
  const result = prepareSearchTerms(role, { country: 'IE', locations: '', workMode: 'remote', name: 'PRIVATE_NAME', evidence: 'PRIVATE_CV' });
  assert.equal(result[0], 'reporting analyst remote Ireland');
  assert.ok(!result.join(' ').includes('PRIVATE'));
  assert.equal(prepareSearchTerms(role, { country: 'GB', locations: 'Belfast', workMode: 'hybrid' })[0], 'reporting analyst hybrid Belfast');
});

test('older saved profiles load without directions and new choices round-trip without raw CV data', () => {
  const old = JSON.stringify({ version: 1, profile: blankState().profile, jobs: [] });
  assert.deepEqual(restoreState(old).roleDirections, []);
  const state = { ...blankState(), roleDirections: ['reporting-analyst', 'reporting-analyst', '<script>bad</script>', null, 'operations-coordinator'], rawCv: 'PRIVATE_CV' };
  const saved = serialiseState(state);
  assert.deepEqual(restoreState(saved).roleDirections, ['reporting-analyst', 'operations-coordinator']);
  assert.ok(!saved.includes('PRIVATE_CV'));
});

test('saved directions are bounded and malformed saved direction fields do not break a profile', () => {
  const state = { ...blankState(), roleDirections: ROLE_CATALOGUE.map(role => role.id) };
  assert.equal(restoreState(serialiseState(state)).roleDirections.length, 5);
  assert.deepEqual(restoreState(JSON.stringify({ ...blankState(), roleDirections: { unexpected: true } })).roleDirections, []);
});

test('search phrases do not invent a work country when preferences were skipped', () => {
  assert.equal(prepareSearchTerms(roleById('reporting-analyst'), { country: 'unknown', locations: '', workMode: 'any' })[0], 'reporting analyst');
});
