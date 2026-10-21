import test from 'node:test';
import assert from 'node:assert/strict';
import { cvProfileDraft, titleFromHeading } from '../src/cv-profile.mjs';
const cv = `PRIVATE_CONTACT@example.test
Work Experience
Support Analyst | Earlier Employer | 2019 - 2022
Resolved incidents for a support team.
Release Manager | Recent Employer | Jan 2023 - Present
Coordinated production releases across four teams.
Improved release readiness checks using Jira.
Created rollback plans for critical services.
Skills
Excel, release management, ITIL. No Python experience.`;

test('CV profile draft uses latest work, canonical skills and no contact details or target-role inference', () => {
  const draft = cvProfileDraft(cv, new Date('2026-10-21'));
  assert.equal(draft.currentRole, 'Release Manager');
  assert.match(draft.skills, /Release management/);
  assert.match(draft.skills, /Jira/);
  assert.doesNotMatch(draft.skills, /Python/);
  assert.equal(draft.evidence.split('\n\n').length, 3);
  assert.match(draft.evidence, /Created rollback plans/);
  assert.doesNotMatch(JSON.stringify(draft), /PRIVATE_CONTACT|Earlier Employer|Recent Employer|Resolved incidents/);
  assert.deepEqual(Object.keys(draft), ['currentRole', 'skills', 'evidence']);
});

test('unclear, concurrent and missing role dates leave role and evidence for the person to choose', () => {
  for (const source of [cv.replace('2019 - 2022', '2020 - Present'), cv.replace('Jan 2023 - Present', ''), 'Excel skills and a personal summary']) {
    const draft = cvProfileDraft(source, new Date('2026-10-21'));
    assert.equal(draft.currentRole, ''); assert.equal(draft.evidence, '');
    assert.match(draft.skills, /Excel/);
  }
  assert.equal(titleFromHeading('Unclear header'), '');
  assert.equal(titleFromHeading('Example Ltd · Release Manager'), 'Release Manager');
  assert.equal(titleFromHeading('Release Manager at Example Ltd'), 'Release Manager');
  assert.equal(titleFromHeading('Manager Group Ltd'), '');
});
