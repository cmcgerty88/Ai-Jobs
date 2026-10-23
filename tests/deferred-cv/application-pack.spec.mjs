import { expand, tool, chooseSituation, profileEditor, confirmProfile, privacyControl, tracker } from './helpers.mjs';
import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { unzipSync, strFromU8 } from 'fflate';
const password = 'Synthetic-pack-password!';
async function start(page, encrypted = false, prefix = '/') {
  await page.goto(prefix); await page.locator('#open-workspace').click();
  if (encrypted) {
    await page.locator('#password').fill(password); await page.locator('#password-confirm').fill(password); await page.locator('#workspace-consent').check(); await page.locator('#create-workspace').click();
  } else await page.locator('#session-only').click();
  await expect(page.locator('#workspace')).toBeVisible();
  await chooseSituation(page); await profileEditor(page);
  await page.locator('#name').fill('Synthetic Zoë O’Neill');
  await page.locator('#currentRole').fill('Service coordinator');
  await page.locator('#evidence').fill('Coordinated weekly schedules.\nPrepared Excel reporting for a customer service team.');
  await page.locator('#skills').fill('Scheduling, Excel, customer service');
  await confirmProfile(page); await tool(page, 4);
}
async function addJob(page, title = 'Reporting analyst') {
  await page.locator('#add-job').click(); await page.locator('#job-title').fill(title); await page.locator('#job-employer').fill('Synthetic Target Employer');
  await page.locator('#job-url').fill('https://example.com/jobs/synthetic');
  await page.locator('#job-description').fill('Prepare Excel reporting.\nCheck data quality.\nSQL is desirable.');
  await page.getByRole('button', { name: 'Save and compare' }).click();
}
async function createPack(page) {
  await page.getByRole('button', { name: 'Prepare my application', exact: true }).first().click();
  await page.locator('#pack-create').click(); await expect(page.locator('#pack-editor')).toBeVisible();
  await expand(page, '#interview-practice'); await page.locator('#download-interview-pdf').click();
  await expect(page.locator('#interview-export-status')).toContainText('Review company & interview information first');
  await page.locator('#interview-context-open').click(); await page.locator('#prep-context-status').selectOption('none');
  await page.locator('#prep-reviewed').check(); await page.locator('#prep-create').click(); await page.locator('#prep-notes').click();
}
async function career(page) {
  await page.locator('#cv-email').fill('synthetic@example.com');
  await page.locator('#cv-history').fill('Service coordinator | Synthetic Previous Employer | 2022–2026\nPrepared reports and checked service records.');
  await page.locator('#cv-education').fill('Synthetic business qualification | Example College | 2021');
}
async function download(page, id) {
  const received = page.waitForEvent('download'); await page.locator(`#${id}`).click();
  const file = await received; return { name: file.suggestedFilename(), data: await readFile(await file.path()) };
}
async function pdfText(page, bytes, prefix = '/') {
  return page.evaluate(async ({ data, prefix }) => {
    const pdfjs = await import(prefix + 'vendor/pdfjs/pdf.mjs'); pdfjs.GlobalWorkerOptions.workerSrc = prefix + 'vendor/pdfjs/pdf.worker.mjs';
    const task = pdfjs.getDocument({ data: Uint8Array.from(data), isEvalSupported: false });
    try {
      const pdf = await task.promise; const pages = [];
      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n), content = await page.getTextContent();
        pages.push({ text: content.items.map(i => i.str).join(' '), bounded: content.items.every(i => !i.str || (i.transform[4] >= 49 && i.transform[5] >= 49 && i.transform[4] + i.width <= 547 && i.transform[5] <= 793)) });
      }
      return pages;
    } finally { await task.destroy(); }
  }, { data: Array.from(bytes), prefix });
}

