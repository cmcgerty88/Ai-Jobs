import test from 'node:test';
import assert from 'node:assert/strict';
import { blankState, cleanJob } from '../src/model.mjs';
import { firstPlan } from '../src/first-plan.mjs';

test('first plan gives different actionable experiments for each stated situation without inventing outcomes', () => {
  const state = blankState(); state.profile.evidence = 'Prepared reporting and coordinated schedules.';
  state.profile.skills = 'customer service, Excel, scheduling';
  const clarity = firstPlan(state);
  assert.equal(clarity.roles.length, 2);
  assert.ok(clarity.roles.every(r => r.matches.length >= 2));
  assert.match(clarity.detail, /essential requirements/);
  assert.match(clarity.basis, /not a judgement/);
  state.profile.goal = 'interviews';
  const applications = firstPlan(state);
  assert.match(applications.detail, /specific example/);
  assert.match(applications.basis, /can’t tell/);
  assert.equal(applications.roles.length, 0);
  assert.equal(clarity.step, 3);
  assert.equal(applications.step, 4);
  state.profile.goal = 'offers';
  assert.equal(firstPlan(state).step, 9);
  assert.match(firstPlan(state).detail, /saying it aloud/);
  assert.match(firstPlan(state).basis, /don’t yet have recorded outcomes/);
});

test('unsupported and negative skill labels do not manufacture role matches or job-search failure', () => {
  const state = blankState(); state.profile.skills = 'I have no Excel, neurosurgery';
  const plan = firstPlan(state);
  assert.equal(plan.roles.length, 0);
  assert.match(plan.basis, /nothing about your employability/);
  assert.equal(plan.step, 8);
});

test('recorded outcomes replace the starter experiment, using valid dates and keeping uncertainty', () => {
  const state = blankState(); state.profile.goal = 'interviews';
  const now = Date.parse('2026-10-19T12:00:00Z');
  state.jobs = [cleanJob({ id: 'one', progress: { stage: 'applied', appliedAt: '2026-10-01' } })];
  const plan = firstPlan(state, now);
  assert.match(plan.detail, /oldest unanswered/);
  assert.match(plan.basis, /1 applications and 0 completed interviews/);
  assert.match(plan.limitation, /not enough evidence/);
  state.jobs[0].progress.appliedAt = '2027-01-01';
  assert.match(firstPlan(state, now).title, /evidence in one application/);
});
