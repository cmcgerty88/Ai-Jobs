import { test, expect } from '@playwright/test';
import { expand, tool } from './helpers.mjs';

test('bulk skill transfer preserves manual entries, avoids alias duplicates and respects the field limit', async ({ page }) => {
  await page.goto('/'); await page.locator('#diagnosis-start').click(); await page.locator('[data-goal="clarity"]').click();
  await expand(page, '#cv-reader');
  await page.locator('#cv-text').fill('Excel, scheduling and user acceptance testing.');
  await page.locator('#find-skills').click();
  await page.locator('#skills').fill('UAT, Incident management');
  await page.locator('#profile-confirmed').check();
  await page.getByRole('button', { name: 'Add all found skills', exact: true }).click();
  await expect(page.locator('#skills')).toHaveValue('UAT, Incident management, Excel, Scheduling');
  await expect(page.locator('#skills')).toBeFocused();
  await expect(page.locator('#profile-confirmed')).not.toBeChecked();
  await expect(page.locator('#skill-transfer-status')).toContainText('Added 2 skills');
  await expect(page.locator('#skill-chips').getByRole('button', { name: 'User acceptance testing', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#add-all-skills').click();
  await expect(page.locator('#skills')).toHaveValue('UAT, Incident management, Excel, Scheduling');
  await expect(page.locator('#skill-transfer-status')).toContainText('already');
  await page.locator('#skill-chips').getByRole('button', { name: 'Excel', exact: true }).click();
  await expect(page.locator('#skills')).toHaveValue('UAT, Incident management, Scheduling');
  const full = 'x'.repeat(1998);
  await page.locator('#skills').fill(full);
  await page.locator('#add-all-skills').click();
  await expect(page.locator('#skills')).toHaveValue(full);
  await expect(page.locator('#skill-transfer-status')).toContainText('Nothing was changed');
});

test('CV suggestions show evidence, require confirmation and keep technical role directions focused', async ({ page }) => {
  const requests = []; page.on('request', request => requests.push(request));
  await page.goto('/'); await page.locator('#diagnosis-start').click(); await page.locator('[data-goal="clarity"]').click();
  await expand(page, '#cv-reader');
  const cv = 'PRIVATE_SOURCE_MARKER. Release planning and IT change control. Used ITIL, Jira and CI/CD. Completed UAT and managed stakeholder engagement. No Python experience.';
  await page.locator('#cv-file').setInputFiles({ name: 'synthetic-release.txt', mimeType: 'text/plain', buffer: Buffer.from(cv) });
  await expect(page.locator('#skill-chips')).toContainText('Release management');
  await expect(page.locator('#skills')).toHaveValue('');
  await expect(page.locator('#skill-chips').getByRole('button', { name: 'Python', exact: true })).toHaveCount(0);
  await page.locator('#skill-chips summary').click();
  await expect(page.locator('#skill-chips details')).toContainText('release planning');
  for (const label of ['Release management', 'IT change management', 'ITIL', 'CI/CD', 'User acceptance testing', 'Stakeholder management']) {
    await page.locator('#skill-chips').getByRole('button', { name: label, exact: true }).click();
  }
  await page.locator('#currentRole').fill('Release Manager');
  await page.locator('#targetRole').fill('Release Manager');
  await page.locator('#evidence').fill('Coordinated release readiness meetings and tracked dependencies.');
  await page.locator('#profile-confirmed').check(); await page.locator('#profile-form button[type="submit"]').click();
  await expect(page.locator('#first-plan-roles article').first()).toContainText('Release manager');
  await expect(page.locator('#first-plan-roles')).not.toContainText('Training coordinator');
  await tool(page, 3);
  await expect(page.locator('[data-role-id="release-manager"]')).toBeVisible();
  await expect(page.locator('[data-role-id="release-manager"]')).toContainText('target role: Release Manager');
  await expect(page.locator('[data-role-id="release-manager"] .role-connections')).toContainText('Release management');
  await expect(page.locator('[data-role-id="workforce-scheduler"]')).toHaveCount(0);
  await tool(page, 8);
  const options = await page.locator('#jobsite-role option').allTextContents();
  expect(options[0]).toBe('Release Manager');
  expect(options.every(title => /release|change|technical delivery/i.test(title))).toBeTruthy();
  await page.locator('#save-open').click();
  const password = 'Synthetic-skills-password!';
  await page.locator('#save-password').fill(password); await page.locator('#save-password-confirm').fill(password);
  await page.locator('#save-consent').check(); await page.locator('#save-confirm').click();
  await expect(page.locator('#save-dialog')).toBeHidden();
  const saved = await page.evaluate(async password => {
    const { unseal } = await import('/src/vault.mjs');
    return (await unseal(localStorage.getItem('rolebridge.encrypted-workspace.v1'), password)).json;
  }, password);
  expect(saved).toContain('Release management'); expect(saved).not.toContain('PRIVATE_SOURCE_MARKER');
  expect(saved).not.toContain('release planning'); expect(saved).not.toContain('No Python');
  await tool(page, 1); await expand(page, '#cv-reader'); await page.locator('#clear-cv').click();
  await expect(page.locator('#skill-chips')).toBeEmpty();
  await expect(page.locator('#skills')).toHaveValue(/Release management/);
  await page.locator('#targetRole').fill('Neurosurgeon');
  await page.locator('#profile-confirmed').check(); await tool(page, 3);
  await expect(page.locator('.role-card')).toHaveCount(0);
  await expect(page.locator('#role-list')).toContainText('may not cover that occupation');
  expect(requests.every(request => request.url().startsWith('http://127.0.0.1:8771/') && request.method() === 'GET' && !request.postData())).toBeTruthy();
});
