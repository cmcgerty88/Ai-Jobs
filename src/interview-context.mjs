// Candidate-supplied notes, never independently verified company facts.
const text = value => typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0, 2000) : '';
export function cleanInterviewContext(value) {
  const company = text(value?.company), process = text(value?.process);
  const status = value?.status === 'none' ? 'none' : value?.status === 'provided' && (company.trim() || process.trim()) ? 'provided' : 'unknown';
  return { status, company: status === 'provided' ? company : '', process: status === 'provided' ? process : '' };
}
export function contextQuestions(pack) {
  const context = cleanInterviewContext(pack.interviewContext), questions = [];
  if (context.company.trim()) questions.push({ id: 'context-company', question: 'How does your experience connect to the company priorities you noted?', guidance: 'Use your company or screening-call notes. Connect one priority to a truthful CV example and prepare a question about anything still uncertain. These notes are your account, not independently verified facts.' });
  if (context.process.trim()) questions.push({ id: 'context-process', question: 'How will you prepare for the interview process you were told about?', guidance: 'Use your process or screening-call notes. Plan examples for the areas mentioned, rehearse any task or presentation you were asked to prepare, and confirm unclear timing, format or next stages. Do not assume an unconfirmed task is required.' });
  return questions;
}
export function contextBlocks(pack) {
  const context = cleanInterviewContext(pack.interviewContext);
  const blocks = [{ text: 'Company and interview-process information', style: 'heading' }];
  if (context.status !== 'provided') return [...blocks, { text: context.status === 'none' ? 'You confirmed you have no extra information yet. Before the interview, check the company priorities, format, timing, attendees’ roles and whether any task is expected.' : 'No additional information has been reviewed yet. Add company research or screening-call notes, or confirm you have none.' }];
  blocks.push({ text: 'Your supplied notes — not independently verified. Check anything uncertain with the employer. Keep these separate from claims about your own experience.' });
  for (const [label, value] of [['Company / screening-call insights', context.company], ['Interview process / screening-call instructions', context.process]]) {
    blocks.push({ text: label, style: 'heading' }, { text: value.trim() || 'Not supplied. Confirm this before the interview if relevant.' });
  }
  blocks.push({ text: 'My preparation actions', style: 'heading' });
  contextQuestions(pack).forEach(q => blocks.push({ text: q.guidance }));
  return blocks;
}
