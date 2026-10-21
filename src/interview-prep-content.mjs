import { findSkillMentions, hasPhrase, normalise } from './model.mjs';
import { interviewQuestions } from './interviews.mjs';
import { cleanInterviewContext } from './interview-context.mjs';

const lines = value => String(value || '').split(/\n+/).map(s => s.trim()).filter(Boolean);
const block = (text, style = 'body', maxLines) => ({ text, style, maxLines });
const ignored = new Set('about after before their there these those would should could experience candidate company employer required requirements excellent strong skills ability working looking successful opportunity including'.split(' '));

export function suggestedRequirements(description) {
  const passages = String(description).split(/\n+|(?<=[.!?])\s+/).map(s => s.replace(/^[•*-]\s*/, '').trim()).filter(s => s.length >= 20 && s.length <= 280);
  const score = s => findSkillMentions(s).length * 2 + (/\b(must|essential|required|responsib|manage|deliver|lead|develop|support|coordinate|ensure|design|analyse|analyze|prepare|check)\w*/i.test(s) ? 2 : 0);
  return [...new Set(passages)].map((text, index) => ({ text, index, score: score(text) }))
    .filter(p => p.score > 0).sort((a, b) => b.score - a.score || a.index - b.index).slice(0, 3).map(p => p.text).join('\n');
}

export function interviewEvidence(pack) {
  return pack.prep || { role: pack.summary, skills: pack.skills, evidence: pack.highlights };
}

export function requirementConnections(pack) {
  const source = interviewEvidence(pack), examples = lines(source.evidence);
  const suppliedSkills = findSkillMentions(source.skills);
  const exampleSkills = examples.map(example => findSkillMentions(example));
  return lines(pack.focus).slice(0, 3).map(requirement => {
    const terms = [...new Set(normalise(requirement).split(' ').filter(w => w.length > 4 && !ignored.has(w)))];
    const requiredSkills = findSkillMentions(requirement);
    const skills = requiredSkills.filter(skill => suppliedSkills.includes(skill));
    const ranked = examples.map((example, index) => ({ example, index, score: terms.filter(term => hasPhrase(example, term)).length
      + exampleSkills[index].filter(skill => requiredSkills.includes(skill)).length * 2 }))
      .sort((a, b) => b.score - a.score || a.index - b.index);
    return { requirement, skills, example: ranked[0]?.score > 0 ? ranked[0].example : '' };
  });
}

export function preparationEvidenceBlocks(pack) {
  const source = interviewEvidence(pack);
  const result = [block('Your CV evidence to practise', 'heading'), block(source.role), block(`Reviewed skills: ${source.skills || 'No skill labels supplied.'}`)];
  lines(source.evidence).forEach(example => result.push(block(example)));
  result.push(block('Connect your experience to the advert', 'heading'), block('Connections below use shared wording, not a judgement of proficiency or proof that a requirement is met. Check relevance and prepare the missing detail yourself.'));
  for (const connection of requirementConnections(pack)) {
    result.push(block(connection.requirement, 'heading'));
    if (connection.skills.length) result.push(block('Shared skill labels to check: ' + connection.skills.join(', ')));
    result.push(block(connection.example ? 'CV example to consider: ' + connection.example : 'No clear wording connection found in the reviewed examples. Choose a truthful example or explain the gap; do not invent experience.'));
    result.push(block('STAR prompts: What was happening? What were you responsible for? What did you personally do? What result can you support? What would you do differently?'));
  }
  return result;
}

// Explicit line budgets keep this readable on one A4 page. Full source statements
// remain in the preparation pack; shortened preview excerpts end in an ellipsis.
export function cheatSheetBlocks(job, pack) {
  const context = cleanInterviewContext(pack.interviewContext), hasContext = context.status === 'provided';
  const source = interviewEvidence(pack), examples = lines(source.evidence).slice(0, 3);
  const questions = interviewQuestions(job, pack).filter(q => !['motivation', 'closing'].includes(q.id)).slice(0, 3);
  return [block('Interview cheat sheet', 'title', 1), block(`${job.title}${job.employer ? ' · ' + job.employer : ''}`, 'subtitle', 2),
    block(`My starting point: ${source.role}. Skills: ${source.skills || 'Review the examples below.'}`, 'body', hasContext ? 2 : 3),
    ...(hasContext ? [block('Company & process — my supplied notes', 'heading', 1),
      ...(context.company ? [block('Company: ' + context.company, 'body', 2)] : []),
      ...(context.process ? [block('Interview: ' + context.process, 'body', 2)] : [])] : []),
    block('My examples — prompts, not a script', 'heading', 1),
    ...examples.map((example, i) => block(`${i + 1}. ${example}`, 'body', hasContext ? 2 : 3)),
    block('Advert priorities to prepare', 'heading', 1),
    ...lines(pack.focus).slice(0, 3).map((requirement, i) => block(`${i + 1}. ${requirement}`, 'body', 2)),
    block('Questions to rehearse', 'heading', 1),
    ...questions.slice(0, hasContext ? 2 : 3).map(q => block(q.question, 'body', 2)),
    ...(pack.answers.find(a => a.answer.trim()) ? [block('My practice-note reminder', 'heading', 1), block(pack.answers.find(a => a.answer.trim()).answer, 'body', 3)] : []),
    block('Before I join', 'heading', 1),
    block('STAR: Situation → Task → Action → Result. Be clear about my contribution; use only results I can support. Check the time, format and connection or travel.', 'body', 3),
    block('Ask: What are the first 90-day priorities? How will success be measured?', 'body', 2),
    block('Typical prompts, not employer questions. Excerpts may be shortened; use the full pack for context.', 'body', 2)];
}
