# RoleBridge

A private device-only pilot for people exploring their next role after redundancy. Three starting directions lead directly to vacancy search, application preparation or interview preparation, with one returning-user job-search dashboard. Manual vacancy entry is retained. Suggested vacancies adds related-title searches on LinkedIn, Indeed and CV-Library plus a prepared UK Reed pool matched locally to a target role and confirmed skills. The external search links work independently of the Reed feed; direct imports from LinkedIn/Indeed/CV-Library are not connected. The existing CV reader, role explorer and vacancy analysis connect to an encrypted workspace, an application-outcome dashboard, a tailored CV builder and a role-specific interview practice pack. OpenAI remains disconnected.

The homepage also welcomes people looking for their next role without redundancy. Northern Ireland visitors can open NIJobs searches or nijobfinder from the same vacancy page. nijobfinder prefills the selected role using its Keywords parameter, without restricting the job category; the user chooses a location on that site. These are external destinations, not additional imported feeds.

## Try it

With GitHub Pages configured for `main` → `/ (root)`, the app is served at:

https://cmcgerty88.github.io/Ai-Jobs/

1. Choose **Find my next step**. New visitors start without an account or password; nothing is saved automatically.
2. Choose one of three directions: **Find roles that suit me**, **Improve my applications**, or **Prepare for an interview**. Role search goes through a reviewed profile to vacancies; applications goes through the profile to saved jobs and CV preparation; interviews opens the dedicated prep form immediately. Switching focus keeps existing entries.
3. Upload a CV or enter a short profile manually. Review the extracted role, skills and examples; choose a target role and optional location. The app reuses reviewed information. Raw CV text is never saved.
4. Use the four-stage navigation: **Your profile → Choose a job → Prepare application → Track & prepare**. Optional work preferences and role exploration live under **Preferences & help**. There is no separate starter-plan or generic interview-practice page.
5. Explore UK/NI vacancies or add an advert. Opening external job-site searches shares only the displayed role/location; candidate data is not submitted to the shared vacancy feed. Review the full advert when a feed supplies only a summary.
6. From a saved job choose **Prepare my application**. Job-match checks and CV preparation share a page. Review and download the CV, then choose **Track this application** to open that specific job’s update form. Downloads never submit applications.
7. **My job search** is the returning-user homepage: one next action, saved jobs and upcoming interviews. Record a scheduled interview separately from completed interviews; scheduled dates never inflate interview outcome counts. Each job opens its own CV and interview preparation, including company/screening-call notes and printable PDFs.
8. Outcome observations are hidden until at least three valid applications have been recorded. They suggest experiments based on entries, not employer decision causes or hiring probabilities.
9. Saving remains optional and encrypted on this device. Returning users unlock existing data; older saved profiles, CV drafts and interview notes remain compatible. OpenAI remains disconnected.

The original [fictional demo](research/rolebridge-demo.html), [sample PDF](research/rolebridge-sample.pdf), [provisional opportunity report](research/REEMPLOYMENT-OPPORTUNITY-REPORT.md) and [validation kit](research/VALIDATION-KIT.md) remain available.

## What works now

- Browser-based PDF, DOCX and TXT reading, with manual text entry as a fallback.
- Candidate-reviewed experience and skills; no invented achievements.
- Local role exploration using a small editorial catalogue of 17 business, service and technology-delivery role directions. Each provides explicit skill connections, questions for real adverts, an example to prepare and copyable search phrases.
- Saved role directions and next actions, with optional device saving. Previously saved profiles remain compatible.
- UK/Republic of Ireland work preferences, explicit currency and gross annual pay, working pattern, hours and sponsorship constraints.
- User-selected LinkedIn, Indeed and CV-Library searches for target/related titles; clearly labelled external searches with manual import retained. No scraping or direct imports from those providers.
- Target-role and local skill/location filtering of a shared vacancy pool, with one-click shortlist import and clear source/freshness limits. The Reed connection is prepared but not activated; see [vacancy-feed setup](docs/VACANCY-FEED-SETUP.md).
- Real-vacancy entry, conservative constraint checks, source-check dates and user-controlled essential-requirement confirmation.
- Encrypted opt-in autosaving, password unlock, inactivity lock, encrypted backup/restore, 30-day expiry and deletion controls.
- User goals, application dates/stages, completed interviews, follow-up actions, weekly counts and cautious rule-based recommendations.
- Optional local usefulness feedback with a minimised preview; nothing sent automatically.
- Vacancy-specific, editable CV drafts: reordered confirmed skills and examples, shared career details, preview, review checks and Word/PDF/text downloads.
- Interview questions for all 17 editorial roles, plus general and user-selected advert-requirement prompts; private practice notes and PDF/text downloads.
- Responsive layout and keyboard-accessible forms/dialogs.

