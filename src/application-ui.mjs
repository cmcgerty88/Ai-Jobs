import { cleanCv, cleanPack } from './application-data.mjs';
import { createPack, sourceKey, cvIssues, cvBlocks, interviewBlocks, keywordReview, plainText } from './application-content.mjs';
import { interviewQuestions } from './interviews.mjs';
import { cheatSheetBlocks } from './interview-prep-content.mjs';
import { ROLE_CATALOGUE } from './roles.mjs';
import { assessJob } from './matching.mjs';
import { makePdf, makeDocx, downloadDocument } from './document-export.mjs';
const $ = id => document.getElementById(id);
const node = (tag, text, className) => { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; if (className) el.className = className; return el; };
export function initApplicationPack({ getState, changed, announce }) {
  let selectedId = '', generation = 0;
  const baseForm = $('cv-base-form'), draftForm = $('cv-draft-form');
  baseForm.reset(); draftForm.reset(); $('cv-reviewed').checked = false; $('interview-focus').value = '';
  const getJob = () => getState().jobs.find(j => j.id === selectedId);
  const getPack = () => getState().packs.find(p => p.jobId === selectedId);
  const option = (value, label) => { const el = node('option', label); el.value = value; return el; };
  $('interview-role').append(option('', 'General / another role'), ...ROLE_CATALOGUE.map(r => option(r.id, r.title)));
  function invalidateReview() { $('cv-reviewed').checked = false; $('cv-export-status').textContent = ''; }
  function renderPreview() {
    const state = getState(), job = getJob(), pack = getPack(); if (!job || !pack) return;
    const preview = $('cv-preview'); preview.replaceChildren();
    for (const b of cvBlocks(state.cv, pack, job)) preview.append(node(b.style === 'title' ? 'h3' : b.style === 'heading' ? 'h4' : 'p', b.text, b.style === 'subtitle' ? 'cv-subtitle' : ''));
    const issues = cvIssues(state.cv, pack), comparison = assessJob(state.profile, job);
    const checks = [
      issues.length ? 'CV details to complete: ' + issues.join(' ') : 'Core CV sections are present. Review their accuracy before downloading.',
      comparison.failures.length ? 'Resolve this vacancy conflict: ' + comparison.failures[0] : comparison.questions.length ? 'Check the advert: ' + comparison.questions[0] : 'The entered working requirements fit; this does not confirm eligibility.',
      'Check dates and list experience most recent first. Keep only relevant, truthful information.',
      `${pack.answers.filter(a => a.answer.trim()).length} of ${interviewQuestions(job, pack).length} practice questions have notes. Practise the answers aloud.`
    ];
    $('pack-checklist').replaceChildren(...checks.map(s => node('li', s)));
    const review = keywordReview(job, pack);
    $('keyword-review').replaceChildren(node('p', review.included.length ? 'Recognised advert terms in this draft: ' + review.included.join(', ') + '.' : 'No terms from the small skill dictionary are shared yet. This is not a judgement of your suitability.'));
    if (review.check.length) $('keyword-review').append(node('p', 'Check these advert terms: ' + review.check.join(', ') + '. Add them only if accurate and supported by your experience. This limited word check is not an ATS score.'));
  }
  function renderQuestions() {
    const job = getJob(), pack = getPack(); if (!job || !pack) return;
    const list = $('interview-questions'); list.replaceChildren();
    interviewQuestions(job, pack).forEach((q, i) => {
      const section = node('details', undefined, 'interview-question'); section.open = i === 0 || Boolean(pack.answers.find(a => a.id === q.id)?.answer.trim()); section.append(node('summary', `${i + 1}. ${q.question}`), node('p', q.guidance, 'small muted'));
      const id = `answer-${q.id}`, label = node('label', 'Your practice notes (optional)'); label.htmlFor = id;
      const input = node('textarea'); input.id = id; input.rows = 4; input.maxLength = 1000; input.spellcheck = false; input.autocomplete = 'off';
      input.placeholder = 'Situation / task → what I did → result I can support → what I learned. Avoid confidential or sensitive details.';
      input.value = pack.answers.find(a => a.id === q.id)?.answer || '';
      input.addEventListener('input', () => {
        pack.answers = pack.answers.filter(a => a.id !== q.id);
        if (input.value.trim()) pack.answers.push({ id: q.id, answer: input.value });
        $('interview-export-status').textContent = ''; changed(); renderPreview();
      });
      section.append(label, input); list.append(section);
    });
  }
  async function render(jobId) {
    const state = getState(), token = ++generation;
    selectedId = state.jobs.some(j => j.id === jobId) ? jobId : state.jobs.some(j => j.id === selectedId) ? selectedId : state.jobs[0]?.id || '';
    $('pack-job').replaceChildren(...state.jobs.map(j => option(j.id, `${j.title} — ${j.employer}`)));
    $('pack-job').value = selectedId; $('pack-job').disabled = !state.jobs.length;
    const job = getJob(), pack = getPack();
    $('pack-empty').hidden = Boolean(job); $('pack-create').hidden = Boolean(pack); $('pack-create').disabled = !job;
    $('pack-delete').hidden = !pack; $('pack-editor').hidden = !pack; $('pack-stale').hidden = true;
    $('pack-status').textContent = pack ? 'This draft belongs to the selected vacancy. Review and edit it before use.' : job ? 'Create a draft from the profile you confirmed, then add your career details.' : '';
    if (job?.source?.summaryOnly) $('pack-status').textContent += ' This vacancy was imported from a short Reed summary. Check the full advert and update any missing requirements before relying on this pack.';
    $('cv-export-status').textContent = ''; $('interview-export-status').textContent = ''; invalidateReview();
    if (!pack) { $('cv-preview').replaceChildren(); $('interview-questions').replaceChildren(); baseForm.reset(); draftForm.reset(); return; }
    for (const [key, value] of Object.entries(state.cv)) { const input = baseForm.elements.namedItem(key); if (input) { if (input.type === 'checkbox') input.checked = value; else input.value = value; } }
    for (const key of ['summary', 'skills', 'highlights']) draftForm.elements.namedItem(key).value = pack[key];
    $('interview-role').value = pack.roleId; $('interview-focus').value = pack.focus;
    const link = $('pack-vacancy-link'); link.hidden = !job.url; if (job.url) link.href = job.url; else link.removeAttribute('href');
    renderPreview(); renderQuestions();
    const currentKey = await sourceKey(state.profile, job);
    if (token === generation) $('pack-stale').hidden = currentKey === pack.sourceKey;
  }
  $('pack-job').addEventListener('change', () => { render($('pack-job').value).catch(() => announce('Could not open the pack. Please try again.')); });
  $('pack-create').addEventListener('click', async () => {
    const state = getState(), job = getJob(); if (!job) return;
    if (state.packs.length >= 5) { $('pack-status').textContent = 'Five packs are already saved. Select an older pack and delete it before creating another.'; return; }
    $('pack-create').disabled = true;
    try {
      const pack = await createPack(state.profile, job);
      if (!state.jobs.some(j => j.id === job.id) || state.packs.some(p => p.jobId === job.id)) return;
      state.packs.push(pack);
      if (!state.cv.fullName) state.cv.fullName = state.profile.name;
      changed(); await render(job.id); $('cv-fullName').focus();
    } catch { $('pack-status').textContent = 'The draft could not be created. Please try again in a current browser over HTTPS.'; }
    finally { $('pack-create').disabled = false; }
  });
  $('pack-delete').addEventListener('click', () => {
    if (!getPack() || !confirm('Delete this vacancy’s CV draft and interview notes? Shared career details and downloaded files will remain.')) return;
    getState().packs = getState().packs.filter(p => p.jobId !== selectedId); changed(); render();
  });
  $('pack-refresh').addEventListener('click', async () => {
    const state = getState(), job = getJob(), pack = getPack();
    if (!job || !pack || !confirm('Replace this CV summary, skills and achievements with a fresh draft from your current profile? Your career details and interview notes will stay.')) return;
    $('pack-refresh').disabled = true;
    try { const fresh = await createPack(state.profile, job); Object.assign(pack, { summary: fresh.summary, skills: fresh.skills, highlights: fresh.highlights, sourceKey: fresh.sourceKey }); changed(); await render(job.id); }
    catch { $('cv-export-status').textContent = 'The draft could not be refreshed. Your existing text is still available.'; }
    finally { $('pack-refresh').disabled = false; }
  });
  for (const form of [baseForm, draftForm]) form.addEventListener('submit', event => event.preventDefault());
  baseForm.addEventListener('input', () => {
    getState().cv = cleanCv({ ...Object.fromEntries(new FormData(baseForm)), anonymous: $('cv-anonymous').checked });
    invalidateReview(); changed(); renderPreview();
  });
  draftForm.addEventListener('input', () => {
    const pack = getPack(); if (!pack) return;
    Object.assign(pack, cleanPack({ ...pack, ...Object.fromEntries(new FormData(draftForm)) })); invalidateReview(); changed(); renderPreview();
  });
  $('interview-update').addEventListener('click', () => {
    const pack = getPack(); if (!pack) return;
    const focus = $('interview-focus').value.trim(), roleId = $('interview-role').value;
    if (focus.split('\n').filter(s => s.trim()).length > 3) { $('interview-export-status').textContent = 'Choose up to three requirements, one per line.'; return; }
    if (focus === pack.focus && roleId === pack.roleId) return;
    if (pack.answers.some(a => a.answer.trim()) && !confirm('Replace these questions and delete their existing practice notes?')) { $('interview-role').value = pack.roleId; $('interview-focus').value = pack.focus; return; }
    pack.focus = focus; pack.roleId = roleId; pack.answers = []; changed(); renderQuestions(); renderPreview(); $('interview-export-status').textContent = 'Practice questions updated for your chosen focus.';
  });
  const exports = ['download-cv-docx', 'download-cv-pdf', 'download-cv-text', 'download-interview-pdf', 'download-interview-text', 'download-interview-cheat'];
  async function exportFile(kind, format) {
    const state = getState(), job = getJob(), pack = getPack(); if (!job || !pack) return;
    const status = $(kind === 'cv' ? 'cv-export-status' : 'interview-export-status'); status.textContent = '';
    if (kind === 'cv') {
      if (!state.cv.anonymous && !baseForm.reportValidity()) { status.textContent = 'Check your contact details, including the email address.'; return; }
      const issues = cvIssues(state.cv, pack); if (issues.length) { status.textContent = issues.join(' '); return; }
      if (!$('cv-reviewed').checked) { status.textContent = 'Review the CV and confirm that its claims, qualifications and dates are accurate before downloading.'; $('cv-reviewed').focus(); return; }
    } else if ($('interview-focus').value.trim() !== pack.focus || $('interview-role').value !== pack.roleId) { status.textContent = 'Use Update practice questions first so the download matches your selected focus.'; return; }
    const cheat = format === 'cheat';
    if (cheat) format = 'pdf';
    const blocks = cheat ? cheatSheetBlocks(job, pack) : kind === 'cv' ? cvBlocks(state.cv, pack, job) : interviewBlocks(job, pack);
    const suffix = job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'target-role';
    exports.forEach(id => { $(id).disabled = true; }); status.textContent = 'Creating your document on this device…';
    try {
      const bytes = format === 'pdf' ? await makePdf(blocks, { onePage: cheat }) : format === 'docx' ? await makeDocx(blocks) : plainText(blocks);
      const extension = format === 'text' ? 'txt' : format;
      downloadDocument(bytes, `rolebridge-${kind === 'cv' ? 'cv' : 'interview'}-${cheat ? 'cheat-sheet-' : ''}${suffix}.${extension}`, format === 'pdf' ? 'application/pdf' : format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/plain;charset=utf-8');
      status.textContent = 'Download created. Open the file to check its contents and layout before sharing it. No application was submitted.';
      announce('Your document download is ready. Review it before sharing.');
    } catch (error) { status.textContent = error.message || 'The download could not be created. Try again or use the text format.'; }
    finally { exports.forEach(id => { $(id).disabled = false; }); }
  }
  for (const id of exports) { const [, kind, format] = id.split('-'); $(id).addEventListener('click', () => exportFile(kind, format)); }
  return { render };
}
