import { blankState, cleanProfile, cleanJob, STORAGE_KEY, serialiseState, restoreState, safeJobUrl, findSkillMentions } from './model.mjs';
import { assessJob } from './matching.mjs';
import { readCv } from './cv.mjs';
import { ROLE_CATALOGUE, exploreRoles, matchRole, roleById, prepareSearchTerms } from './roles.mjs';

const $ = id => document.getElementById(id);
const node = (tag, text, className) => { const value = document.createElement(tag); if (text !== undefined) value.textContent = text; if (className) value.className = className; return value; };
let state = blankState();
let currentStep = 1, fileGeneration = 0, pendingRemoval = null, savedSnapshot = null;
let hasSavedCopy = false;
const profileForm = $('profile-form'), preferencesForm = $('preferences-form'), jobForm = $('job-form');

function announce(text) { $('announcement').textContent = ''; requestAnimationFrame(() => { $('announcement').textContent = text; }); }
function syncProfile() {
  state.profile = cleanProfile({ ...Object.fromEntries(new FormData(profileForm)), ...Object.fromEntries(new FormData(preferencesForm)) });
}
function fillProfile() {
  for (const [name, value] of Object.entries(state.profile)) { const input = $(name); if (input) input.value = value; }
  $('profile-confirmed').checked = false;
}
function setSaveStatus() {
  if (savedSnapshot === serialiseState(state)) {
    $('save-heading').textContent = 'Your profile, directions and vacancies are saved on this device.';
    $('save-status').textContent = 'The original CV and CV-text box are not saved. Save again after making changes.';
  } else {
    $('save-heading').textContent = 'Your latest work is in this tab.';
    $('save-status').textContent = hasSavedCopy ? 'Changes have not been saved. Your previously saved copy is unchanged.' : 'Closing or refreshing the page will clear unsaved information.';
  }
}
function profileChanged(event) {
  if (event?.target !== $('profile-confirmed')) $('profile-confirmed').checked = false;
  syncProfile(); setSaveStatus();
}
profileForm.addEventListener('input', profileChanged);
preferencesForm.addEventListener('input', () => { syncProfile(); setSaveStatus(); });
$('country').addEventListener('change', () => { $('currency').value = $('country').value === 'IE' ? 'EUR' : 'GBP'; syncProfile(); setSaveStatus(); });

