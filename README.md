# RoleBridge

A first working tool for people exploring their next role after redundancy. Read a CV privately, review an experience profile, record work preferences, and compare real vacancies against those requirements.

## Try it

With GitHub Pages configured for `main` → `/ (root)`, the app is served at:

https://cmcgerty88.github.io/Ai-Jobs/

1. Choose a PDF, DOCX or TXT CV, or type your experience manually.
2. Review the CV text, select relevant passages, and add accurate examples and skills to your profile. Skill suggestions are literal text matches, not AI assessments.
3. Confirm the profile and enter your work preferences.
4. Find a real vacancy on an employer's site. Add its link, description and stated conditions. Leave missing information unknown.
5. Review the reasons to consider, investigate or skip it. Choose next actions for your plan.

The original [fictional demo](research/rolebridge-demo.html), [sample PDF](research/rolebridge-sample.pdf), [provisional opportunity report](research/REEMPLOYMENT-OPPORTUNITY-REPORT.md) and [validation kit](research/VALIDATION-KIT.md) remain available.

## What works now

- Browser-based PDF, DOCX and TXT reading, with manual text entry as a fallback.
- Candidate-reviewed experience and skills; no invented achievements.
- UK/Republic of Ireland work preferences, explicit currency and gross annual pay, working pattern, hours and sponsorship constraints.
- Real-vacancy entry, conservative constraint checks, source-check dates and user-controlled essential-requirement confirmation.
- An action list, explicit opt-in local saving, private JSON download, and deletion controls.
- Responsive layout and keyboard-accessible forms/dialogs.

There is no automatic job search, external AI analysis, email delivery, account, cloud database or automatic application sending. Vacancy links are not fetched by the app. Shared skill words do not prove qualification; open listings do not prove active hiring. Current market research in the report remains provisional.

CV-reading limits: 5 MB per file, 30 PDF pages and 100,000 extracted characters. Scanned PDFs need pasted text or a text-based export; OCR and password entry are not provided. DOCX extraction reads the main document text, including ordinary tables; separate headers, footers and footnotes are not included. Review the extracted text before using it.

## Personal data

The CV readers are bundled and served from this repository; no CDN is used. CV files and their text are processed in the browser and are not uploaded. No app analytics or external API calls are made. GitHub Pages still receives ordinary hosting requests, and employer links open external websites when selected.

Profile and vacancy data are held in memory unless the person explicitly selects **Save on this device** and confirms. This writes the reviewed profile and vacancy records to `localStorage`, not the original CV or CV-text box. Local storage is not encrypted or password-protected by this app; use a trusted device/browser profile. Saved data is not automatically loaded into visible fields.

**Clear my information** removes app-managed local storage and resets current inputs. The app cannot remove downloaded exports, browser/device backups or copies outside it. There is no backend account to recover a lost profile. Do not put any real CV, personal data, API key or candidate export in this repository or GitHub issues. `tests/fixtures/synthetic-cv.docx` is entirely fictional.

## Develop and verify

Node 22.13+ is required (Node 24 was used during development).

```sh
npm ci --ignore-scripts
npm test
npm run serve
```

`npm run serve` binds a development server to loopback port 8765. Set `PORT` to change it. This is for local development; GitHub Pages serves the published app directly, with no server process or build required.

For the browser tests:

```sh
npx playwright install chromium
npm run test:browser
```

If an appropriate Chromium is already installed:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium npm run test:browser
```

In a cloud workspace with an unwritable default npm cache, use `npm --cache /tmp/rolebridge-npm ci --ignore-scripts`.

The checked-in `vendor/` files allow GitHub Pages to run without a CDN. Rebuild those copies only when intentionally updating dependencies:

```sh
npm run vendor
```

Use the lockfile and retain dependency licences. Do not disable TLS or checksum checks. `.nojekyll` makes Pages serve the static files directly.

## Next integration stage

Automated AI analysis and job feeds need a separately hosted backend, credentials, a clearly documented data flow and suitable provider terms. Do not insert an API key into these public files or request one through a candidate form. Decide authentication, storage, deletion and processing notices before adding server-side CV handling.

A job-data provider must be checked for current UK/Irish coverage, permitted usage and prices. Employer vacancy feeds may be another route. Never label a generated job as a live opportunity or treat a vacancy's age as proof of a ghost job.

The current comparison logic is deliberately explicit: unknown essential requirements, salary or sponsorship remain uncertain; hard conflicts are shown; the candidate controls all applications and messages.