There is no external AI analysis, email delivery, hosted account, cloud database or automatic application sending. Once configured, a scheduled collector retrieves a limited shared pool of public Reed search results; it never receives candidate searches or CVs. Vacancy links are not fetched by the app. Shared skill words do not prove qualification; open listings do not prove active hiring. Current market research in the report remains provisional.

OpenAI integration is deliberately deferred. This release needs no API key, billing setup, server or additional hosting. The existing GitHub Pages deployment serves the role catalogue and matching logic locally.

## How role exploration works

`src/roles.mjs` is a manually written exploration library, dated 18 October 2026. It is not a verified occupational taxonomy, a current labour-market study, or evidence that vacancies exist. Its scope is limited; it does not cover all occupations or skill wording.

Directions prioritise the candidate's target role, or current role when no target is entered. A direct catalogue title connection is shown first and does not infer any skills. Other suggestions must share a supported work area and responsibility level, with at least two distinct confirmed skill groups including one linked to the role's main work. Without a title, those skill rules operate alone. Unsupported occupations get a coverage message rather than an unrelated fallback. Up to five entries are shown. This is a limited editorial rule set, not a fit percentage, qualification judgement or hiring probability.

CV skill review uses a local vocabulary of 167 skill/tool labels with aliases, including release management, IT service management, software delivery, data, finance and operational work. Source excerpts show why each suggestion appeared. Blank skills fields are filled as an unreviewed draft after file reading or **Fill profile from this text**; additional labels can be transferred individually or with **Add all found skills**. Bulk transfer preserves existing entries, skips known alias duplicates and asks the user to review the resulting skills field. It never silently truncates entries to fit the field limit. Common negation and aspiration phrases are excluded conservatively. The vocabulary and wording rules are not exhaustive, and do not establish proficiency, certification or recency. Users can edit or add skills themselves. Source excerpts and raw CV text remain temporary and are excluded from encrypted profile persistence.

The CV reader also offers up to three work examples from the latest dated employment entry. It recognises common English work-history headings and year/month date ranges, compares end dates, and preserves source action statements (joining wrapped lines without rewriting achievements). A role selector resolves tied/current roles or uncertain dates. When the latest role is unambiguous, a recognisable title and its examples fill blank profile fields as a draft. The review checkbox is required before these imports can be saved or backed up. Existing text is preserved; users can also choose individual examples through the expanded review controls, and repeated statements are skipped. Contact details, employers, education, work preferences and target-role intentions are not imported automatically. Missing dates, unfamiliar layouts, scanned text and unrecognised wording may require manual selection. Fewer than three recognised examples are never padded with invented work or examples from another role.

Missing matches are areas to check, not a conclusion that the person lacks those skills. Roles can always be browsed and saved for exploration without matching. Actual job requirements, pay, work location, qualifications and eligibility must be checked against individual vacancies. Search phrases incorporate selected location/country and work pattern but are only plain text; the user decides whether to copy them into a search service.

The reviewed-data schema remains version 1 with optional role directions, profile goals, per-job progress, categorical feedback, reviewed CV-builder fields and up to five application packs. Older plaintext profiles can be explicitly migrated to a separate encrypted storage envelope; successful migration removes the plaintext key. Raw CV text is excluded.

