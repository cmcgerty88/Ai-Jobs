import test from 'node:test';
import assert from 'node:assert/strict';
import { newKey, seal, unseal, parseVault, RETENTION_MS } from '../src/vault.mjs';
import { blankState, cleanJob, restoreState, serialiseState } from '../src/model.mjs';
import { diagnose, cleanProgress, progressError } from '../src/progress.mjs';
const passphrase = 'synthetic-test-only-passphrase';
const now = Date.parse('2026-10-18T12:00:00Z');
test('vault round-trip excludes plaintext and uses a new IV for every write', async () => {
  const session = await newKey(passphrase);
  assert.equal(session.key.extractable, false);
  const a = await seal('{"name":"Synthetic only"}', session, now), b = await seal('{"name":"Synthetic only"}', session, now);
  assert.ok(!a.includes('Synthetic only')); assert.notEqual(parseVault(a).iv, parseVault(b).iv);
  assert.equal((await unseal(a, passphrase, now)).json, '{"name":"Synthetic only"}');
  assert.equal(parseVault(a).expiresAt, now + RETENTION_MS);
});
test('wrong passphrase, tampering, unsupported cost and expiry cannot unlock', async () => {
  const raw = await seal('{}', await newKey(passphrase), now);
  await assert.rejects(unseal(raw, 'incorrect-passphrase-test', now));
  const changed = JSON.parse(raw); changed.expiresAt++;
  await assert.rejects(unseal(JSON.stringify(changed), passphrase, now));
  changed.iterations = 999999999; assert.throws(() => parseVault(JSON.stringify(changed)));
  await assert.rejects(unseal(raw, passphrase, now + RETENTION_MS));
  await assert.rejects(newKey('short'));
  assert.throws(() => parseVault('x'.repeat(1600001)));
});
test('legacy migration retains reviewed fields but drops unknown/raw CV data', () => {
  const old = { version: 1, profile: { name: 'Synthetic', rawCV: 'DO NOT RETAIN' }, jobs: [] };
  const restored = restoreState(JSON.stringify(old));
  assert.equal(restored.profile.name, 'Synthetic'); assert.equal(restored.profile.goal, 'clarity');
  assert.ok(!serialiseState(restored).includes('DO NOT RETAIN'));
  assert.deepEqual(restored.feedback, { useful: '', return: '' });
});
test('progress validates dates and does not invent interviews for direct offers', () => {
  assert.equal(cleanProgress({ appliedAt: '2026-02-30' }).appliedAt, '');
  assert.match(progressError(cleanProgress({ stage: 'applied' })), /date first/);
  assert.match(progressError(cleanProgress({ stage: 'interview', appliedAt: '2026-10-01' })), /completed interview/);
  assert.match(progressError(cleanProgress({ stage: 'applied', appliedAt: '2026-10-19' }), '2026-10-18'), /future/);
  assert.match(progressError(cleanProgress({ stage: 'rejected', appliedAt: '2026-10-02', interviewAt: '2026-10-01' })), /on or after/);
  assert.equal(progressError(cleanProgress({ stage: 'offer', appliedAt: '2026-10-01' }), '2026-10-18'), '');
});
function job(stage, appliedAt, interviewAt = '') { return cleanJob({ id: crypto.randomUUID(), title: 'Synthetic', progress: { stage, appliedAt, interviewAt } }); }
test('diagnosis separates waiting, rejection, withdrawn, interviews and offers', () => {
  const state = blankState(); state.profile.goal = 'interviews';
  state.jobs = [job('applied', '2026-10-01'), job('applied', '2026-10-17'), job('rejected', '2026-10-02'), job('rejected', '2026-10-03', '2026-10-10'), job('offer', '2026-10-04'), job('withdrawn', '2026-10-05'), job('saved', '')];
  const report = diagnose(state, now);
  assert.equal(report.applications, 6); assert.equal(report.waiting, 2); assert.equal(report.interviews, 1); assert.equal(report.offers, 1);
  assert.ok(report.observations.some(s => s.includes('1 applications have awaited')));
  assert.ok(report.observations.some(s => s.includes('1 recorded rejections before')));
  assert.ok(report.observations.some(s => s.includes('1 recorded rejections after')));
  assert.match(report.recommendation, /oldest unanswered/); assert.match(report.caveat, /not a benchmark or proof/);
  assert.equal(report.weeks[0].applications, 1);
});
test('sparse records do not diagnose failure; goal changes adapt next action', () => {
  const state = blankState(); assert.match(diagnose(state, now).caveat, /fewer than five/);
  assert.match(diagnose(state, now).recommendation, /role directions/);
  state.profile.goal = 'offers'; state.jobs = [job('interview', '2026-10-01', '2026-10-10')];
  assert.match(diagnose(state, now).recommendation, /Practise one interview/);
});
