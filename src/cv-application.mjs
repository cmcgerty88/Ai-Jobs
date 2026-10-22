import { cvProfileDraft } from './cv-profile.mjs';

export const CV_IMPORT_FIELDS = {
  fullName: { label: 'Name', limit: 120, group: 'cv' },
  email: { label: 'Email', limit: 200, group: 'cv' },
  phone: { label: 'Phone', limit: 80, group: 'cv' },
  history: { label: 'Employment, projects or voluntary experience', limit: 12000, group: 'cv' },
  education: { label: 'Education', limit: 3000, group: 'cv' },
  certifications: { label: 'Certifications and training', limit: 2000, group: 'cv' },
  summary: { label: 'Professional summary', limit: 1800, group: 'pack' },
  skills: { label: 'Relevant skills', limit: 2000, group: 'pack' },
  highlights: { label: 'Selected achievements from the latest role', limit: 4000, group: 'pack' }
};
const headings = [
  ['history', /^(?:(?:professional|work|relevant|career|employment) (?:experience|history)|experience|employment|career history|projects|selected projects|volunteering|voluntary work)$/i],
  ['education', /^(?:education|qualifications|academic (?:background|qualifications)|education (?:and|&) qualifications)$/i],
  ['certifications', /^(?:certifications?|certificates?|training|professional development|professional qualifications|(?:certifications?|training) (?:and|&) (?:training|certifications?))$/i],
  ['summary', /^(?:profile|personal profile|professional (?:profile|summary)|summary|career (?:profile|summary)|personal statement|about me)$/i],
  ['skills', /^(?:(?:key|core|technical|professional) )?(?:skills|competencies|expertise)(?: (?:and|&) competencies)?$/i],
  ['stop', /^(?:references?|referees?|interests|hobbies|personal (?:details|information)|contact(?: details| information)?|languages|publications|awards|additional information)$/i]
];
const normal = line => line.replace(/^\s*[#*_]+\s*|\s*[*_]+\s*$/g, '').replace(/\s+/g, ' ').replace(/:$/, '').trim();
// Extract source sections, never reconstruct dates, employers or qualifications.
// Unknown layouts fall back to manual entry; no whole-CV copy into a career field.
export function applicationCvDraft(source) {
  const lines = String(source || '').slice(0, 100000).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').split(/\r?\n/);
  const sections = { history: [], education: [], certifications: [], summary: [], skills: [] }, header = [];
  let section = '', seenHeading = false;
  for (const raw of lines) {
    const line = raw.trim(), label = normal(line);
    const heading = headings.find(([, pattern]) => pattern.test(label));
    if (heading) { section = heading[0]; seenHeading = true; continue; }
    if (!seenHeading) { header.push(line); continue; }
    if (!sections[section]) continue;
    // Common personal-data labels are not useful in an application draft.
    if (/^(?:date of birth|dob|national insurance|passport|marital status|nationality|address|referee|reference|email|phone|mobile|tel)\s*:/i.test(line)) continue;
    sections[section].push(line);
  }
  const fields = {};
  for (const field of ['history', 'education', 'certifications', 'summary']) fields[field] = sections[field].join('\n').replace(/\n{3,}/g, '\n\n').trim();
  const career = cvProfileDraft('Work experience\n' + fields.history + '\nSkills\n' + sections.skills.join('\n'));
  fields.skills = sections.skills.join('\n').trim() || career.skills;
  fields.highlights = career.evidence;
  // Contact candidates come only from the CV header, never employers or referees.
  const contact = header.slice(0, 15).join('\n');
  fields.email = contact.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0] || '';
  fields.phone = contact.match(/(?:phone|mobile|tel(?:ephone)?)\s*:\s*(\+?[\d ()-]{7,30})/i)?.[1]?.trim() || contact.match(/(?:\+44\s*(?:\(0\)\s*)?|\b0)7\d(?:[ ()-]*\d){8}\b/)?.[0] || '';
  const candidate = header.find(line => line.trim())?.replace(/^(?:name|full name)\s*:\s*/i, '') || '';
  fields.fullName = /^(?:\p{L}[\p{L}'’.-]*\s+){1,4}\p{L}[\p{L}'’.-]*$/u.test(candidate) && !/\b(?:curriculum|vitae|resume|manager|engineer|analyst|consultant|director|profile|private|address)\b/i.test(candidate) ? candidate : '';
  const clipped = [];
  for (const [field, { limit }] of Object.entries(CV_IMPORT_FIELDS)) {
    if ((fields[field] || '').length > limit) clipped.push(CV_IMPORT_FIELDS[field].label);
    fields[field] = (fields[field] || '').slice(0, limit);
  }
  return { fields, clipped };
}