function showStep(step, focus = true) {
  currentStep = step;
  document.querySelectorAll('.step-panel').forEach(section => { section.hidden = section.id !== `step-${step}`; });
  document.querySelectorAll('[data-step]').forEach(button => { if (Number(button.dataset.step) === step) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current'); });
  if (step === 3) renderDirections();
  if (step === 4) renderResults();
  if (focus) {
    const heading = $({ 1: 'experience-title', 2: 'preferences-title', 3: 'directions-title', 4: 'vacancies-title' }[step]);
    heading.focus({ preventScroll: true }); heading.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
}
function navigate(step) {
  syncProfile();
  if (step > 1 && !profileForm.checkValidity()) { showStep(1); profileForm.reportValidity(); return; }
  if (step > 2 && !preferencesForm.checkValidity()) { showStep(2); preferencesForm.reportValidity(); return; }
  showStep(step);
}
document.querySelectorAll('[data-step]').forEach(button => button.addEventListener('click', () => navigate(Number(button.dataset.step))));
document.querySelectorAll('[data-back]').forEach(button => button.addEventListener('click', () => navigate(Number(button.dataset.back))));
profileForm.addEventListener('submit', event => { event.preventDefault(); navigate(2); });
preferencesForm.addEventListener('submit', event => { event.preventDefault(); navigate(3); });

function renderSavedDirections() {
  const list = $('saved-directions'); list.replaceChildren();
  const chosen = state.roleDirections.map(roleById).filter(Boolean);
  if (!chosen.length) { list.append(node('li', 'No directions saved yet.', 'muted small')); return; }
  for (const role of chosen) {
    const item = node('li'); item.append(node('strong', role.title));
    if (!matchRole(state.profile, role).relevant) item.append(node('p', 'Saved to explore; not currently connected by the library’s skill rules.', 'hint'));
    const remove = node('button', 'Remove', 'text-button'); remove.type = 'button'; remove.setAttribute('aria-label', `Remove saved direction ${role.title}`);
    remove.addEventListener('click', () => { state.roleDirections = state.roleDirections.filter(id => id !== role.id); renderDirections(); setSaveStatus(); $('role-view').focus(); });
    item.append(remove); list.append(item);
  }
}
function renderDirections() {
  syncProfile();
  state.roleDirections = state.roleDirections.filter(id => roleById(id));
  $('direction-evidence').textContent = state.profile.evidence;
  renderSavedDirections();
  const filter = $('role-view').value, query = $('role-search').value.trim().toLowerCase();
  let results = filter === 'suggested' ? exploreRoles(state.profile) : ROLE_CATALOGUE.filter(role => filter !== 'saved' || state.roleDirections.includes(role.id)).map(role => matchRole(state.profile, role));
  results = results.filter(({ role }) => `${role.title} ${role.category} ${role.terms.join(' ')}`.toLowerCase().includes(query));
  $('direction-count').textContent = `${results.length} ${results.length === 1 ? 'direction' : 'directions'} shown · ${ROLE_CATALOGUE.length} in this limited library. Salary, location and eligibility must be checked on actual vacancies.`;
  const list = $('role-list'); list.replaceChildren();
  if (!results.length) {
    const empty = node('div', undefined, 'empty-state');
    empty.append(node('h3', query ? 'No directions match this filter.' : filter === 'saved' ? 'Your exploration list is empty.' : 'No directions connected by these skill rules yet.'));
    empty.append(node('p', 'This says nothing about your employability. The library is small and recognises specific skill labels. You can review your confirmed skills or browse all directions.'));
    const browse = node('button', 'Browse all directions', 'secondary'); browse.type = 'button'; browse.addEventListener('click', () => { $('role-view').value = 'all'; $('role-search').value = ''; renderDirections(); $('role-view').focus(); }); empty.append(browse); list.append(empty);
  }
  for (const result of results) {
    const { role, matches } = result;
    const card = node('article', undefined, 'role-card'); card.dataset.roleId = role.id;
    const header = node('div', undefined, 'job-header');
    const title = node('div'); title.append(node('p', role.category, 'eyebrow'), node('h3', role.title));
    header.append(title, node('span', result.relevant ? 'Skill connections' : 'Browse to explore', 'badge ' + (result.relevant ? 'consider' : 'investigate'))); card.append(header, node('p', role.description, 'muted small'));
    if (matches.length) {
      card.append(node('h4', 'Connections to skills you confirmed'));
      const connections = node('ul', undefined, 'role-connections');
      for (const match of matches) { const item = node('li'); item.append(node('strong', match.supplied), document.createTextNode(' ' + match.connection + '.')); connections.append(item); }
      card.append(connections);
    } else card.append(node('p', 'No confirmed skill labels connect to this entry. You can still explore it; the tool has not assessed whether you are qualified.', 'hint'));
    const details = node('details'); details.append(node('summary', 'What to check before pursuing this direction'));
    listSection(details, 'Questions for actual vacancies', role.checks);
    if (result.prompts.length) details.append(node('p', 'Other areas to look for in adverts: ' + result.prompts.join(', ') + '. These are not recorded as matching labels in your profile; that does not mean you lack them or that every employer requires them.', 'hint'));
    details.append(node('h4', 'An example you could prepare'), node('p', role.example, 'small'));
    const terms = prepareSearchTerms(role, state.profile).join('\n');
    const termsId = `terms-${role.id}`;
    const label = node('label', 'Search phrases you can use'); label.htmlFor = termsId;
    const text = node('textarea'); text.id = termsId; text.readOnly = true; text.rows = 3; text.value = terms; text.className = 'search-phrases';
    const copy = node('button', 'Copy search phrases', 'secondary'); copy.type = 'button';
    const status = node('p', '', 'hint'); status.setAttribute('role', 'status');
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(terms); status.textContent = 'Copied. Paste into your preferred job site or employer search. Nothing was searched or sent automatically.'; }
      catch { text.focus(); text.select(); status.textContent = 'Automatic copying is unavailable. The phrases are selected; use your browser’s Copy action.'; }
    });
    details.append(label, text, node('p', 'These are search phrases, not links to jobs. No search is run and no information is sent to a job site.', 'hint'), copy, status); card.append(details);
    const actions = node('div', undefined, 'job-actions');
    const saved = state.roleDirections.includes(role.id);
    const save = node('button', saved ? 'Saved direction' : 'Save this direction', 'secondary'); save.type = 'button'; save.setAttribute('aria-pressed', String(saved));
    save.addEventListener('click', () => {
      const already = state.roleDirections.includes(role.id);
      if (!already && state.roleDirections.length >= 5) { $('direction-feedback').textContent = 'You have saved five directions. Remove one before adding another.'; announce('Five directions already saved. Remove one to make room.'); return; }
      state.roleDirections = already ? state.roleDirections.filter(id => id !== role.id) : [...state.roleDirections, role.id];
      save.textContent = already ? 'Save this direction' : 'Saved direction'; save.setAttribute('aria-pressed', String(!already));
      $('direction-feedback').textContent = already ? 'Direction removed from this tab.' : 'Direction saved in this tab. Save on this device below to keep it after refreshing.';
      renderSavedDirections(); setSaveStatus();
      if (filter === 'saved' && already) { renderDirections(); $('role-view').focus(); }
    });
    actions.append(save); card.append(actions); list.append(card);
  }
}
$('role-view').addEventListener('change', renderDirections);
$('role-search').addEventListener('input', renderDirections);

