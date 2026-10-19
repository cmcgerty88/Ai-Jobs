import { expand, tool, chooseSituation, profileEditor, confirmProfile, privacyControl, tracker } from './helpers.mjs';
import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const key = 'rolebridge.encrypted-workspace.v1', legacy = 'rolebridge.private-profile.v1';
const pass = 'Synthetic-pilot-password-only!';
async function create(page) {
  await page.goto('/'); await page.locator('#open-workspace').click(); await page.locator('#password').fill(pass); await page.locator('#password-confirm').fill(pass);
  await page.locator('#workspace-consent').check(); await page.locator('#create-workspace').click();
  await expect(page.locator('#workspace')).toBeVisible(); await chooseSituation(page); await profileEditor(page); await expand(page, '#cv-reader');
}
async function unlock(page, phrase = pass) { await page.locator('#password').fill(phrase); await page.locator('#create-workspace').click(); }
async function profile(page) {
  await page.locator('#currentRole').fill('Synthetic coordinator');
  await page.locator('#evidence').fill('Synthetic evidence: I coordinated schedules and prepared weekly reporting.');
  await page.locator('#skills').fill('Excel, customer service');
  await page.locator('#goal').selectOption('interviews');
  await page.locator('#expectedOutcome').fill('A clear next action for two suitable vacancies');
  await confirmProfile(page); await tool(page, 4);
}
async function job(page) {
  await page.locator('#add-job').click(); await page.locator('#job-title').fill('Synthetic target job');
  await page.locator('#job-employer').fill('Synthetic private employer');
  await page.locator('#job-description').fill('Synthetic vacancy: Excel reporting and customer service coordination.');
  await page.getByRole('button', { name: 'Save and compare' }).click();
}
async function saved(page) { await expect(page.locator('#save-status')).toContainText('Saved encrypted.'); }

test('signup to dashboard remembers goals and corrected outcomes without transmitting personal data', async ({ page }) => {
  const errors = [], requests = []; page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => requests.push({ url: r.url(), method: r.method(), body: r.postData() }));
  await create(page); await profile(page); await job(page);
  await page.getByRole('button', { name: 'Continue to dashboard' }).click();
  await expect(page.locator('#dashboard-goal')).toHaveText('Get interviews');
  await expect(page.locator('#dashboard-expectation')).toHaveText('A clear next action for two suitable vacancies');
  await expand(page, '.pilot-feedback'); await tracker(page);
  const form = page.locator('.tracker-form');
  await tracker(page); await form.locator('[name="stage"]').selectOption('applied');
  await form.getByRole('button', { name: 'Update outcome' }).click();
  await expect(form.locator('[role="alert"]')).toContainText('date first');
  const date = new Date(Date.now() - 20 * 86400000).toISOString().slice(0, 10);
  await tracker(page); await form.locator('[name="appliedAt"]').fill(date);
  await tracker(page); await form.locator('[name="nextAction"]').fill('Follow up after checking the closing date');
  await form.getByRole('button', { name: 'Update outcome' }).click();
  await expect(page.locator('#dashboard-stats .stat').first()).toContainText('1');
  await expect(page.locator('#recommendation')).toContainText('oldest unanswered');
  await expect(page.locator('#observations')).toContainText('Silence is not a rejection');
  await page.locator('#pilot-useful').selectOption('yes'); await page.locator('#pilot-return').selectOption('yes');
  await page.locator('#preview-feedback').click();
  await expect(page.locator('#feedback-preview')).toContainText('Applications recorded: 1');
  await expect(page.locator('#feedback-preview')).not.toContainText('Synthetic private employer');
  await expect(page.locator('#feedback-preview')).not.toContainText('Synthetic evidence');
  await saved(page);
  const raw = await page.evaluate(k => localStorage.getItem(k), key);
  expect(raw).not.toContain('Synthetic'); expect(raw).not.toContain(pass);
  await page.reload(); await expect(page.locator('#workspace')).toBeHidden();
  await unlock(page, 'incorrect-password-only'); await expect(page.locator('#signup-error')).toContainText('Unable to unlock');
  await expect(page.locator('#workspace')).toBeHidden();
  await unlock(page); await expect(page.locator('#workspace')).toBeVisible();
  await expect(page.locator('#expectedOutcome')).toHaveValue('A clear next action for two suitable vacancies');
  await confirmProfile(page); await tool(page, 5);
  await expect(page.locator('[name="stage"]')).toHaveValue('applied');
  await expect(page.locator('#pilot-return')).toHaveValue('yes');
  await tracker(page); await form.locator('[name="stage"]').selectOption('rejected'); await form.getByRole('button', { name: 'Update outcome' }).click();
  await expect(page.locator('#observations')).toContainText('1 recorded rejections before interview');
  await expect(page.locator('#dashboard-stats .stat').nth(2)).toContainText('0');
  await saved(page);
  expect(requests.every(r => r.url.startsWith('http://127.0.0.1:8771/') && r.method === 'GET' && !r.body)).toBeTruthy();
  expect(errors).toEqual([]);
});

