import { test, expect } from '@playwright/test';
import { expand, tool, tracker } from './helpers.mjs';
const key = 'rolebridge.encrypted-workspace.v1';
async function begin(page, goal = 'clarity') {
  await page.goto('/');
  await expect(page.locator('#signup')).toBeHidden();
  await page.getByRole('link', { name: 'Get my free Job Search Diagnosis' }).click();
  await expect(page.locator('#step-0')).toBeVisible();
  await page.locator(`[data-goal="${goal}"]`).click();
}
async function experience(page, skills = 'customer service, Excel, scheduling') {
  await page.locator('#currentRole').fill('Synthetic coordinator');
  await page.locator('#evidence').fill('Prepared weekly reports and coordinated customer service schedules.');
  await page.locator('#skills').fill(skills);
  await page.locator('#profile-confirmed').check();
  await page.getByRole('button', { name: 'Show my next step' }).click();
  await expect(page.locator('#step-7')).toBeVisible();
}
for (const [goal, action] of [['clarity', 'Explore one of these role directions'], ['interviews', 'Check the evidence in one application'], ['offers', 'Practise one specific example for your next interview']]) {
  test(`${goal}: first useful result without signup, a vacancy or a network submission`, async ({ page }) => {
    const requests = [], errors = [];
    page.on('request', r => requests.push({ url: r.url(), method: r.method(), body: r.postData() }));
    page.on('pageerror', e => errors.push(e.message));
    await begin(page, goal);
    await expect(page.locator('.hero')).toBeHidden();
    await expect(page.locator('#cv-file')).toBeHidden();
    await expect(page.locator('#goal')).toHaveValue(goal);
    await page.getByRole('button', { name: 'Show my next step' }).click();
    await expect(page.locator('#step-1')).toBeVisible();
    await experience(page);
    await expect(page.locator('#first-plan-action')).toHaveText(action);
    await expect(page.locator('#first-plan-title')).toBeFocused();
    await expect(page.locator('#first-plan-roles article')).toHaveCount(goal === 'clarity' ? 2 : 0);
    expect(await page.evaluate(() => localStorage.length)).toBe(0);
    expect(requests.every(r => r.url.startsWith('http://127.0.0.1:8771/') && r.method === 'GET' && !r.body)).toBeTruthy();
    expect(errors).toEqual([]);
    await page.locator('#first-plan-continue').click();
    await expect(page.locator('#step-8')).toBeVisible();
    await expect(page.locator('#vacancy-pool-status')).toContainText('not connected yet');
  });
}

