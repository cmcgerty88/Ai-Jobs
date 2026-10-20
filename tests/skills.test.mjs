import test from 'node:test';
import assert from 'node:assert/strict';
import { findSkillMentions, skillEvidence, canonicalSkill } from '../src/skills.mjs';
import { exploreRoles } from '../src/roles.mjs';

test('technical CV recognises delivery skills, abbreviations and tools with evidence, without inventing related technologies', () => {
  const cv = `Release planning, deployment coordination and change advisory board approvals.
CI/CD pipelines in Azure DevOps and Jenkins. ITIL, Jira, Confluence, UAT and rollback plans.
Managed stakeholder engagement, dependency tracking and risk assessments.
Cutover management and release governance.`;
  const skills = findSkillMentions(cv);
  for (const label of ['Release management', 'Deployment management', 'IT change management', 'CI/CD', 'Azure DevOps', 'Jenkins', 'ITIL', 'Jira', 'Confluence', 'User acceptance testing', 'Rollback planning', 'Stakeholder management', 'Dependency management', 'Risk management', 'Cutover planning', 'Release governance']) assert.ok(skills.includes(label), label);
  for (const absent of ['AWS', 'Microsoft Azure', 'Python', 'Kubernetes']) assert.ok(!skills.includes(absent), absent);
  assert.equal(new Set(skills).size, skills.length);
  assert.ok(skillEvidence(cv).every(item => item.snippet.length && item.snippet.length < 260));
});

test('aliases across CV formatting work in several sectors, while explicit negatives and aspirations are excluded', () => {
  const skills = findSkillMentions('Stakeholder\nmanagement; Microsoft Excel; MS Excel; accounts payable; payroll; stock control; patient care; lesson planning; continuous integration; CI/CD.');
  for (const label of ['Stakeholder management', 'Excel', 'Accounts payable', 'Payroll', 'Inventory management', 'Patient care', 'Lesson planning', 'CI/CD']) assert.ok(skills.includes(label), label);
  assert.equal(skills.filter(s => s === 'Excel').length, 1);
  assert.deepEqual(findSkillMentions('No experience with Python or SQL. Interested in learning Kubernetes. Java not used. Excellent work and safe working.'), []);
  assert.deepEqual(findSkillMentions('MySQL, JavaScript'), ['MySQL', 'JavaScript']);
  assert.ok(findSkillMentions('SAFe delivery framework').includes('SAFe'));
  assert.equal(canonicalSkill('UAT'), 'User acceptance testing');
});

test('target role takes precedence over current role and generic skills cannot divert a release manager', () => {
  const profile = { currentRole: 'Customer support team lead', targetRole: 'Release Manager', skills: 'Excel, Scheduling, Reporting, Training, Customer service, Release planning, IT change control, ITIL, CI/CD, Risk management' };
  const roles = exploreRoles(profile);
  assert.equal(roles[0].role.id, 'release-manager');
  assert.ok(roles.every(item => ['release-manager', 'it-change-manager', 'technical-delivery-manager'].includes(item.role.id)));
  assert.ok(roles.some(item => item.matches.some(match => match.supplied === 'Release planning')));
  assert.ok(roles.every(item => item.context.reason.includes('target role')));
  assert.deepEqual(exploreRoles({ ...profile, targetRole: 'Neurosurgeon' }), []);
  const current = exploreRoles({ ...profile, currentRole: 'Release Manager', targetRole: '' });
  assert.equal(current[0].role.id, 'release-manager');
  assert.ok(current[0].context.reason.includes('current role'));
});

test('role focus does not invent skills or silently lower the responsibility level', () => {
  const roles = exploreRoles({ currentRole: 'Operations Manager', skills: 'Excel, Scheduling, Reporting, Administration, Operations, Team leadership' });
  assert.deepEqual(roles.map(item => item.role.id), ['operations-manager']);
  const titleOnly = exploreRoles({ targetRole: 'Release Manager', skills: '', evidence: 'SQL and Python', rawCv: 'Jenkins' });
  assert.deepEqual(titleOnly.map(item => item.role.id), ['release-manager']);
  assert.deepEqual(titleOnly[0].matches, []);
  assert.deepEqual(exploreRoles({ currentRole: 'Registered nurse', skills: 'Excel, Scheduling, Reporting' }), []);
});
