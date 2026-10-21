import { skillEvidence } from './skills.mjs';
import { extractWorkExamples } from './work-examples.mjs';

// Conservative title extraction: never use the whole employer/date heading as a role.
export function titleFromHeading(label = '') {
  const parts = label.split(/\s*(?:[|·,]|\s[@–—]\s|\s-\s|\s+at\s+)\s*/i);
  return parts.find(part => part.length <= 160
    && /\b(?:manager|engineer|analyst|coordinator|co-ordinator|administrator|developer|consultant|director|assistant|officer|supervisor|lead|leader|nurse|teacher|designer|technician|accountant|specialist|architect|receptionist|chef|driver)\b/i.test(part)
    && !/\b(?:ltd|limited|plc|inc|company|group)\b|[@\d]|https?:/i.test(part))?.trim() || '';
}

export function cvProfileDraft(source, now = new Date()) {
  const work = extractWorkExamples(source, now);
  const recent = work.roles.find(role => role.id === work.suggested);
  const skills = [];
  for (const { name } of skillEvidence(source)) {
    if ([...skills, name].join(', ').length <= 2000) skills.push(name);
  }
  return {
    currentRole: recent ? titleFromHeading(recent.label) : '',
    skills: skills.join(', '),
    evidence: recent?.examples.join('\n\n') || ''
  };
}
