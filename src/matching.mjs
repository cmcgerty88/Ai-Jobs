import { sharedSkills } from './model.mjs';

export function assessJob(profile, job, now = Date.now()) {
  const failures = [], questions = [], fits = [];
  if (job.status === 'closed') failures.push('You marked the vacancy as closed.');
  if (job.country === 'unknown') questions.push('Confirm which country this role can be performed in, including remote roles.');
  else if (job.country !== profile.country) failures.push('The role’s work country differs from your selected country.');
  else fits.push('The stated work country matches.');

  const floor = profile.minimumSalary === '' ? null : Number(profile.minimumSalary);
  const low = job.salaryMin === '' ? null : Number(job.salaryMin);
  const high = job.salaryMax === '' ? null : Number(job.salaryMax);
  if (floor !== null) {
    if (job.currency !== profile.currency) questions.push('The salary currencies differ. No currency conversion has been assumed.');
    else if (low === null || high === null) questions.push('Confirm the full gross annual salary range before comparing it with your minimum.');
    else if (low > high) questions.push('The salary range is inconsistent and needs correcting.');
    else if (high < floor) failures.push('The advertised maximum salary is below your minimum.');
    else if (low < floor) questions.push('The salary range crosses your minimum. An acceptable offer is not assured.');
    else fits.push('The stated annual salary range meets your minimum.');
  }
  if (profile.workMode !== 'any') {
    if (job.mode === 'unknown') questions.push('Confirm the working pattern.');
    else if (profile.workMode !== job.mode) failures.push('The working pattern differs from your selected requirement.');
    else fits.push('The working pattern matches your requirement.');
  } else if (job.mode === 'unknown') questions.push('The working pattern has not been recorded.');
  if (job.mode === 'hybrid') {
    if (job.officeDays === '') questions.push('Confirm how many office days are required.');
    else if (Number(job.officeDays) > Number(profile.maxOfficeDays)) failures.push('The required office days exceed your stated limit.');
  }
  if (['hybrid', 'onsite'].includes(job.mode)) {
    if (job.locationFits === 'no') failures.push('You marked the location or commute as unsuitable.');
    else if (job.locationFits === 'unknown') questions.push('Check that the location and commute are workable for you.');
    else fits.push('You confirmed that the location is workable.');
  }
  if (profile.hours !== 'any') {
    if (job.hours === 'unknown') questions.push('Confirm whether the hours fit.');
    else if (profile.hours !== job.hours) failures.push('The advertised hours differ from your requirement.');
    else fits.push('The stated hours match.');
  }
  if (profile.sponsorship === 'yes') {
    if (job.sponsorship === 'no') failures.push('You need sponsorship and the vacancy states it is unavailable.');
    else if (job.sponsorship === 'unknown') questions.push('Confirm whether the employer can provide the sponsorship you need.');
    else fits.push('The vacancy states sponsorship is available; eligibility still needs employer confirmation.');
  } else if (profile.sponsorship === 'unknown') questions.push('Confirm your work-authorisation requirements for this country.');

  if (job.essentials === 'no') failures.push('You marked at least one essential requirement as unmet.');
  else if (job.essentials === 'unknown') questions.push('Review the essential requirements. A shared skill word does not establish that you meet them.');
  else fits.push('You confirmed that you meet the essential requirements. This has not been independently verified.');

  const checked = Date.parse(job.checkedAt);
  if (job.status !== 'closed') {
    if (!job.url) questions.push('Add the original employer or application-page link.');
    if (job.status !== 'open' || !Number.isFinite(checked)) questions.push('Check the original vacancy page and record whether it is still open.');
    else if (checked > now + 60_000 || now - checked > 7 * 86_400_000) questions.push('Recheck the vacancy page; the recorded check is outdated or has an invalid date.');
  }
  const status = failures.length ? 'skip' : questions.length ? 'investigate' : 'consider';
  const nextAction = status === 'skip' ? failures[0] + ' Revisit only if this information or your requirement changes.' : questions[0] || 'Review your evidence against the job description, then decide whether to apply using the original employer link.';
  return { status, failures, questions, fits, skills: sharedSkills(profile, job), nextAction };
}
