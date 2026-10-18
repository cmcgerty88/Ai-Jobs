import { assessJob } from './matching.mjs';
import { progressError } from './progress-model.mjs';
export { STAGES, GOALS, cleanProgress, progressError } from './progress-model.mjs';
export function diagnose(state, now = Date.now()) {
  const today = new Date(now).toISOString().slice(0, 10);
  const applications = state.jobs.filter(j => j.progress?.appliedAt && !progressError(j.progress, today));
  const interviews = applications.filter(j => j.progress.interviewAt);
  const offers = applications.filter(j => j.progress.stage === 'offer');
  const waiting = applications.filter(j => j.progress.stage === 'applied');
  const overdue = waiting.filter(j => now - Date.parse(j.progress.appliedAt) >= 14 * 86400000);
  const conflicts = state.jobs.filter(j => assessJob(state.profile, j, now).failures.length);
  const rejectedBefore = applications.filter(j => j.progress.stage === 'rejected' && !j.progress.interviewAt);
  const rejectedAfter = interviews.filter(j => j.progress.stage === 'rejected');
  const observations = [];
  if (conflicts.length) observations.push(`${conflicts.length} of ${state.jobs.length} saved vacancies conflict with your stated requirements. Review those conflicts before spending time applying.`);
  if (overdue.length) observations.push(`${overdue.length} applications have awaited a reply for at least 14 days. Check each employer’s timeline and consider a polite follow-up. Silence is not a rejection.`);
  if (rejectedBefore.length) observations.push(`${rejectedBefore.length} recorded rejections before interview. Compare your evidence with the essential requirements and try one targeted change. These records cannot tell us why employers declined.`);
  if (rejectedAfter.length) observations.push(`${rejectedAfter.length} recorded rejections after interview. Review your examples and request feedback if available; the cause is unknown.`);
  let recommendation = 'Add one real vacancy and check its requirements against your experience.';
  if (state.jobs.length) recommendation = 'Resolve the missing facts in one promising vacancy, then prepare an application using a specific example of your work.';
  if (applications.length) recommendation = 'Keep recording outcomes and choose one small improvement to test in your next application.';
  if (state.profile.goal === 'clarity' && !state.roleDirections.length) recommendation = 'Save one or two role directions, then compare real adverts to check whether their requirements fit.';
  else if (state.profile.goal === 'offers' && interviews.length) recommendation = 'Practise one interview example against the role’s essentials, then record what happens at your next interview.';
  else if (overdue.length) recommendation = 'Review the oldest unanswered application and set a follow-up date that respects the employer’s timeline.';
  else if (rejectedBefore.length >= 3) recommendation = 'Review three declined applications side by side. Check essential criteria and make one evidence-based change before the next application.';
  if (offers.length) observations.push(`${offers.length} current offers recorded. Review pay, conditions and your own goals before deciding.`);
  const weeks = [0, 1, 2, 3].map(offset => {
    const end = now - offset * 7 * 86400000, start = end - 7 * 86400000;
    return { label: offset ? `${offset + 1} weeks ago` : 'Last 7 days', applications: applications.filter(j => Date.parse(j.progress.appliedAt) > start && Date.parse(j.progress.appliedAt) <= end).length };
  });
  return { applications: applications.length, interviews: interviews.length, offers: offers.length, waiting: waiting.length, observations, recommendation, weeks,
    caveat: applications.length < 5 ? 'Early picture: fewer than five recorded applications. There is not enough evidence to identify a reliable pattern.' : 'These are descriptive counts from your entries, not a benchmark or proof of cause. Different roles and response times make direct comparisons uncertain.' };
}