test('CV-assisted result saves only reviewed details after consent and returns to a check-in', async ({ page }) => {
  await begin(page);
  await expand(page, '#cv-reader');
  await page.locator('#cv-file').setInputFiles({ name: 'synthetic.txt', mimeType: 'text/plain', buffer: Buffer.from('PRIVATE_RAW_MARKER. Customer service and Excel.') });
  await expect(page.locator('#cv-text')).toHaveValue(/PRIVATE_RAW_MARKER/);
  await experience(page);
  await page.locator('#result-save').click();
  await page.locator('#save-confirm').click();
  await expect(page.locator('#save-error')).toContainText('Please confirm');
  expect(await page.evaluate(k => localStorage.getItem(k), key)).toBeNull();
  const password = 'Synthetic-private-password!';
  await page.locator('#save-password').fill(password); await page.locator('#save-password-confirm').fill(password);
  await page.locator('#save-consent').check(); await page.locator('#save-confirm').click();
  await expect(page.locator('#save-dialog')).toBeHidden();
  const json = await page.evaluate(async ({ key, password }) => {
    const { unseal } = await import('/src/vault.mjs');
    return (await unseal(localStorage.getItem(key), password)).json;
  }, { key, password });
  expect(json).toContain('Synthetic coordinator'); expect(json).not.toContain('PRIVATE_RAW_MARKER');
  await page.reload(); await page.locator('#diagnosis-start').click();
  await expect(page.locator('#workspace')).toBeHidden();
  await expect(page.locator('#create-workspace')).toHaveText('Unlock workspace');
  await page.locator('#password').fill(password); await page.locator('#create-workspace').click();
  await expect(page.locator('#step-5')).toBeVisible();
  await expect(page.locator('#dashboard-title')).toHaveText('What’s happened since last time?');
  await expect(page.locator('#cv-text')).toHaveValue('');
  // An existing saved profile can be edited without losing its previous details.
  await tool(page, 1); await expect(page.locator('#currentRole')).toHaveValue('Synthetic coordinator');
  await page.locator('#profile-confirmed').check(); await page.locator('#profile-form button[type="submit"]').click();
  await tool(page, 4); await page.locator('#add-job').click();
  await page.locator('#job-title').fill('Synthetic role'); await page.locator('#job-employer').fill('Synthetic employer');
  await page.locator('#job-description').fill('Prepare reports and coordinate schedules for customers.');
  await page.getByRole('button', { name: 'Save and compare' }).click();
  await tool(page, 5); await page.locator('#check-in-update').click();
  await expect(page.locator('.tracker-form')).toBeVisible();
  const date = new Date(Date.now() - 20 * 86400000).toISOString().slice(0, 10);
  await page.locator('.tracker-form [name="stage"]').selectOption('applied');
  await page.locator('.tracker-form [name="appliedAt"]').fill(date);
  await page.getByRole('button', { name: 'Update outcome' }).click();
  await expect(page.locator('#recommendation')).toContainText('role directions');
  // Changing the chosen goal changes the experiment, rather than inventing a cause.
  await tool(page, 1); await expand(page, '#profile-extras');
  await page.locator('#goal').selectOption('interviews'); await page.locator('#profile-confirmed').check();
  await page.locator('#profile-form button[type="submit"]').click();
  await expect(page.locator('#first-plan-detail')).toContainText('oldest unanswered');
});

test('unsupported career still gets an action; mobile can change situation without losing experience', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await begin(page); await experience(page, 'neurosurgery');
  await expect(page.locator('#first-plan-basis')).toContainText('nothing about your employability');
  await expect(page.locator('#first-plan-continue')).toHaveText('Find suggested vacancies');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.getByRole('button', { name: 'Edit my answers' }).click();
  await page.getByRole('button', { name: 'Change my situation' }).click();
  await page.locator('[data-goal="offers"]').click();
  await expect(page.locator('#currentRole')).toHaveValue('Synthetic coordinator');
  await expect(page.locator('#profile-confirmed')).not.toBeChecked();
  await page.locator('#profile-confirmed').check(); await page.locator('#profile-form button[type="submit"]').click();
  await expect(page.locator('#first-plan-action')).toContainText('Practise');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test('quick start preserves an older saved profile and works when browser storage is unavailable', async ({ page, context }) => {
  await page.goto('/');
  const legacyKey = 'rolebridge.private-profile.v1';
  const old = JSON.stringify({ version: 1, profile: { currentRole: 'Synthetic previous role' } });
  await page.evaluate(({ legacyKey, old }) => localStorage.setItem(legacyKey, old), { legacyKey, old });
  await page.reload(); await page.locator('#diagnosis-start').click();
  await expect(page.locator('#workspace')).toBeHidden();
  await expect(page.locator('#load-saved')).toBeVisible();
  expect(await page.evaluate(k => localStorage.getItem(k), legacyKey)).toBe(old);
  const other = await context.newPage();
  await other.addInitScript(() => { Storage.prototype.getItem = () => { throw new DOMException('blocked', 'SecurityError'); }; });
  await other.goto('/'); await other.locator('#diagnosis-start').click();
  await other.locator('[data-goal="interviews"]').click(); await experience(other);
  await expect(other.locator('#first-plan-action')).toHaveText('Check the evidence in one application');
  await other.close();
});