test('full private journey produces readable tailored Word/PDF CVs and role-specific interview PDFs', async ({ page }) => {
  const requests = [], errors = []; page.on('request', r => requests.push({ url: r.url(), method: r.method(), body: r.postData() })); page.on('pageerror', e => errors.push(e.message));
  await start(page, true); await addJob(page); await createPack(page); await career(page);
  await expect(page.locator('#draft-highlights')).toHaveValue(/^Prepared Excel reporting/);
  await expect(page.locator('#draft-skills')).not.toHaveValue(/SQL/);
  await expect(page.locator('#interview-role')).toHaveValue('reporting-analyst');
  await expect(page.locator('#interview-questions')).toContainText('two reports showed different figures');
  await page.locator('#download-cv-docx').click(); await expect(page.locator('#cv-export-status')).toContainText('Review the CV');
  await page.locator('#cv-reviewed').check();
  const docx = await download(page, 'download-cv-docx'); expect(docx.name).toBe('rolebridge-cv-reporting-analyst.docx');
  const xml = strFromU8(unzipSync(docx.data)['word/document.xml']);
  expect(xml).toContain('Synthetic Zoë O’Neill'); expect(xml).toContain('synthetic@example.com'); expect(xml).toContain('Target role: Reporting analyst'); expect(xml).not.toContain('SQL is desirable');
  expect(xml).not.toMatch(/w:tbl|w:drawing|w:txbxContent|w:header/);
  const cv = await download(page, 'download-cv-pdf');
  const cvPages = await pdfText(page, cv.data); expect(cvPages.map(p => p.text).join(' ')).toContain('Synthetic Zoë O’Neill'); expect(cvPages.every(p => p.bounded)).toBeTruthy();
  await page.locator('#answer-introduction').fill('My truthful example: checked report totals and explained an anomaly.');
  const interview = await download(page, 'download-interview-pdf');
  const interviewPages = await pdfText(page, interview.data); const text = interviewPages.map(p => p.text).join(' ');
  expect(text).toContain('Reporting analyst'); expect(text).toContain('two reports showed different figures'); expect(text).toContain('My truthful example'); expect(text).not.toContain('synthetic@example.com'); expect(interviewPages.every(p => p.bounded)).toBeTruthy();
  await expect(page.locator('#save-status')).toContainText('Saved encrypted');
  const raw = await page.evaluate(() => localStorage.getItem('rolebridge.encrypted-workspace.v1')); expect(raw).not.toContain('synthetic@example.com');
  await page.reload(); await page.locator('#password').fill(password); await page.locator('#create-workspace').click(); await expect(page.locator('#workspace')).toBeVisible();
  await confirmProfile(page); await tool(page, 6);
  await expect(page.locator('#cv-email')).toHaveValue('synthetic@example.com'); await expect(page.locator('#answer-introduction')).toHaveValue(/My truthful example/);
  await expect(page.locator('#cv-reviewed')).not.toBeChecked();
  await page.getByRole('button', { name: 'Track this application', exact: true }).click(); await expect(page.locator('#dashboard-title')).toBeVisible();
  await expect(page.locator('.tracker-form [name="stage"]')).toHaveValue('saved');
  expect(requests.every(r => r.url.startsWith('http://127.0.0.1:8771/') && r.method === 'GET' && !r.body)).toBeTruthy(); expect(errors).toEqual([]);
});

test('anonymised exports omit contacts, edits revoke review, and markup stays text in CV and DOCX', async ({ page }) => {
  await start(page); await addJob(page); await createPack(page); await career(page);
  await page.locator('#draft-summary').fill('<script>window.badCV=true</script> & truthful summary');
  await expect(page.locator('#cv-preview script')).toHaveCount(0);
  await page.locator('#cv-anonymous').check(); await page.locator('#cv-reviewed').check();
  const txt = await download(page, 'download-cv-text'); const text = txt.data.toString();
  expect(text).not.toContain('synthetic@example.com'); expect(text).not.toContain('Synthetic Zoë'); expect(text).toContain('Candidate CV'); expect(text).toContain('<script>');
  const docx = await download(page, 'download-cv-docx'); const xml = strFromU8(unzipSync(docx.data)['word/document.xml']); expect(xml).toContain('&lt;script&gt;'); expect(xml).not.toContain('<script>');
  await page.locator('#draft-summary').fill('An edited factual summary'); await expect(page.locator('#cv-reviewed')).not.toBeChecked();
  expect(await page.evaluate(() => window.badCV)).toBeUndefined();
});

