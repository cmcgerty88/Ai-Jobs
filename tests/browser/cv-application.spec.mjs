import { test, expect } from '@playwright/test';
import { tool, privacyControl } from './helpers.mjs';
const cv = `Alex Example
alex@example.test | Mobile: 07700 900123
Address: PRIVATE_ADDRESS
Professional summary
Release manager experienced in production readiness.
Work experience
Release Manager | IMPORT_EMPLOYER | Jan 2023 - Present
Coordinated releases across four teams.
Improved readiness checks using Jira.
Education
IMPORT_DEGREE | Example University | 2020
Certifications
IMPORT_CERTIFICATE | 2021
Skills
Release management, Jira, ITIL
References
RAW_REFEREE_MARKER referee@example.test`;
const password = 'Synthetic-import-password!', key = 'rolebridge.encrypted-workspace.v1';
async function start(page) {
  await page.goto('/'); await page.locator('#diagnosis-start').click(); await page.locator('[data-goal=clarity]').click();
  await page.locator('#currentRole').fill('Release Manager'); await page.locator('#evidence').fill('Coordinated releases and reviewed readiness for production changes.');
  await page.locator('#profile-confirmed').check(); await page.locator('#profile-continue').click();
  await expect(page.locator('#vacancies-continue')).toBeVisible(); await page.locator('#vacancies-continue').click();
  await expect(page.locator('#step-4')).toBeVisible();
  await page.locator('#add-job').click(); await page.locator('#job-title').fill('Release Manager'); await page.locator('#job-employer').fill('Target employer');
  await page.locator('#job-description').fill('Manage production releases using Jira and review release readiness.');
  await page.getByRole('button', { name: 'Save and compare' }).click();
  await page.getByRole('button', { name: 'Prepare my application', exact: true }).click(); await page.locator('#pack-create').click();
}
const upload = (page, content = cv) => page.locator('#application-cv-file').setInputFiles({ name: 'synthetic.txt', mimeType: 'text/plain', buffer: Buffer.from(content) });
async function saved(page) {
  return page.evaluate(async ({ key, password }) => { const { unseal } = await import('/src/vault.mjs'); return (await unseal(localStorage.getItem(key), password)).json; }, { key, password });
}
test('reviewed CV imports populate career fields, download successfully and never save raw or unapplied data', async ({ page }) => {
  const requests = [], errors = []; page.on('request', r => requests.push(r)); page.on('pageerror', e => errors.push(e.message));
  await start(page);
  await page.locator('#save-open').click(); await page.locator('#save-password').fill(password); await page.locator('#save-password-confirm').fill(password);
  await page.locator('#save-consent').check(); await page.locator('#save-confirm').click(); await expect(page.locator('#save-dialog')).toBeHidden();
  await upload(page); await expect(page.locator('#application-import-history')).toHaveValue(/IMPORT_EMPLOYER/);
  await expect(page.locator('[data-import-field=email]')).not.toBeChecked();
  await expect(page.locator('[data-import-field=summary]')).not.toBeChecked();
  await page.locator('#application-cv-apply').click(); await expect(page.locator('#application-cv-error')).toContainText('confirm');
  await page.locator('#cv-location').fill('Belfast'); await expect.poll(() => saved(page)).toContain('Belfast');
  expect(await saved(page)).not.toContain('IMPORT_EMPLOYER');
  const backupEvent = page.waitForEvent('download'); await privacyControl(page, 'export-profile'); const backup = await backupEvent;
  const stream = await backup.createReadStream(), chunks = []; for await (const chunk of stream) chunks.push(chunk);
  const backupJson = await page.evaluate(async ({ raw, password }) => { const { unseal } = await import('/src/vault.mjs'); return (await unseal(raw, password)).json; }, { raw: Buffer.concat(chunks).toString(), password });
  expect(backupJson).not.toContain('IMPORT_EMPLOYER'); expect(backupJson).not.toContain('RAW_REFEREE_MARKER');
  await page.locator('#application-cv-confirmed').check(); await page.locator('#application-import-education').fill('Reviewed IMPORT_DEGREE | 2020');
  await expect(page.locator('#application-cv-confirmed')).not.toBeChecked();
  await page.locator('#application-cv-confirmed').check(); await page.locator('#application-cv-apply').click();
  await expect(page.locator('#cv-history')).toHaveValue(/IMPORT_EMPLOYER/); await expect(page.locator('#cv-education')).toHaveValue('Reviewed IMPORT_DEGREE | 2020');
  await expect(page.locator('#cv-certifications')).toHaveValue(/IMPORT_CERTIFICATE/); await expect(page.locator('#cv-email')).toHaveValue('');
  await expect.poll(() => saved(page)).toContain('IMPORT_EMPLOYER');
  const json = await saved(page); expect(json).not.toContain('RAW_REFEREE_MARKER'); expect(json).not.toContain('PRIVATE_ADDRESS'); expect(json).not.toContain('alex@example.test');
  await page.locator('#cv-anonymous').check(); await page.locator('#cv-reviewed').check();
  const download = page.waitForEvent('download'); await page.locator('#download-cv-pdf').click(); expect((await download).suggestedFilename()).toBe('rolebridge-cv-release-manager.pdf');
  await page.reload(); await page.locator('#password').fill(password); await page.locator('#create-workspace').click(); await tool(page, 6);
  await expect(page.locator('#cv-history')).toHaveValue(/IMPORT_EMPLOYER/); await expect(page.locator('#application-cv-review')).toBeHidden();
  expect(requests.every(r => r.url().startsWith('http://127.0.0.1:8771/') && r.method() === 'GET' && !r.postData())).toBeTruthy(); expect(errors).toEqual([]);
});

