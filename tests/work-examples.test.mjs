import test from 'node:test';
import assert from 'node:assert/strict';
import { extractWorkExamples, mergeWorkExamples } from '../src/work-examples.mjs';
const now = new Date('2026-10-20T12:00:00Z');
const old = `Support Analyst | Example A | 2019 - 2022
• Resolved support incidents for internal users.
• Prepared weekly reports for the service desk.`;
const latest = `Release Manager | Example B | January 2023 – Present
• Coordinated production releases across four teams.
• Reduced deployment delays by improving readiness checks.
• Introduced rollback plans for critical services.
• Maintained release calendars for stakeholders.`;

test('selects most recent dated work regardless of CV order and keeps three exact statements from that role only', () => {
  const result = extractWorkExamples(`Profile\nPRIVATE_HEADER\nWork Experience\n${old}\n${latest}\nEducation\nMSc 2024 - 2026\nDelivered an unrelated university project.`, now);
  const role = result.roles.find(role => role.id === result.suggested);
  assert.match(role.label, /Release Manager/);
  assert.deepEqual(role.examples, [
    'Coordinated production releases across four teams.',
    'Reduced deployment delays by improving readiness checks.',
    'Introduced rollback plans for critical services.'
  ]);
  assert.ok(!JSON.stringify(result).includes('university'));
  assert.ok(!JSON.stringify(result).includes('PRIVATE_HEADER'));
});

test('handles dates on separate lines, numeric months and wrapped source text without importing an older header', () => {
  const result = extractWorkExamples(`Employment History
Release Manager
Example B
03/2024 - 10/2026
• Coordinated production releases across
four engineering teams.
• Implemented readiness checks before every release.
Support Analyst
Example A
01/2020 - 02/2024
• Resolved incidents for the support team.`, now);
  assert.match(result.roles[0].label, /Release Manager/);
  assert.deepEqual(result.roles[0].examples, ['Coordinated production releases across four engineering teams.', 'Implemented readiness checks before every release.']);
});

test('concurrent or tied roles require a choice and fewer than three examples are not padded', () => {
  const result = extractWorkExamples(`Professional Experience\n${latest}\nConsultant | Example C | 2025 - Current\n• Delivered a limited consulting engagement.`, now);
  assert.equal(result.suggested, '');
  assert.match(result.message, /More than one/);
  assert.equal(result.roles.find(role => role.label.includes('Consultant')).examples.length, 1);
  assert.equal(extractWorkExamples('Education\nDegree | 2020 - 2024\nBuilt a university prototype.', now).roles.length, 0);
  assert.equal(extractWorkExamples('Experience\nRelease Manager\nDelivered several changes without dates.', now).roles.length, 0);
  const sparse = extractWorkExamples(`Work Experience\n${old}\nRelease Manager | 2024 - Present\nNo detailed achievements listed.\nEducation & Qualifications\nDegree | 2020 - 2023\n• Delivered a student research project.`, now);
  assert.deepEqual(sparse.roles.find(role => role.id === sparse.suggested).examples, []);
  assert.ok(!JSON.stringify(sparse.roles).includes('student research'));
});

test('future or reversed dates are excluded and cannot leak their statements into the preceding role', () => {
  const result = extractWorkExamples(`Work experience\n${latest}\nFuture Manager | 2028 - Present\n• Delivered a future fictional project.\nInvalid role | 2024 - 2020\n• Created an invalid-date statement.`, now);
  assert.equal(result.roles.length, 1);
  assert.ok(!JSON.stringify(result.roles).includes('fictional'));
  assert.ok(!JSON.stringify(result.roles).includes('invalid-date'));
  assert.equal(result.suggested, '');
  const undated = extractWorkExamples(`Work Experience\nRelease Manager\n• Managed deployment approvals for the business.\n${old}`, now);
  assert.equal(undated.suggested, '');
  assert.match(undated.message, /missing or unclear dates/);
});

test('transfer preserves existing text, deduplicates examples and fails without truncation at the profile limit', () => {
  const example = 'Coordinated production releases across four teams.';
  const first = mergeWorkExamples('My existing reviewed work example.', [example, example]);
  assert.equal(first.count, 1); assert.ok(first.value.startsWith('My existing reviewed work example.'));
  assert.equal(mergeWorkExamples(first.value, [example]).count, 0);
  const full = 'x'.repeat(11990);
  assert.deepEqual(mergeWorkExamples(full, [example]), { value: full, count: 0, full: true });
});