test('packs are independent, changed sources preserve edits, and removing a job removes its pack', async ({ page }) => {
  await start(page); await addJob(page); await addJob(page, 'Project coordinator'); await createPack(page); await career(page);
  await page.locator('#draft-summary').fill('First vacancy custom summary');
  await page.locator('#pack-job').selectOption({ label: 'Project coordinator — Synthetic Target Employer' }); await page.locator('#pack-create').click();
  await expect(page.locator('#draft-summary')).not.toHaveValue('First vacancy custom summary');
  await expect(page.locator('#cv-email')).toHaveValue('synthetic@example.com');
  await page.locator('#pack-job').selectOption({ label: 'Reporting analyst — Synthetic Target Employer' }); await expect(page.locator('#draft-summary')).toHaveValue('First vacancy custom summary');
  await tool(page, 1); await page.locator('#evidence').fill('Changed truthful evidence for a new application.'); await confirmProfile(page);
  await tool(page, 6); await expect(page.locator('#pack-stale')).toBeVisible(); await expect(page.locator('#draft-summary')).toHaveValue('First vacancy custom summary');
  await tool(page, 4); await page.getByRole('button', { name: 'Remove Reporting analyst', exact: true }).click(); await page.locator('#remove-job-confirm').click();
  await tool(page, 6); await expect(page.locator('#pack-job option')).toHaveCount(1); await expect(page.locator('#draft-summary')).not.toHaveValue('First vacancy custom summary');
});

test('changing interview focus requires committing it and protects existing practice answers', async ({ page }) => {
  await start(page); await addJob(page); await createPack(page);
  await page.locator('#answer-introduction').fill('Notes to keep'); await page.locator('#interview-role').selectOption('project-coordinator');
  await page.locator('#download-interview-pdf').click(); await expect(page.locator('#interview-export-status')).toContainText('Update practice questions first');
  page.once('dialog', d => d.dismiss()); await page.locator('#interview-update').click(); await expect(page.locator('#interview-role')).toHaveValue('reporting-analyst'); await expect(page.locator('#answer-introduction')).toHaveValue('Notes to keep');
  await page.locator('#interview-role').selectOption('project-coordinator'); page.once('dialog', d => d.accept()); await page.locator('#interview-update').click();
  await expect(page.locator('#answer-introduction')).toHaveValue(''); await expect(page.locator('#interview-questions')).toContainText('dependencies against a deadline');
});

test('long PDF text paginates without clipping and missing glyphs fail visibly with a text fallback', async ({ page }) => {
  await start(page); await addJob(page); await createPack(page); await career(page);
  await page.locator('#cv-history').fill(Array.from({ length: 90 }, (_, i) => `Record ${i}: Reviewed experience in reporting and service coordination with a specific responsibility.`).join('\n'));
  await page.locator('#cv-reviewed').check(); const cv = await download(page, 'download-cv-pdf'); const pages = await pdfText(page, cv.data);
  expect(pages.length).toBeGreaterThan(2); expect(pages.every(p => p.bounded)).toBeTruthy(); expect(pages.at(-1).text).toContain('Record 89');
  await page.locator('#draft-summary').fill('A truthful example 漢'); await page.locator('#cv-reviewed').check(); await page.locator('#download-cv-pdf').click();
  await expect(page.locator('#cv-export-status')).toContainText('cannot display a character');
  const text = await download(page, 'download-cv-text'); expect(text.data.toString()).toContain('漢');
});

test('mobile and project-path hosting support real document downloads, and clear removes document inputs', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/Role-Bridge/**', route => route.continue({ url: route.request().url().replace('/Role-Bridge/', '/') }));
  await start(page, false, '/Role-Bridge/'); await addJob(page); await createPack(page); await career(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.locator('#cv-reviewed').check(); const file = await download(page, 'download-cv-pdf'); expect(file.data.subarray(0, 5).toString()).toBe('%PDF-');
  await privacyControl(page, 'clear-open'); await page.locator('#clear-confirm').click(); await expect(page.locator('.hero')).toBeVisible(); await page.locator('#open-workspace').click();
  await expect(page.locator('#cv-preview')).toBeEmpty(); await expect(page.locator('#cv-email')).toHaveValue(''); await expect(page.locator('#interview-questions')).toBeEmpty();
});
