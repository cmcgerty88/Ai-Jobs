import test from 'node:test';
import assert from 'node:assert/strict';
import { suggestedRequirements, requirementConnections, cheatSheetBlocks } from '../src/interview-prep-content.mjs';
import { interviewBlocks, plainText } from '../src/application-content.mjs';
import { cleanPack } from '../src/application-data.mjs';
import { blankState, cleanJob, restoreState, serialiseState } from '../src/model.mjs';
const job = cleanJob({ id: 'synthetic-prep', title: 'Release Manager', employer: 'Example Company', description: 'We are a friendly organisation.\nCoordinate production releases using Jira.\nMust have SQL database administration experience.' });
const pack = cleanPack({ jobId: job.id, summary: 'Keep my edited CV summary', skills: 'Old CV skill', highlights: 'An old reviewed CV example.', focus: 'Coordinate production releases using Jira.\nMust have SQL database administration experience.', roleId: 'release-manager', prep: { role: 'Release Manager', skills: 'Jira, Release management', evidence: 'Coordinated production releases across four teams using Jira.\nImproved readiness checks for critical services.', rawCV: 'RAW_PRIVATE_MARKER', email: 'PRIVATE_EMAIL' }, answers: [] });

test('interview preparation connects only reviewed evidence to requirements, flags gaps and preserves the CV draft', () => {
  const connections = requirementConnections(pack);
  assert.match(connections[0].example, /Coordinated production releases/);
  assert.deepEqual(connections[0].skills, ['Jira']);
  assert.equal(connections[1].example, ''); assert.deepEqual(connections[1].skills, []);
  const text = plainText(interviewBlocks(job, pack));
  assert.match(text, /No clear wording connection/);
  assert.match(text, /whether a release is ready/);
  assert.match(text, /Coordinated production releases across four teams using Jira/);
  assert.doesNotMatch(text, /Old CV skill|RAW_PRIVATE_MARKER|PRIVATE_EMAIL/);
  assert.equal(pack.summary, 'Keep my edited CV summary');
  assert.doesNotMatch(pack.prep.skills, /SQL/);
  assert.match(plainText(cheatSheetBlocks(job, pack)), /first 90-day priorities/);
});

test('requirement suggestions favour duties over employer introduction and never split a long claim', () => {
  const focus = suggestedRequirements(job.description);
  assert.match(focus, /Coordinate production releases/); assert.doesNotMatch(focus, /friendly organisation/);
  assert.equal(suggestedRequirements('x'.repeat(500)), '');
  assert.equal(suggestedRequirements('No readable requirements.'), '');
  assert.ok(suggestedRequirements(Array(10).fill(job.description).join('\n')).split('\n').length <= 3);
});

test('reviewed interview snapshots are bounded, survive restore and disappear with a removed vacancy', () => {
  const state = blankState(); state.jobs = [job]; state.packs = [pack];
  const raw = serialiseState(state); assert.doesNotMatch(raw, /RAW_PRIVATE_MARKER|PRIVATE_EMAIL/);
  const restored = restoreState(raw); assert.deepEqual(restored.packs[0].prep, pack.prep);
  const legacy = cleanPack({ jobId: job.id, summary: 'Old reviewed role', skills: 'Excel', highlights: 'Prepared weekly reports for customers.' });
  assert.equal(legacy.prep, null); assert.match(plainText(interviewBlocks(job, legacy)), /Prepared weekly reports/);
  assert.equal(cleanPack({ prep: { role: 'x'.repeat(500), evidence: 'x'.repeat(6000), skills: 'x'.repeat(3000) } }).prep.evidence.length, 4000);
  state.jobs = []; assert.deepEqual(restoreState(serialiseState(state)).packs, []);
});

test('company and screening-call notes stay separate from CV claims and survive only as bounded reviewed context', async () => {
  const { cleanInterviewContext } = await import('../src/interview-context.mjs');
  const { interviewQuestions } = await import('../src/interviews.mjs');
  const context = { status: 'provided', company: 'The team is improving release reliability.', process: 'Screening call: a 45-minute technical panel and a short presentation.', secret: 'EXCLUDED' };
  const prepared = cleanPack({ ...pack, interviewContext: context });
  const output = plainText(interviewBlocks(job, prepared));
  assert.match(output, /improving release reliability/); assert.match(output, /45-minute technical panel/);
  assert.match(output, /not independently verified/); assert.match(output, /How does your experience connect to the company priorities/);
  assert.equal(prepared.prep.evidence, pack.prep.evidence); assert.doesNotMatch(JSON.stringify(prepared), /EXCLUDED/);
  assert.match(plainText(cheatSheetBlocks(job, prepared)), /45-minute technical panel/);
  assert.ok(interviewQuestions(job, prepared).length <= 12);
  const state = blankState(); state.jobs = [job]; state.packs = [prepared];
  assert.deepEqual(restoreState(serialiseState(state)).packs[0].interviewContext, cleanInterviewContext(context));
  assert.equal(cleanInterviewContext({ status: 'provided', company: 'x'.repeat(5000) }).company.length, 2000);
  assert.equal(cleanInterviewContext({ status: 'provided', company: '   ' }).status, 'unknown');
  assert.deepEqual(cleanInterviewContext({ ...context, status: 'none' }), { status: 'none', company: '', process: '' });
  assert.equal(cleanPack({}).interviewContext.status, 'unknown');
});