function showSkillSuggestions() {
  const mentions = findSkillMentions($('cv-text').value);
  const container = $('skill-chips'); container.replaceChildren();
  $('skill-suggestions').hidden = false;
  if (!mentions.length) { container.append(node('p', 'No common skill terms were detected. Add your own skills to the profile; this is not a judgement about your experience.', 'hint')); return; }
  const existing = new Set($('skills').value.split(/[,;\n]/).map(value => value.trim().toLowerCase()));
  for (const skill of mentions) {
    const button = node('button', skill); button.type = 'button'; button.setAttribute('aria-pressed', String(existing.has(skill.toLowerCase())));
    button.addEventListener('click', () => {
      const skills = $('skills').value.split(/[,;\n]/).map(value => value.trim()).filter(Boolean);
      const found = skills.findIndex(value => value.toLowerCase() === skill.toLowerCase());
      if (found === -1) skills.push(skill); else skills.splice(found, 1);
      $('skills').value = skills.join(', '); button.setAttribute('aria-pressed', String(found === -1)); profileChanged();
    });
    container.append(button);
  }
}
$('find-skills').addEventListener('click', showSkillSuggestions);
$('cv-text').addEventListener('input', () => { $('skill-suggestions').hidden = true; $('cv-status').textContent = 'CV text is held only in this tab. Review it and add relevant examples to your profile.'; });
$('use-selection').addEventListener('click', () => {
  const input = $('cv-text'); const selected = input.value.slice(input.selectionStart, input.selectionEnd).trim();
  if (!selected) { $('cv-status').textContent = 'First highlight a passage in the CV-text box, then choose “Add selected text to my examples”.'; input.focus(); return; }
  const combined = [$('evidence').value.trim(), selected].filter(Boolean).join('\n\n');
  if (combined.length > 12000) { $('cv-status').textContent = 'There is too much text for the experience profile. Select a shorter example.'; return; }
  $('evidence').value = combined; profileChanged(); $('evidence').focus(); announce('Selected text added to your examples. Please check it.');
});
$('cv-file').addEventListener('change', async () => {
  const file = $('cv-file').files[0]; if (!file) return;
  const generation = ++fileGeneration;
  $('cv-file').disabled = true; $('cv-text').disabled = true;
  $('cv-status').textContent = 'Reading your CV on this device…'; $('cv-status').classList.remove('error-text');
  try {
    const text = await readCv(file); if (generation !== fileGeneration) return;
    $('cv-text').value = text;
    $('cv-status').textContent = `Read ${file.name} in your browser. Review the text and add relevant examples to your profile.`;
    showSkillSuggestions();
  } catch (error) {
    if (generation !== fileGeneration) return;
    $('cv-status').textContent = error.message || 'The file could not be read. Please paste your CV text instead.';
    $('cv-status').classList.add('error-text');
  } finally {
    if (generation === fileGeneration) { $('cv-file').disabled = false; $('cv-text').disabled = false; $('cv-file').value = ''; }
  }
});