test('legacy profile migration commits ciphertext before removing plaintext', async ({ page }) => {
  await page.goto('/'); await page.locator('#open-workspace').click(); await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ version: 1, profile: { name: 'Synthetic legacy', currentRole: 'Synthetic role', evidence: 'Synthetic old reviewed experience' }, jobs: [] })), legacy);
  await page.reload(); await expect(page.locator('#restore-panel')).toContainText('unencrypted');
  await page.locator('#load-saved').click(); await expect(page.locator('#name')).toHaveValue('Synthetic legacy');
  await page.locator('#save-password').fill(pass); await page.locator('#save-password-confirm').fill(pass); await page.locator('#save-consent').check();
  await page.locator('#save-confirm').click(); await expect(page.locator('#save-dialog')).toBeHidden();
  expect(await page.evaluate(k => localStorage.getItem(k), legacy)).toBeNull();
  expect(await page.evaluate(k => localStorage.getItem(k), key)).not.toContain('Synthetic legacy');
  await page.reload(); await unlock(page); await expect(page.locator('#name')).toHaveValue('Synthetic legacy');
});

test('encrypted backup restores only with password; delete clears both formats and all rendered inputs', async ({ page }) => {
  await create(page); await profile(page); await job(page); await saved(page);
  const downloaded = page.waitForEvent('download'); await privacyControl(page, 'export-profile');
  const data = await readFile(await (await downloaded).path());
  expect(data.toString()).not.toContain('Synthetic');
  await privacyControl(page, 'clear-open'); await page.locator('#clear-confirm').click(); await expect(page.locator('.hero')).toBeVisible(); await page.locator('#open-workspace').click();
  expect(await page.evaluate(([k, old]) => [localStorage.getItem(k), localStorage.getItem(old)], [key, legacy])).toEqual([null, null]);
  await expect(page.locator('#job-list')).toBeEmpty(); await expect(page.locator('#currentRole')).toHaveValue('');
  await page.locator('#backup-file').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: data });
  await expect(page.locator('#backup-status')).toContainText('Nothing has been replaced');
  await unlock(page); await expect(page.locator('#currentRole')).toHaveValue('Synthetic coordinator');
  await confirmProfile(page); await tool(page, 4);
  await expect(page.locator('#job-list')).toContainText('Synthetic target job');
});

test('expired workspace is deleted on revisit and malformed storage remains locked', async ({ page }) => {
  await create(page); await saved(page);
  await page.evaluate(k => { const v = JSON.parse(localStorage.getItem(k)); v.expiresAt = Date.now() - 1; localStorage.setItem(k, JSON.stringify(v)); }, key);
  await page.reload(); await expect(page.locator('#signup-error')).toContainText('expired');
  expect(await page.evaluate(k => localStorage.getItem(k), key)).toBeNull();
  await page.evaluate(k => localStorage.setItem(k, '{damaged'), key);
  await page.reload(); await expect(page.locator('#signup-error')).toContainText('cannot be read'); await expect(page.locator('#workspace')).toBeHidden();
});

test('automatic idle lock clears raw CV and requires unlock again', async ({ page }) => {
  await page.clock.install(); await create(page);
  await page.locator('#cv-text').fill('Synthetic raw CV that should disappear on lock');
  await page.locator('#currentRole').fill('Synthetic retained role');
  await page.clock.runFor(300); await saved(page);
  await page.clock.fastForward(610000);
  await expect(page.locator('#signup')).toBeVisible(); await expect(page.locator('#cv-text')).toHaveValue('');
  await unlock(page); await expect(page.locator('#currentRole')).toHaveValue('Synthetic retained role');
});

test('another tab writing locks the older tab instead of silently overwriting data', async ({ page, context }) => {
  await create(page); await page.locator('#currentRole').fill('Original synthetic role'); await saved(page);
  const other = await context.newPage(); await other.goto('/'); await unlock(other);
  await other.locator('#currentRole').fill('New synthetic role'); await saved(other);
  await expect(page.locator('#signup')).toBeVisible(); await unlock(page); await expect(page.locator('#currentRole')).toHaveValue('New synthetic role');
  await other.close();
});

test('blocked storage leaves session usable and saving errors visible without data loss', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('blocked', 'QuotaExceededError'); }; });
  await page.goto('/'); await page.locator('#open-workspace').click(); await page.locator('#session-only').click(); await chooseSituation(page); await profileEditor(page); await expand(page, '#cv-reader'); await profile(page);
  await page.locator('#save-open').click(); await page.locator('#save-password').fill(pass); await page.locator('#save-password-confirm').fill(pass); await page.locator('#save-consent').check(); await page.locator('#save-confirm').click();
  await expect(page.locator('#save-error')).not.toBeEmpty(); await expect(page.locator('#save-dialog')).toBeVisible();
  await page.locator('[data-close="save-dialog"]').click(); await tool(page, 1);
  await expect(page.locator('#currentRole')).toHaveValue('Synthetic coordinator');
});

