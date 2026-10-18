import test from 'node:test';
import assert from 'node:assert/strict';
import { blankState, cleanJob, serialiseState, restoreState } from '../src/model.mjs';
import { cleanCv, cleanPack, cleanPacks } from '../src/application-data.mjs';
import { createPack, sourceKey, cvBlocks, cvIssues, interviewBlocks, plainText } from '../src/application-content.mjs';
import { interviewQuestions, ROLE_QUESTIONS } from '../src/interviews.mjs';
import { ROLE_CATALOGUE } from '../src/roles.mjs';
const profile = { ...blankState().profile, name: 'Synthetic Alex', currentRole: 'Customer support lead', skills: 'Scheduling, Excel, customer service', evidence: 'Organised weekly team schedules.\nPrepared Excel reporting for the service team.' };
const job = cleanJob({ id: 'synthetic-job', title: 'Reporting analyst', employer: 'Synthetic Employer', description: 'Prepare Excel reporting and validate data.\nSQL is desirable.' });
test('tailoring prioritises relevant confirmed facts without importing requirements as claims', async () => {
  const pack = await createPack(profile, job);
  assert.equal(pack.roleId, 'reporting-analyst'); assert.ok(pack.skills.startsWith('Excel'));
  assert.ok(pack.highlights.startsWith('Prepared Excel reporting'));
  assert.equal(pack.summary, profile.currentRole); assert.ok(!pack.skills.includes('SQL'));
  assert.equal(pack.sourceKey, await sourceKey(profile, job));
  assert.notEqual(pack.sourceKey, await sourceKey({ ...profile, evidence: 'A changed fact' }, job));
  assert.notEqual(pack.sourceKey, await sourceKey(profile, { ...job, description: 'Different requirements' }));
  const long = await createPack({ ...profile, evidence: 'x'.repeat(4001) }, job);
  assert.equal(long.highlights, '', 'do not silently cut a reviewed claim into a fragment');
});
test('CV output includes only selected document fields and supports anonymised applications', async () => {
  const pack = await createPack(profile, job);
  const cv = cleanCv({ fullName: 'Synthetic Zoë', email: 'synthetic@example.com', phone: '00000', location: 'Belfast', history: 'Coordinator | Synthetic Company | 2023–2025\nPrepared reports.', education: 'Synthetic certificate' });
  assert.deepEqual(cvIssues(cv, pack), []);
  const output = plainText(cvBlocks(cv, pack, job));
  assert.ok(output.includes('Synthetic Zoë')); assert.ok(output.includes('Target role: Reporting analyst'));
  assert.ok(output.includes('Prepared reports.')); assert.ok(!output.includes('SQL is desirable'));
  const anonymous = plainText(cvBlocks({ ...cv, anonymous: true }, pack, job));
  assert.ok(!anonymous.includes(cv.email)); assert.ok(!anonymous.includes(cv.fullName)); assert.ok(!anonymous.includes(cv.phone)); assert.ok(!anonymous.includes('Belfast'));
  assert.ok(cvIssues(cleanCv(), pack).length >= 3);
});
test('all catalogue roles have distinct editorial practice prompts and actual requirement questions', () => {
  assert.deepEqual(new Set(Object.keys(ROLE_QUESTIONS)), new Set(ROLE_CATALOGUE.map(r => r.id)));
  for (const role of ROLE_CATALOGUE) {
    const pack = cleanPack({ roleId: role.id, focus: 'A requirement I selected', answers: [{ id: 'introduction', answer: 'My real practice notes' }] });
    const questions = interviewQuestions(job, pack);
    assert.equal(questions.length, 8); assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
    assert.ok(questions.some(q => q.question.includes('A requirement I selected')));
    assert.ok(plainText(interviewBlocks(job, pack)).includes('My real practice notes'));
  }
  assert.equal(interviewQuestions(job, cleanPack({ roleId: 'unsupported-specialism' })).length, 4);
});
test('old profiles gain empty document fields and packs stay bounded, sanitised and linked to real jobs', () => {
  const restored = restoreState(JSON.stringify({ version: 1, profile: {}, jobs: [] }));
  assert.deepEqual(restored.cv, cleanCv()); assert.deepEqual(restored.packs, []);
  const ids = Array.from({ length: 8 }, (_, n) => `job-${n}`);
  assert.equal(cleanPacks(ids.map(jobId => ({ jobId })), ids).length, 5);
  assert.equal(cleanPacks([{ jobId: 'missing' }, { jobId: ids[0] }, { jobId: ids[0] }], ids).length, 1);
  const state = blankState(); state.jobs = [job]; state.cv = { ...cleanCv(), email: 'synthetic@example.com', rawCV: 'RAW_MARKER' };
  state.packs = [{ jobId: job.id, summary: 'Reviewed summary', answers: [{ id: 'introduction', answer: 'Reviewed notes' }], secret: 'RAW_MARKER' }];
  const raw = serialiseState(state); assert.ok(!raw.includes('RAW_MARKER'));
  const loaded = restoreState(raw); assert.equal(loaded.cv.email, 'synthetic@example.com'); assert.equal(loaded.packs[0].answers[0].answer, 'Reviewed notes');
  state.jobs = [{ id: job.id, title: '' }]; assert.deepEqual(restoreState(serialiseState(state)).packs, []);
  state.jobs = []; assert.deepEqual(restoreState(serialiseState(state)).packs, []);
});