function openJob(existing) {
  if (state.jobs.length >= 30 && !existing) { announce('This first version supports 30 vacancies. Remove an old vacancy before adding another.'); return; }
  jobForm.reset(); $('job-error').textContent = '';
  $('job-dialog-title').textContent = existing ? 'Edit your vacancy' : 'Add a vacancy';
  if (existing) {
    for (const [key, value] of Object.entries(existing)) { const field = jobForm.elements.namedItem(key); if (field) field.value = value; }
    // A new edit must not silently assert that the source was rechecked today.
    if (existing.status === 'open') $('job-status').value = 'unchecked';
  } else { $('job-currency').value = state.profile.currency; }
  $('job-dialog').showModal(); $('job-title').focus();
}
$('add-job').addEventListener('click', () => openJob());
jobForm.addEventListener('submit', event => {
  event.preventDefault(); $('job-error').textContent = '';
  if (!jobForm.reportValidity()) return;
  const data = Object.fromEntries(new FormData(jobForm));
  if (data.url.trim() && !safeJobUrl(data.url)) { $('job-error').textContent = 'Use a valid HTTPS vacancy link without a username or password in the address.'; $('job-url').focus(); return; }
  if (data.salaryMin !== '' && data.salaryMax !== '' && Number(data.salaryMin) > Number(data.salaryMax)) { $('job-error').textContent = 'The lower salary must not exceed the upper salary.'; $('job-min').focus(); return; }
  const existing = state.jobs.find(job => job.id === data.id);
  const job = cleanJob({ ...data, id: existing?.id || crypto.randomUUID(), selected: existing?.selected || false, checkedAt: data.status === 'open' ? new Date().toISOString() : '' });
  if (existing) state.jobs[state.jobs.indexOf(existing)] = job; else state.jobs.push(job);
  $('job-dialog').close(); renderResults(); setSaveStatus(); announce('Vacancy saved in this tab and compared with your requirements.');
});