test('mobile private signup and dashboard stay within viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await create(page); await profile(page); await job(page);
  await page.getByRole('button', { name: 'Continue to dashboard' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await expect(page.locator('#diagnosis-caveat')).toContainText('fewer than five'); await saved(page);
});

test('starting again cannot silently erase a legacy profile', async ({ page }) => {
  await page.goto('/'); await page.locator('#open-workspace').click(); await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ version: 1, profile: { name: 'Synthetic preserved' }, jobs: [] })), legacy);
  await page.reload(); await page.locator('#password').fill(pass); await page.locator('#password-confirm').fill(pass); await page.locator('#workspace-consent').check(); await page.locator('#create-workspace').click();
  await expect(page.locator('#signup-error')).toContainText('Load the older profile first');
  expect(await page.evaluate(k => localStorage.getItem(k), legacy)).toContain('Synthetic preserved');
  expect(await page.evaluate(k => localStorage.getItem(k), key)).toBeNull();
});

test('DOCX rejects oversized expanded XML, entity declarations and excessive nesting', async ({ page }) => {
  const { zipSync, strToU8 } = await import('fflate');
  await page.goto('/'); await page.locator('#open-workspace').click(); await page.locator('#session-only').click(); await chooseSituation(page); await profileEditor(page); await expand(page, '#cv-reader');
  for (const [xml, message] of [
    ['<document>' + 'x'.repeat(2 * 1024 * 1024) + '</document>', 'too large'],
    ['<!DOCTYPE document [<!ENTITY x "unsafe">]><document>&x;</document>', 'unsupported content'],
    ['<document>' + '<p>'.repeat(130) + 'deep' + '</p>'.repeat(130) + '</document>', 'too complex']
  ]) {
    const buffer = Buffer.from(zipSync({ 'word/document.xml': strToU8(xml) }));
    await page.locator('#cv-file').setInputFiles({ name: 'synthetic-invalid.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer });
    await expect(page.locator('#cv-status')).toContainText(message);
    await expect(page.locator('#cv-text')).toHaveValue('');
    await expect(page.locator('#cv-file')).toBeEnabled();
  }
});

test('new password requirements apply to signup and saving a temporary session', async ({ page }) => {
  await page.goto('/'); await page.locator('#open-workspace').click();
  await expect(page.getByLabel('Workspace password', { exact: true })).toBeVisible();
  await expect(page.locator('#password-hint')).toContainText('uppercase letter and one special character');
  await page.locator('#workspace-consent').check();
  for (const password of ['lowercase-password-only!', 'UppercaseLettersOnly', 'Uppercase letters only']) {
    await page.locator('#password').fill(password); await page.locator('#password-confirm').fill(password); await page.locator('#create-workspace').click();
    await expect(page.locator('#signup-error')).toContainText('uppercase letter and one special character');
    expect(await page.evaluate(k => localStorage.getItem(k), key)).toBeNull();
    await expect(page.locator('#workspace')).toBeHidden();
  }
  await page.locator('#session-only').click(); await chooseSituation(page); await profileEditor(page); await expand(page, '#cv-reader'); await page.locator('#save-open').click(); await page.locator('#save-consent').check();
  for (const password of ['lowercase-password-only!', 'UppercaseLettersOnly']) {
    await page.locator('#save-password').fill(password); await page.locator('#save-password-confirm').fill(password); await page.locator('#save-confirm').click();
    await expect(page.locator('#save-error')).toContainText('uppercase letter and one special character');
    expect(await page.evaluate(k => localStorage.getItem(k), key)).toBeNull();
  }
  await page.locator('#save-password').fill(pass); await page.locator('#save-password-confirm').fill(pass); await page.locator('#save-confirm').click();
  await expect(page.locator('#save-dialog')).toBeHidden(); await saved(page);
});

test('original passwords unlock through the form and restore an older encrypted backup', async ({ page }) => {
  await page.goto('/'); await page.locator('#open-workspace').click();
  const password = 'original lowercase words';
  const raw = await page.evaluate(async password => {
    const { seal } = await import('/src/vault.mjs');
    const { blankState, serialiseState } = await import('/src/model.mjs');
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 600000 }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    const state = blankState(); state.profile.currentRole = 'Synthetic original workspace';
    return seal(serialiseState(state), { key, salt: btoa(String.fromCharCode(...salt)) });
  }, password);
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), { key, raw }); await page.reload();
  await expect(page.locator('#password-hint')).toContainText('Existing passwords still work');
  await unlock(page, password); await expect(page.locator('#currentRole')).toHaveValue('Synthetic original workspace');
  await privacyControl(page, 'clear-open'); await page.locator('#clear-confirm').click(); await expect(page.locator('.hero')).toBeVisible(); await page.locator('#open-workspace').click();
  await page.locator('#backup-file').setInputFiles({ name: 'synthetic-original-backup.json', mimeType: 'application/json', buffer: Buffer.from(raw) });
  await expect(page.locator('#password-hint')).toContainText('Existing passwords still work');
  await unlock(page, password); await expect(page.locator('#currentRole')).toHaveValue('Synthetic original workspace');
});
