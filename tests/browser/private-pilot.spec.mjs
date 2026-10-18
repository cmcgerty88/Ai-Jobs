import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const key = 'rolebridge.encrypted-workspace.v1', legacy = 'rolebridge.private-profile.v1';
const pass = 'synthetic-pilot-passphrase-only';
async function create(page) {
  await page.goto('/'); await page.locator('#passphrase').fill(pass); await page.locator('#passphrase-confirm').fill(pass);
  await page.locator('#workspace-consent').check(); await page.locator('#create-workspace').click();
  await expect(page.locator('#workspace')).toBeVisible();
}
async function unlock(page, phrase = pass) { await page.locator('#passphrase').fill(phrase); await page.locator('#create-workspace').click(); }
async function profile(page) {
  await page.locator('#currentRole').fill('Synthetic coordinator');
  await page.locator('#evidence').fill('Synthetic evidence: I coordinated schedules and prepared weekly reporting.');
  await page.locator('#skills').fill('Excel, customer service');
  await page.locator('#goal').selectOption('interviews');
  await page.locator('#expectedOutcome').fill('A clear next action for two suitable vacancies');
  await page.locator('#profile-confirmed').check(); await page.locator('.steps [data-step="4"]').click();
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
  const form = page.locator('.tracker-form');
  await form.locator('[name="stage"]').selectOption('applied');
  await form.getByRole('button', { name: 'Update outcome' }).click();
  await expect(form.locator('[role="alert"]')).toContainText('date first');
  const date = new Date(Date.now() - 20 * 86400000).toISOString().slice(0, 10);
  await form.locator('[name="appliedAt"]').fill(date);
  await form.locator('[name="nextAction"]').fill('Follow up after checking the closing date');
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
  await unlock(page, 'incorrect-passphrase-only'); await expect(page.locator('#signup-error')).toContainText('Unable to unlock');
  await expect(page.locator('#workspace')).toBeHidden();
  await unlock(page); await expect(page.locator('#workspace')).toBeVisible();
  await expect(page.locator('#expectedOutcome')).toHaveValue('A clear next action for two suitable vacancies');
  await page.locator('#profile-confirmed').check(); await page.locator('.steps [data-step="5"]').click();
  await expect(page.locator('[name="stage"]')).toHaveValue('applied');
  await expect(page.locator('#pilot-return')).toHaveValue('yes');
  await form.locator('[name="stage"]').selectOption('rejected'); await form.getByRole('button', { name: 'Update outcome' }).click();
  await expect(page.locator('#observations')).toContainText('1 recorded rejections before interview');
  await expect(page.locator('#dashboard-stats .stat').nth(2)).toContainText('0');
  await saved(page);
  expect(requests.every(r => r.url.startsWith('http://127.0.0.1:8771/') && r.method === 'GET' && !r.body)).toBeTruthy();
  expect(errors).toEqual([]);
});

test('legacy profile migration commits ciphertext before removing plaintext', async ({ page }) => {
  await page.goto('/'); await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ version: 1, profile: { name: 'Synthetic legacy', currentRole: 'Synthetic role', evidence: 'Synthetic old reviewed experience' }, jobs: [] })), legacy);
  await page.reload(); await expect(page.locator('#restore-panel')).toContainText('unencrypted');
  await page.locator('#load-saved').click(); await expect(page.locator('#name')).toHaveValue('Synthetic legacy');
  await page.locator('#save-passphrase').fill(pass); await page.locator('#save-passphrase-confirm').fill(pass); await page.locator('#save-consent').check();
  await page.locator('#save-confirm').click(); await expect(page.locator('#save-dialog')).toBeHidden();
  expect(await page.evaluate(k => localStorage.getItem(k), legacy)).toBeNull();
  expect(await page.evaluate(k => localStorage.getItem(k), key)).not.toContain('Synthetic legacy');
  await page.reload(); await unlock(page); await expect(page.locator('#name')).toHaveValue('Synthetic legacy');
});

test('encrypted backup restores only with passphrase; delete clears both formats and all rendered inputs', async ({ page }) => {
  await create(page); await profile(page); await job(page); await saved(page);
  const downloaded = page.waitForEvent('download'); await page.locator('#export-profile').click();
  const data = await readFile(await (await downloaded).path());
  expect(data.toString()).not.toContain('Synthetic');
  await page.locator('#clear-open').click(); await page.locator('#clear-confirm').click(); await expect(page.locator('#signup')).toBeVisible();
  expect(await page.evaluate(([k, old]) => [localStorage.getItem(k), localStorage.getItem(old)], [key, legacy])).toEqual([null, null]);
  await expect(page.locator('#job-list')).toBeEmpty(); await expect(page.locator('#currentRole')).toHaveValue('');
  await page.locator('#backup-file').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: data });
  await expect(page.locator('#backup-status')).toContainText('Nothing has been replaced');
  await unlock(page); await expect(page.locator('#currentRole')).toHaveValue('Synthetic coordinator');
  await page.locator('#profile-confirmed').check(); await page.locator('.steps [data-step="4"]').click();
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
  await page.goto('/'); await page.locator('#session-only').click(); await profile(page);
  await page.locator('#save-open').click(); await page.locator('#save-passphrase').fill(pass); await page.locator('#save-passphrase-confirm').fill(pass); await page.locator('#save-consent').check(); await page.locator('#save-confirm').click();
  await expect(page.locator('#save-error')).not.toBeEmpty(); await expect(page.locator('#save-dialog')).toBeVisible();
  await page.locator('[data-close="save-dialog"]').click(); await page.locator('.steps [data-step="1"]').click();
  await expect(page.locator('#currentRole')).toHaveValue('Synthetic coordinator');
});

test('mobile private signup and dashboard stay within viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 }); await create(page); await profile(page); await job(page);
  await page.getByRole('button', { name: 'Continue to dashboard' }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await expect(page.locator('#diagnosis-caveat')).toContainText('fewer than five'); await saved(page);
});

test('starting again cannot silently erase a legacy profile', async ({ page }) => {
  await page.goto('/'); await page.evaluate(k => localStorage.setItem(k, JSON.stringify({ version: 1, profile: { name: 'Synthetic preserved' }, jobs: [] })), legacy);
  await page.reload(); await page.locator('#passphrase').fill(pass); await page.locator('#passphrase-confirm').fill(pass); await page.locator('#workspace-consent').check(); await page.locator('#create-workspace').click();
  await expect(page.locator('#signup-error')).toContainText('Load the older profile first');
  expect(await page.evaluate(k => localStorage.getItem(k), legacy)).toContain('Synthetic preserved');
  expect(await page.evaluate(k => localStorage.getItem(k), key)).toBeNull();
});

test('DOCX rejects oversized expanded XML, entity declarations and excessive nesting', async ({ page }) => {
  const { zipSync, strToU8 } = await import('fflate');
  await page.goto('/'); await page.locator('#session-only').click();
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
