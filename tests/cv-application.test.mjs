import test from 'node:test';
import assert from 'node:assert/strict';
import { applicationCvDraft, CV_IMPORT_FIELDS } from '../src/cv-application.mjs';
const source = `Alex Example
alex@example.test | Mobile: 07700 900123
Address: 12 Private Street
Date of birth: 01/01/1990
Professional summary
Release manager with experience coordinating production changes.
Work experience
Release Manager | Example employer | Jan 2023 - Present
Coordinated releases across four teams.
Improved release readiness checks using Jira.
Education
BSc Computing | Example University | 2020
Certifications and training
ITIL Foundation | 2021
Skills
Release management, Jira, ITIL
References
REFEREE_SECRET referee@example.test
Personal details
PERSONAL_SECRET`;
test('extracts source career sections and header contacts without inventing dates or retaining unrelated sections', () => {
  const { fields } = applicationCvDraft(source);
  assert.equal(fields.fullName, 'Alex Example'); assert.equal(fields.email, 'alex@example.test'); assert.equal(fields.phone, '07700 900123');
  assert.match(fields.history, /Example employer \| Jan 2023 - Present/); assert.match(fields.education, /BSc Computing/); assert.match(fields.certifications, /ITIL Foundation/);
  assert.match(fields.summary, /Release manager with experience/); assert.match(fields.highlights, /Coordinated releases/);
  assert.equal(fields.skills, 'Release management, Jira, ITIL');
  assert.doesNotMatch(JSON.stringify(fields), /REFEREE_SECRET|referee@example|PERSONAL_SECRET|Private Street|01\/01\/1990/);
});
test('unrecognised layouts are not copied wholesale and unrelated emails never become candidate contact details', () => {
  const { fields } = applicationCvDraft('This is an unstructured CV with no supported headings.\nReferences\nreferee@example.test');
  assert.equal(fields.history, ''); assert.equal(fields.email, ''); assert.equal(fields.fullName, '');
  assert.equal(applicationCvDraft('Work Experience\nName of employer | 2020 - 2022\nContact: company@example.test').fields.email, '');
});
test('recognises common section headings and reports clipping at destination field limits', () => {
  const { fields, clipped } = applicationCvDraft('WORK EXPERIENCE:\n' + 'A'.repeat(13000) + '\nEDUCATION & QUALIFICATIONS\nDegree | 2020\nTRAINING\nCourse\nPROJECTS\nDelivered a website.');
  assert.equal(fields.history.length, 12000); assert.ok(clipped.includes('Employment, projects or voluntary experience'));
  assert.equal(fields.education, 'Degree | 2020'); assert.equal(fields.certifications, 'Course');
  for (const [key, spec] of Object.entries(CV_IMPORT_FIELDS)) assert.ok(fields[key].length <= spec.limit);
});
