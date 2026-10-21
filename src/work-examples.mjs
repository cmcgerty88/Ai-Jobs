// Deterministic local extraction: retain source statements, never generate achievements.
const employment = /^(?:(?:professional|work|relevant|career|employment)\s+(?:experience|history)|experience|employment|career history)\s*:?\s*$/i;
const sectionEnd = /^(?:education|qualifications|certifications|skills|technical skills|key skills|personal profile|profile|summary|references|interests|volunteering|voluntary work|projects|selected projects|publications|awards|professional development|training|personal details|contact details)(?:\s+(?:and|&)\s+[a-z ]+)?\s*:?\s*$/i;
const action = /^(?:I\s+)?(?:led|managed|delivered|developed|implemented|coordinated|co-ordinated|created|built|improved|reduced|increased|achieved|introduced|automated|planned|supported|maintained|resolved|designed|prepared|organised|organized|oversaw|supervised|trained|mentored|negotiated|analysed|analyzed|established|launched|migrated|tested|deployed|monitored|reviewed|produced|processed|handled|provided|facilitated|ensured|owned|responsible for|accountable for|managing|coordinating|delivering|supporting|leading|planning|developing|implementing|maintaining)\b/i;
const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const datePart = '(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\\.?\\s+|(?:0?[1-9]|1[0-2])[/.-])?(?:19|20)\\d{2}';
const dateRange = new RegExp(`\\b(${datePart})\\s*(?:[-–—]|to)\\s*(present|current|now|to date|${datePart})\\b`, 'i');
const plain = text => text.replace(/^\s*(?:[•●▪*-]|\d+[.)])\s*/, '').trim();
const roleHeading = text => text.length < 160 && /^[A-Z]/.test(text) && !/[.!?]$/.test(text) && /\b(?:manager|engineer|analyst|coordinator|co-ordinator|administrator|developer|consultant|director|assistant|officer|supervisor|lead|leader|nurse|teacher)\b/i.test(text);
function dateValue(text, end = false) {
  const year = Number(text.match(/(?:19|20)\d{2}/)?.[0]);
  const named = months.indexOf(text.slice(0, 3).toLowerCase());
  const numeric = text.match(/^(\d{1,2})[/.-]/);
  const month = named >= 0 ? named : numeric ? Number(numeric[1]) - 1 : end ? 11 : 0;
  return year * 12 + month;
}
function examplesFrom(lines) {
  const statements = [];
  let pending = '';
  const flush = () => {
    if (pending.length >= 20 && pending.length <= 1200 && action.test(pending) && !statements.includes(pending)) statements.push(pending);
    pending = '';
  };
  for (const raw of lines) {
    const text = plain(raw);
    if (!text) continue;
    if (sectionEnd.test(text) || employment.test(text)) { flush(); break; }
    if (!action.test(text) && roleHeading(text) && (pending || statements.length)) { flush(); break; }
    // Multiple complete action sentences in one paragraph are independent examples.
    const parts = text.split(/(?<=[.!?])\s+/u);
    for (const part of parts) {
      if (action.test(part)) { flush(); pending = part; }
      else if (/^\s*[•●▪*-]\s/.test(raw) || /^(?:key achievements|responsibilities|achievements|duties)\s*:?\s*$/i.test(part)) flush();
      else if (pending) pending += ' ' + part;
    }
  }
  flush();
  return statements.slice(0, 3);
}

export function extractWorkExamples(source, now = new Date()) {
  const lines = String(source || '').slice(0, 100000).split(/\r?\n/).map(line => line.trim());
  const sections = [];
  for (let index = 0; index < lines.length; index++) {
    if (!employment.test(plain(lines[index]))) continue;
    let end = index + 1;
    while (end < lines.length && !sectionEnd.test(plain(lines[end])) && !employment.test(plain(lines[end]))) end++;
    sections.push({ start: index + 1, end }); index = end - 1;
  }
  if (!sections.length) return { roles: [], suggested: '', message: 'I couldn’t identify a work-history section. Add a heading such as “Work experience” in the CV text and try again, or highlight the latest role’s examples and use “Add selected text to my examples”.' };
  const roles = [];
  let uncertainDates = false;
  for (const section of sections) {
    const headers = [];
    for (let index = section.start; index < section.end; index++) {
      const line = plain(lines[index]), range = dateRange.exec(line);
      if (!range || line.length > 240 || action.test(line) || /^\s*[•●▪*]\s/.test(lines[index])) continue;
      const startDate = dateValue(range[1]);
      const ongoing = /^(present|current|now|to date)$/i.test(range[2]);
      const endDate = ongoing ? Infinity : dateValue(range[2], true);
      const eligible = startDate <= now.getUTCFullYear() * 12 + now.getUTCMonth() && endDate >= startDate;
      let start = index;
      const inlineTitle = line.replace(range[0], '').replace(/^[\s|,():-]+|[\s|,():-]+$/g, '');
      if (!inlineTitle) {
        // Usually title/employer precede a separate date line. Never consume a
        // previous role's action statement or another dated heading.
        for (let previous = index - 1; previous >= Math.max(section.start, index - 2); previous--) {
          const text = plain(lines[previous]);
          if (!text || action.test(text) || dateRange.test(text) || /^[•●▪*]/.test(lines[previous]) || sectionEnd.test(text)) break;
          start = previous;
        }
      }
      headers.push({ index, start, startDate, endDate, ongoing, eligible, date: range[0], label: inlineTitle || lines.slice(start, index).join(' · ') || 'Role title not identified' });
    }
    if (headers.some(header => !header.eligible)) uncertainDates = true;
    for (let index = section.start; index < section.end; index++) {
      const text = plain(lines[index]);
      if (!action.test(text) && roleHeading(text) && !headers.some(header => index >= header.start && index <= header.index)) uncertainDates = true;
    }
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i], end = headers[i + 1]?.start ?? section.end;
      if (!header.eligible) continue;
      roles.push({ id: `work-${header.index}`, label: header.label.slice(0, 240), date: header.date, startDate: header.startDate, endDate: header.endDate,
        examples: examplesFrom(lines.slice(header.index + 1, end)) });
    }
  }
  roles.sort((a, b) => b.endDate - a.endDate || b.startDate - a.startDate);
  // Equal end dates (including concurrent current roles) require a user's choice.
  const ambiguous = roles.length > 1 && roles[0].endDate === roles[1].endDate;
  return { roles, suggested: roles.length && !ambiguous && !uncertainDates ? roles[0].id : '',
    message: !roles.length ? 'No clear employment date ranges were found. Try dates such as “Jan 2024 – Present”, or highlight examples from your latest role and add them manually.'
      : ambiguous ? 'More than one role could be your most recent. Choose the correct role below.'
        : uncertainDates ? 'Some role headings have missing or unclear dates. I can’t reliably identify the latest role. Choose it below, or highlight its examples in the CV text if it is missing.'
        : 'The latest dated employment entry is selected. Check that this is your most recent role before adding its examples.' };
}

export function mergeWorkExamples(current, selected) {
  const key = value => value.replace(/^\s*[•*-]\s*/, '').replace(/\s+/g, ' ').trim().toLowerCase();
  const existing = new Set(String(current).split(/\n+/).map(key));
  const additions = selected.filter(value => {
    const normal = key(value);
    if (!normal || existing.has(normal)) return false;
    existing.add(normal); return true;
  });
  const value = [current, ...additions].filter(part => part.trim()).join('\n\n');
  return value.length > 12000 ? { value: current, count: 0, full: true } : { value, count: additions.length, full: false };
}