CV-reading limits: 5 MB per file, 30 PDF pages and 100,000 extracted characters. Scanned PDFs need pasted text or a text-based export; OCR and password entry are not provided. DOCX extraction reads the main document text, including ordinary tables; separate headers, footers and footnotes are not included. Review the extracted text before using it.

## Personal data

The CV readers are bundled and served from this repository; no CDN is used. CV files and their text are processed in the browser and are not uploaded. The browser makes no analytics or external API calls. Explicit job-site search links send the displayed role/location to the chosen site; no CV or skill list is included. A separately configured GitHub Actions job can call Reed for public listings; candidate data is not part of those calls. GitHub Pages still receives ordinary hosting requests, and employer links open external websites when selected.

New passwords require 14–256 characters, at least one uppercase letter and one special character (punctuation or a symbol; spaces and numbers alone do not count). Existing workspace passwords and backups still unlock using the original password.

**Create private workspace** is local signup, not a verified online account. Explicit consent enables encrypted autosaving in browser localStorage. Web Crypto uses AES-256-GCM and PBKDF2-SHA-256 (600,000 iterations) with a random salt and fresh IV per save. The password and key are never persisted by the app. No recovery/reset or cloud sync is provided. Use a current browser over HTTPS and a trusted personal device. Try without saving holds information in the tab only.

**Lock workspace** and ten minutes without activity clear the unlocked page, including raw CV text. Application updates and vacancy edits must be submitted to become saved records. CV-builder fields, CV drafts and interview notes also autosave in an unlocked workspace. Profile changes autosave after a short debounce; the status shows success/failure. Automatic lock attempts to save first but discards unsaved edits if storage fails. Expiry is 30 days after the last save, enforced by deletion on the next visit; no website can delete local storage while closed. Encrypted backups also expire and need the password to restore. Remove unwanted downloads/backups separately.

**Clear my information** removes both saved formats and resets current inputs. Encryption does not protect against compromised devices, malicious extensions/site code or someone using an unlocked workspace. GitHub Pages repositories share an origin; a dedicated origin is required before wider service deployment. See the review for threat boundaries, UK/EU GDPR considerations and future authentication/database requirements. Do not put real CVs, candidate exports or secrets in this repository or issues. All fixtures are fictional.

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

Automated AI analysis still needs a separately hosted private backend and the privacy gates below. The prepared Reed job feed instead runs in GitHub Actions and publishes a shared static snapshot; matching stays in the browser. It needs a provider API account, a repository secret, suitable provider terms and Pages Actions deployment. Follow [the connection guide](docs/VACANCY-FEED-SETUP.md); no live feed has been verified yet. Do not insert an API key into these public files or request one through a candidate form. Decide authentication, storage, deletion and processing notices before adding server-side CV handling.

A job-data provider must be checked for current UK/Irish coverage, permitted usage and prices. Employer vacancy feeds may be another route. Never label a generated job as a live opportunity or treat a vacancy's age as proof of a ghost job.

The current comparison logic is deliberately explicit: unknown essential requirements, salary or sponsorship remain uncertain; hard conflicts are shown; the candidate controls all applications and messages.

## CV and interview documents

The CV builder is available through **Prepare my application** on each saved vacancy or **Review application & CV** on My job search. Add employment/project/voluntary experience (most recent first), education and relevant certifications. Identity/contact fields are optional for an anonymised CV; otherwise give a display name and one contact method. The app never infers your employers, employment dates, qualifications or achievements from raw CV text.

Tailoring is local and transparent: confirmed skill labels that occur in the advert are placed first; whole reviewed experience passages with matching longer words are prioritised. Users edit the result. It is not semantic AI analysis. A limited keyword check flags terms for review, never inserts unsupported qualifications and never gives an ATS score. When a profile or advert changes, a warning preserves existing draft edits; refreshing a draft requires confirmation. Career details are shared across packs; each vacancy has separate CV text and interview notes. Deleting a vacancy deletes its pack.

