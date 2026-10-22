import test from 'node:test';
import assert from 'node:assert/strict';
import { sampleAnswer } from '../src/interview-answers.mjs';
import { ROLE_QUESTIONS, interviewQuestions } from '../src/interviews.mjs';
import { cleanPack } from '../src/application-data.mjs';
import { interviewBlocks, plainText } from '../src/application-content.mjs';
const job = { title: 'Release Manager', employer: 'Example company' };
test('all editorial role questions have labelled sample answers, separate from user notes', () => {
  for (const roleId of Object.keys(ROLE_QUESTIONS)) {
    const pack = cleanPack({ roleId, focus: 'Coordinate production releases using Jira.', prep: { role: 'Reviewed role', evidence: 'Coordinated production releases for a team.' }, interviewContext: { status: 'provided', company: 'A company priority', process: 'A panel interview' } });
    const before = JSON.stringify(pack);
    for (const q of interviewQuestions(job, pack)) {
      const answer = sampleAnswer(q, job, pack);
      assert.ok(answer.text.length > 140, q.id); assert.ok(answer.label); assert.doesNotMatch(answer.text, /undefined/);
      if (/Tell me about/i.test(q.question)) assert.match(answer.label, /Fictional/);
    }
    assert.equal(JSON.stringify(pack), before); assert.equal(pack.answers.length, 0);
  }
});
test('full pack includes a preparation plan, source-based starter, role-specific samples and independent user notes', () => {
  const pack = cleanPack({ roleId: 'release-manager', prep: { role: 'Release Manager', skills: 'Jira', evidence: 'Coordinated four production releases.' }, focus: 'SQL database administration experience is required.', answers: [{ id: 'introduction', answer: 'MY_OWN_NOTES' }] });
  const output = plainText(interviewBlocks(job, pack));
  for (const expected of ['20-minute', 'Coordinated four production releases.', 'go/no-go', 'Fictional worked example', 'MY_OWN_NOTES', 'After the conversation', 'No clear wording connection']) assert.ok(output.includes(expected), expected);
  assert.doesNotMatch(output, /I have SQL|I am certified/);
});