function listSection(details, title, values) {
  if (!values.length) return;
  details.append(node('h4', title)); const list = node('ul'); values.forEach(value => list.append(node('li', value))); details.append(list);
}
function currencyAmount(value, currency) { return new Intl.NumberFormat('en-GB', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value)); }
function renderResults() {
  syncProfile();
  $('summary-name').textContent = state.profile.name || 'Your profile';
  $('summary-role').textContent = state.profile.currentRole;
  $('summary-evidence').textContent = state.profile.evidence;
  const p = state.profile;
  const preferences = [p.country === 'GB' ? 'United Kingdom' : 'Republic of Ireland'];
  if (p.locations) preferences.push(p.locations);
  if (p.minimumSalary !== '') preferences.push(`${currencyAmount(p.minimumSalary, p.currency)} minimum gross annual pay`);
  preferences.push({ any: 'Open to different working patterns', remote: 'Remote only', hybrid: 'Hybrid only', onsite: 'On-site only' }[p.workMode]);
  if (p.workMode === 'hybrid' || p.workMode === 'any') preferences.push(`Up to ${p.maxOfficeDays} office days for hybrid roles`);
  if (p.hours !== 'any') preferences.push(p.hours === 'full-time' ? 'Full-time only' : 'Part-time only');
  $('summary-preferences').replaceChildren(...preferences.map(value => node('li', value)));
  const comparisons = state.jobs.map(job => ({ job, result: assessJob(p, job) }));
  comparisons.filter(item => item.result.status === 'skip').forEach(({ job }) => { job.selected = false; });
  const count = status => comparisons.filter(item => item.result.status === status).length;
  $('results-count').textContent = state.jobs.length ? `${count('consider')} worth considering · ${count('investigate')} need checking · ${count('skip')} ruled out by your entries` : 'No vacancies added yet.';
  const container = $('job-list'); container.replaceChildren();
  if (!state.jobs.length) {
    const empty = node('div', undefined, 'empty-state'); empty.append(node('h3', 'Start with one real vacancy.'), node('p', 'Bring a job you are considering. You will see which requirements fit, which conflict and which still need checking.'));
    const button = node('button', 'Add your first vacancy', 'primary'); button.type = 'button'; button.addEventListener('click', () => openJob()); empty.append(button); container.append(empty);
  }
  const order = { consider: 0, investigate: 1, skip: 2 };
  comparisons.sort((a, b) => order[a.result.status] - order[b.result.status]);
  for (const { job, result } of comparisons) {
    const card = node('article', undefined, `job-card ${result.status}`); card.dataset.jobId = job.id;
    const header = node('div', undefined, 'job-header'); const title = node('div');
    title.append(node('h3', job.title), node('p', job.employer, 'job-employer'));
    header.append(title, node('span', { consider: 'Consider', investigate: 'Investigate', skip: 'Skip' }[result.status], `badge ${result.status}`)); card.append(header);
    const meta = node('div', undefined, 'job-meta');
    if (job.salaryMin !== '' && job.salaryMax !== '') meta.append(node('span', `${currencyAmount(job.salaryMin, job.currency)}–${currencyAmount(job.salaryMax, job.currency)} / year`));
    if (job.location) meta.append(node('span', job.location));
    if (job.mode !== 'unknown') meta.append(node('span', { remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' }[job.mode]));
    card.append(meta);
    card.append(node('p', result.failures[0] || result.questions[0] || 'The entered requirements fit, and you confirmed the essentials. This is worth reviewing; it is not a prediction of an interview.', 'job-reason'));
    const details = node('details', undefined, 'job-details'); details.append(node('summary', 'See the reasons and missing information'));
    listSection(details, 'Conflicts with your requirements', result.failures);
    listSection(details, 'Questions to resolve', result.questions);
    listSection(details, 'What fits, based on your entries', result.fits);
    if (result.skills.length) { details.append(node('h4', 'Shared skill mentions'), node('p', result.skills.join(', ') + '. These are text matches, not proof that you meet the requirements.', 'small muted')); }
    details.append(node('h4', 'Job description you supplied'), node('p', job.description, 'small preserve-lines'));
    card.append(details);
    const checkedAt = Date.parse(job.checkedAt);
    card.append(node('p', job.status === 'open' && Number.isFinite(checkedAt) ? `You marked the original page open on ${new Date(checkedAt).toLocaleString()}. This is not an independent check or proof of hiring intent.` : job.status === 'closed' ? 'You marked this vacancy as closed.' : 'The current vacancy status has not been checked.', 'hint'));
    const next = node('p', undefined, 'next-action'); next.append(node('strong', 'Next step'), document.createTextNode(result.nextAction)); card.append(next);
    const actions = node('div', undefined, 'job-actions');
    if (result.status !== 'skip') {
      const select = node('button', job.selected ? 'Added to your plan' : 'Add to your plan', 'secondary'); select.type = 'button'; select.setAttribute('aria-pressed', String(job.selected));
      select.addEventListener('click', () => { job.selected = !job.selected; select.textContent = job.selected ? 'Added to your plan' : 'Add to your plan'; select.setAttribute('aria-pressed', String(job.selected)); renderPlan(); setSaveStatus(); }); actions.append(select);
    }
    if (job.url) { const link = node('a', 'Open original vacancy'); link.href = job.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; actions.append(link); }
    const edit = node('button', 'Edit', 'text-button'); edit.type = 'button'; edit.setAttribute('aria-label', `Edit ${job.title}`); edit.addEventListener('click', () => openJob(job));
    const remove = node('button', 'Remove', 'text-button danger'); remove.type = 'button'; remove.setAttribute('aria-label', `Remove ${job.title}`);
    remove.addEventListener('click', () => { pendingRemoval = job.id; $('remove-description').textContent = `${job.title} at ${job.employer} will be removed from this tab.`; $('remove-job-dialog').showModal(); });
    actions.append(edit, remove); card.append(actions); container.append(card);
  }
  renderPlan(); setSaveStatus();
}
function renderPlan() {
  const plan = $('action-list'); plan.replaceChildren();
  const selected = state.jobs.filter(job => job.selected && assessJob(state.profile, job).status !== 'skip');
  const directions = state.roleDirections.map(roleById).filter(Boolean);
  if (!selected.length && !directions.length) { plan.append(node('li', 'Save a role direction or choose a vacancy to add a practical next step here.')); return; }
  for (const role of directions) { const item = node('li'); item.append(node('strong', 'Explore: ' + role.title), node('small', role.example)); plan.append(item); }
  for (const job of selected) { const item = node('li'); item.append(node('strong', job.title), node('small', assessJob(state.profile, job).nextAction)); plan.append(item); }
}
$('remove-job-confirm').addEventListener('click', () => { state.jobs = state.jobs.filter(job => job.id !== pendingRemoval); pendingRemoval = null; $('remove-job-dialog').close(); renderResults(); announce('Vacancy removed from this tab.'); });

document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => $(button.dataset.close).close()));
for (const id of ['privacy-open', 'privacy-footer']) $(id).addEventListener('click', () => $('privacy-dialog').showModal());
$('save-open').addEventListener('click', () => { syncProfile(); $('save-consent').checked = false; $('save-error').textContent = ''; $('save-dialog').showModal(); });
$('save-confirm').addEventListener('click', () => {
  if (!$('save-consent').checked) { $('save-error').textContent = 'Please confirm that you want to store your information on this device.'; return; }
  syncProfile();
  try { const json = serialiseState(state); localStorage.setItem(STORAGE_KEY, json); savedSnapshot = json; hasSavedCopy = true; $('restore-panel').hidden = true; $('save-dialog').close(); setSaveStatus(); announce('Your profile, directions and vacancies were saved on this device. The raw CV was not saved.'); }
  catch { $('save-error').textContent = 'Your browser did not allow local saving. Your current information is still in this tab. You can download your profile instead.'; }
});
$('load-saved').addEventListener('click', () => {
  try {
    state = restoreState(localStorage.getItem(STORAGE_KEY)); savedSnapshot = serialiseState(state); hasSavedCopy = true; fillProfile(); $('restore-panel').hidden = true; showStep(1); setSaveStatus(); announce('Saved profile loaded. Please review and confirm your experience before continuing.');
  } catch { $('restore-panel').querySelector('p').textContent = 'The saved data could not be read. You can delete that saved copy and start again.'; }
});
$('delete-saved').addEventListener('click', () => {
  if (!window.confirm('Delete the saved copy from this browser? Your current unsaved inputs will stay in this tab.')) return;
  try { localStorage.removeItem(STORAGE_KEY); hasSavedCopy = false; savedSnapshot = null; $('restore-panel').hidden = true; setSaveStatus(); announce('Saved copy deleted. Current inputs are unchanged.'); }
  catch { announce('The saved copy could not be deleted. Check your browser storage settings.'); }
});
$('clear-open').addEventListener('click', () => $('clear-dialog').showModal());
$('clear-confirm').addEventListener('click', () => {
  fileGeneration++;
  let storageCleared = true;
  try { localStorage.removeItem(STORAGE_KEY); } catch { storageCleared = false; }
  state = blankState(); savedSnapshot = null; hasSavedCopy = !storageCleared;
  profileForm.reset(); preferencesForm.reset(); jobForm.reset(); fillProfile();
  $('cv-text').value = ''; $('cv-file').value = ''; $('cv-text').disabled = false; $('cv-file').disabled = false;
  $('cv-status').textContent = 'Or paste your CV text below.'; $('cv-status').classList.remove('error-text');
  $('skill-chips').replaceChildren(); $('skill-suggestions').hidden = true; $('restore-panel').hidden = storageCleared;
  $('summary-name').textContent = 'Your profile'; $('summary-role').textContent = ''; $('summary-evidence').textContent = '';
  $('summary-preferences').replaceChildren(); $('job-list').replaceChildren(); $('action-list').replaceChildren(); $('results-count').textContent = '';
  $('role-list').replaceChildren(); $('saved-directions').replaceChildren(); $('direction-evidence').textContent = ''; $('direction-feedback').textContent = ''; $('direction-count').textContent = ''; $('role-view').value = 'suggested'; $('role-search').value = '';
  $('job-error').textContent = ''; $('remove-description').textContent = ''; pendingRemoval = null;
  $('clear-dialog').close(); showStep(1); setSaveStatus();
  if (!storageCleared) { $('save-status').textContent = 'Current inputs were cleared, but saved storage could not be deleted. Remove this site’s data in your browser settings.'; }
  announce(storageCleared ? 'Your information and saved copy have been cleared from this app.' : 'Current inputs cleared. Check browser storage settings to delete any saved copy.');
});
$('export-profile').addEventListener('click', () => {
  syncProfile();
  const blob = new Blob([serialiseState(state)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const link = node('a'); link.href = url; link.download = 'rolebridge-private-profile.json'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce('Your private profile download has started. Keep it somewhere safe; it contains your personal information.');
});

try { hasSavedCopy = Boolean(localStorage.getItem(STORAGE_KEY)); $('restore-panel').hidden = !hasSavedCopy; } catch { /* The app remains usable without persistent storage. */ }
fillProfile(); showStep(1, false);
// Never auto-save. No service worker, analytics or external requests are used.