CV exports are single-column DOCX, selectable-text PDF and UTF-8 text. Use the employer’s requested format, check the downloaded file and verify any fields populated by an applicant tracking system. No format or keyword strategy guarantees passing ATS screening or an interview. Word files contain text paragraphs, no macros, external relationships, images, tables, text boxes, headers or footers. PDFs embed DejaVu Sans with character mappings and paginate locally. Unsupported PDF characters produce a visible error; Word/text preserve them as a fallback. Export is capped at 30 PDF pages to bound resource use.

Interview packs use an editorial question library and up to three requirements the user chooses from the advert. They include STAR guidance, candidate-written notes and questions to ask the employer; they are practice prompts, not actual employer questions or generated model answers. Unsupported roles receive honest general preparation plus the user’s requirements. Changing question focus asks before deleting existing answers.

These application documents are **unencrypted downloads** intended for use outside the app; the builder explains this before download. They contain only the selected CV fields or interview questions/notes. They exclude raw CV text, work-preference constraints, other vacancies and unrelated profile fields. Encrypted workspace backups remain a separate feature. Downloaded documents cannot be deleted or expired remotely by the app. No application is sent automatically and no OpenAI service is connected.


## Dedicated interview preparation

Choose **Prepare for an interview** at the start, **Already have an interview?** on the landing page, or **Prepare for interview** on a saved job. **Preferences & help → I already have an interview** is also available. This route works without completing the main profile first.

1. Upload a PDF, DOCX or TXT CV, or reuse your workspace experience. Review the role, skills and work examples; unfamiliar layouts have a manual fallback. No contact information is required.
2. Select a saved vacancy or paste a job title and description. Review one to three suggested advert priorities. Reed imports are short summaries: check the full advert and supply missing requirements.
3. Add any company research and interview-process information from screening calls or invitations. Choose **I don’t have any extra information yet** if you have none. Notes are kept per vacancy; only fill the fields you can support.
4. Confirm all three inputs and create the pack. Download the **full prep pack PDF** and a separate **one-page cheat sheet PDF**. Both print in A4 portrait. The full pack also has a text fallback.

The full pack includes reviewed CV examples, wording connections to advert priorities, explicit prompts where evidence is missing, typical role/requirement questions, STAR worksheets and a pre-interview checklist. It does not invent achievements, write answers or predict employer questions. The cheat sheet uses bounded excerpts with an ellipsis and fixed readable font sizes; its PDF is limited to one page, with full statements retained in the larger pack. Practice notes can be added through the existing pack editor and included in subsequent downloads. The existing editor also offers the cheat-sheet download.

The dedicated flow stores a bounded reviewed interview-evidence snapshot with its vacancy pack, keeping the shared profile and edited CV draft unchanged. A new description creates a shortlist entry; reuse updates the existing pack. Changing questions asks before deleting practice notes. Unreviewed inputs and uploaded CV files/raw text never enter encrypted saving. Only reviewed role/skills/examples, advert priorities and existing job/pack fields are retained after creation when encrypted saving is enabled. Existing workspace limits, expiry and deletion apply. No OpenAI integration or external processing was added; downloaded documents are unencrypted and must be kept/deleted by the user.


Interview preparation now explicitly asks for three sources: CV/resume, the full job description, and any company/interview-process information. The third input requires an answer but does not require people to invent information: “no extra information yet” is supported. Company and process notes are separately bounded at 2,000 characters, excluded from saving until reviewed pack creation, and restored only for their own vacancy. The full PDF includes the supplied notes, follow-up preparation actions and up to two additional practice prompts; the one-page PDF includes short context reminders without shrinking text. Notes are labelled as candidate-supplied, not independently verified employer facts. Both the dedicated flow and older pack editor require this context decision before interview downloads. CV downloads are unaffected. Removing a context question asks before deleting its practice answer. OpenAI stays disconnected.
