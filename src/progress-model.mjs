export const STAGES = { saved: 'Considering', applied: 'Applied / awaiting reply', interview: 'Interview', offer: 'Offer', rejected: 'Rejected', withdrawn: 'Withdrawn' };
export const GOALS = { clarity: 'Find realistic target roles', applications: 'Improve my applications', interviews: 'Get interviews', offers: 'Turn interviews into offers' };
export function validDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value ? value : '';
}
export function cleanProgress(value = {}) {
  const p = value && typeof value === 'object' ? value : {};
  const appliedAt = validDate(p.appliedAt), interviewAt = validDate(p.interviewAt);
  return { stage: Object.hasOwn(STAGES, p.stage) ? p.stage : 'saved', appliedAt, interviewAt,
    updatedAt: validDate(p.updatedAt), nextAt: validDate(p.nextAt),
    nextAction: typeof p.nextAction === 'string' ? p.nextAction.slice(0, 300) : '' };
}
export function progressError(p, today = new Date().toISOString().slice(0, 10)) {
  if (p.stage !== 'saved' && !p.appliedAt) return 'Record the application date first. For a role you never applied to, use Considering.';
  if (p.appliedAt > today || p.interviewAt > today) return 'Application and completed interview dates cannot be in the future.';
  if (p.stage === 'interview' && !p.interviewAt) return 'Record the completed interview date, or keep the application awaiting reply until the interview happens.';
  if (p.interviewAt && (!p.appliedAt || p.interviewAt < p.appliedAt)) return 'An interview date must be on or after the application date.';
  if (p.stage === 'saved' && (p.appliedAt || p.interviewAt)) return 'Clear the application and interview dates to return to Considering.';
  return '';
}
