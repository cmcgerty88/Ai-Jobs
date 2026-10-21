import { test, expect } from '@playwright/test';
import { expand, tool } from './helpers.mjs';
const cv = `PRIVATE_CV_MARKER
Work Experience
Support Analyst | Earlier Employer | 2019 - 2022
• Resolved incidents for a support team.
Release Manager | Recent Employer | Jan 2023 - Present
• Coordinated production releases across four teams.
• Improved readiness checks before each release.
• Created rollback plans for critical services.
Education
Degree | 2024 - 2026
• Delivered an unrelated research project.`;
async function begin(page) {
  await page.goto('/'); await page.locator('#diagnosis-start').click(); await page.locator('[data-goal="clarity"]').click();
  await expand(page, '#cv-reader');
}
test('latest-role examples are reviewed then merged, persist only when chosen, and raw previews clear', async ({ page }) => {
  const requests = []; page.on('request', request => requests.push(request));
  await begin(page);
  await page.locator('#cv-file').setInputFiles({ name: 'synthetic.txt', mimeType: 'text/plain', buffer: Buffer.from(cv) });
  await expect(page.locator('#work-example-role option:checked')).toContainText('Release Manager');
  await expect(page.locator('#work-example-preview input[type="checkbox"]')).toHaveCount(3);
  await expect(page.locator('#evidence')).toHaveValue(/Coordinated production releases/);
  await expect(page.locator('#currentRole')).toHaveValue('Release Manager');
  await expect(page.locator('#work-example-preview')).not.toContainText('research project');
  await page.locator('#evidence').fill('My existing example of coordinating work.');
  await page.locator('#profile-confirmed').check();
  await page.locator('#work-example-preview input[type="checkbox"]').nth(2).uncheck();
  await page.locator('#add-work-examples').click();
  await expect(page.locator('#evidence')).toHaveValue('My existing example of coordinating work.\n\nCoordinated production releases across four teams.\n\nImproved readiness checks before each release.');
  await expect(page.locator('#profile-confirmed')).not.toBeChecked();
  await expect(page.locator('#evidence')).toBeFocused();
  await page.locator('#add-work-examples').click();
  await expect(page.locator('#work-example-status')).toContainText('already');
  await page.locator('#work-example-preview input[type="checkbox"]').nth(2).check();
  await page.locator('#add-work-examples').click();
  await expect(page.locator('#work-example-status')).toContainText('Added 1 example');
  await page.locator('#currentRole').fill('Release Manager'); await page.locator('#profile-confirmed').check();
  await page.locator('#profile-form button[type="submit"]').click();
  await page.locator('#result-save').click();
  const password = 'Synthetic-examples-password!';
  await page.locator('#save-password').fill(password); await page.locator('#save-password-confirm').fill(password);
  await page.locator('#save-consent').check(); await page.locator('#save-confirm').click();
  await expect(page.locator('#save-dialog')).toBeHidden();
  const saved = await page.evaluate(async password => {
    const { unseal } = await import('/src/vault.mjs');
    return (await unseal(localStorage.getItem('rolebridge.encrypted-workspace.v1'), password)).json;
  }, password);
  expect(saved).toContain('Created rollback plans');
  for (const excluded of ['PRIVATE_CV_MARKER', 'Recent Employer', 'Earlier Employer', 'research project', 'Resolved incidents']) expect(saved).not.toContain(excluded);
  await tool(page, 1); await expand(page, '#cv-reader');
  await page.locator('#cv-text').fill('Changed source text without a dated employment section.');
  await expect(page.locator('#work-suggestions')).toBeHidden();
  await expect(page.locator('#work-suggestions')).toBeEmpty();
  await page.locator('#find-work-examples').click();
  await expect(page.locator('#work-suggestions')).toContainText('couldn’t identify a work-history section');
  await page.locator('#clear-cv').click(); await expect(page.locator('#work-suggestions')).toBeEmpty();
  await expect(page.locator('#evidence')).toHaveValue(/Created rollback plans/);
  expect(requests.every(request => request.url().startsWith('http://127.0.0.1:8771/') && request.method() === 'GET' && !request.postData())).toBeTruthy();
});

test('concurrent roles require choosing the source and no examples are invented', async ({ page }) => {
  await begin(page);
  await page.locator('#cv-text').fill(cv.replace('Education', 'Consultant | Example | 2025 - Present\n• Delivered one consulting project for a client.\nEducation'));
  await page.locator('#find-work-examples').click();
  await expect(page.locator('#work-example-role')).toHaveValue('');
  await expect(page.locator('#add-work-examples')).toHaveCount(0);
  const roleId = await page.locator('#work-example-role option').filter({ hasText: 'Consultant' }).getAttribute('value');
  await page.locator('#work-example-role').selectOption(roleId);
  await expect(page.locator('#work-example-preview input')).toHaveCount(1);
  await expect(page.locator('#work-example-preview')).toContainText('1 of up to 3');
  await page.locator('#work-example-preview input').uncheck(); await page.locator('#add-work-examples').click();
  await expect(page.locator('#work-example-status')).toContainText('Select at least one');
  await expect(page.locator('#evidence')).toHaveValue('');
});