test('existing edits stay intact, source can be reused, manual fallback works and leaving discards import previews', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 }); await start(page);
  await page.locator('#cv-history').fill('My manually reviewed career history.');
  await upload(page); await expect(page.locator('[data-import-field=history]')).not.toBeChecked();
  await page.locator('#application-cv-confirmed').check(); await page.locator('#application-cv-apply').click();
  await expect(page.locator('#cv-history')).toHaveValue('My manually reviewed career history.');
  await upload(page); await page.locator('[data-import-field=history]').check();
  await page.locator('#cv-history').fill('A newer manual edit.');
  page.once('dialog', d => d.dismiss()); await page.locator('#application-cv-confirmed').check(); await page.locator('#application-cv-apply').click();
  await expect(page.locator('#cv-history')).toHaveValue('A newer manual edit.');
  await tool(page, 5); await tool(page, 6); await expect(page.locator('#application-cv-fields')).toBeEmpty();
  await page.locator('#application-cv-reuse').click(); await expect(page.locator('#application-cv-status')).toContainText('no longer');
  await tool(page, 1); await page.locator('#cv-file').setInputFiles({ name: 'original.txt', mimeType: 'text/plain', buffer: Buffer.from(cv) });
  await page.locator('#profile-confirmed').check(); await tool(page, 6);
  await page.locator('#application-cv-reuse').click(); await expect(page.locator('#application-import-history')).toHaveValue(/IMPORT_EMPLOYER/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.locator('#application-cv-manual').click(); await expect(page.locator('#cv-history')).toBeFocused(); await expect(page.locator('#application-cv-fields')).toBeEmpty();
  await page.locator('#application-cv-file').setInputFiles({ name: 'unsupported.doc', mimeType: 'application/msword', buffer: Buffer.from('unsupported test file') });
  await expect(page.locator('#application-cv-status')).toContainText('PDF, DOCX or TXT');
  await upload(page, 'This unstructured CV has no recognisable sections.'); await expect(page.locator('#application-cv-status')).toContainText('No supported sections');
});

test('PDF and Word imports use local readers; late file reads cannot follow a user to another page', async ({ page }) => {
  await start(page);
  for (const format of ['pdf', 'docx']) {
    const bytes = await page.evaluate(async format => {
      const { makePdf, makeDocx } = await import('/src/document-export.mjs');
      const blocks = [{ style: 'title', text: 'Alex Example' }, { style: 'heading', text: 'Work experience' }, { style: 'body', text: 'Release Manager | Format Employer | 2023 - Present' }, { style: 'body', text: 'Coordinated production releases across four teams.' }, { style: 'heading', text: 'Education' }, { style: 'body', text: 'BSc Computing | 2020' }];
      return [...await (format === 'pdf' ? makePdf(blocks) : makeDocx(blocks))];
    }, format);
    await page.locator('#application-cv-file').setInputFiles({ name: `synthetic.${format}`, mimeType: format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', buffer: Buffer.from(bytes) });
    await expect(page.locator('#application-import-history')).toHaveValue(/Format Employer/);
    await expect(page.locator('#application-import-education')).toHaveValue(/BSc Computing/);
    await page.locator('#application-cv-discard').click();
  }
  await page.evaluate(() => { window.originalFileText = File.prototype.text; File.prototype.text = function () { return new Promise(resolve => { window.finishCvRead = resolve; }); }; });
  await upload(page); await expect(page.locator('#application-cv-status')).toContainText('Reading');
  await tool(page, 5);
  await page.evaluate(source => { window.finishCvRead(source); File.prototype.text = window.originalFileText; }, cv);
  await tool(page, 6); await expect(page.locator('#application-cv-review')).toBeHidden(); await expect(page.locator('#cv-history')).toHaveValue('');
});
