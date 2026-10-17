# A practical reemployment business to validate

Prepared 17 October 2026. UK and Ireland first.

**Provisional recommendation: launch RoleBridge, a human-reviewed service that turns someone's experience into two realistic next-role options and a small, justified shortlist of vacancies. Start with recently redundant customer-support and service-operations team leaders. Sell one useful decision before building an autonomous agent.**

This is a decision and validation pack, not completed current-market research. The environment's network policy denied requests to Google, ONS, Ireland's CSO, Reddit and Teal. Research-domain additions have been saved to the environment configuration draft, but that does not activate access. No current unemployment figures, community quotations, competitor prices or measured demand are asserted here. Pricing, rankings, time estimates and demand assessments below are hypotheses to test. There have been no customer interviews or paid pilots.

The companion `rolebridge-demo.html` is a working, local concept demonstration with entirely fictional candidate and vacancy data. It demonstrates the proposed decisions, not real job matching. `VALIDATION-KIT.md` contains interview questions, outreach copy, an intake form, a delivery prompt and experiment records.

## 1. What needs researching before calling this a market opportunity

Redundancy creates several different problems: immediate household uncertainty, emotional disruption, uncertainty about where one's experience fits, and the mechanics of getting hired. These should not be collapsed into a single “needs a better CV” problem. UK and Irish labour markets also differ by sector, occupation, region and jurisdiction. A national vacancy count cannot establish demand for this product.

### Problem hypotheses and the evidence that would support them

The “pain” column is a hypothesis about the affected segment, not a population prevalence estimate. Example situations are research prompts, not quotations from real people.

| Problem hypothesis | Who and when | Expected pain and frequency | What to observe | Product implication |
|---|---|---|---|---|
| People cannot tell which adjacent job titles fit their experience | Recently redundant workers whose old title is narrow or employer-specific | High at the start; revisited as applications fail | Several plausible role families, repeated changes of search terms, inability to explain qualification gaps | Translate experience into evidence for specific tasks and role requirements |
| People spend substantial time applying to poor-fit vacancies | Applicants balancing salary, location, hours and skills constraints | High; repeated per vacancy | Time diary, rejected roles, mandatory requirements missed, unsuitable recommendations | Filter explicit constraints before asking AI to assess fit |
| Silence gives no usable feedback about what to change | People with sustained applications and few responses | High and recurring | Dated application records, differing CVs, stage outcomes, recruitment delays | Diagnose process weaknesses without pretending to know rejection reasons |
| Relevant experience is difficult to express in an unfamiliar role's language | Career changers and candidates moving between sectors | Medium–high per application/interview | Candidates can describe work but cannot connect it to a vacancy; AI adds unsupported achievements | Create a claim-to-evidence map and identify missing proof |
| Vacancy status is uncertain | People encountering old, duplicated or redirected adverts | Medium per search session; prevalence unverified | Employer page status, closing date, repeated third-party listings | Show observable freshness evidence; never claim to prove hiring intent |
| Networking feels vague, awkward and unproductive | People who have not searched for work in years | Medium–high weekly | Few relevant conversations, unclear requests, unused professional contacts | Create small, appropriate conversation plans and draft messages |
| Administrative overload undermines consistency | People juggling boards, inboxes, spreadsheets and obligations | Potentially high daily; tool fatigue also possible | Actual workflow walkthrough, repeated copying, missed deadlines, abandonment | Deliver a short plan through existing channels before adding a dashboard |
| The first days after redundancy are confusing | People without HR support or a financial buffer | Very high, acute | Missed deadlines, uncertainty about final pay/support, multiple official services visited | Jurisdiction-specific navigation to authoritative services, with expert boundaries |
| Interviews expose gaps in recalling or structuring evidence | Candidates already receiving interviews | High but episodic | Weak answers despite relevant examples; impending interview is a concrete buying trigger | Evidence-based rehearsal rather than generic interview questions |
| People need immediate income while protecting a longer-term search | People with limited runway or caring commitments | Very high; highly constraint-dependent | Acceptable temporary work, start dates, schedule and earnings constraints | A separate, operationally difficult matching service; avoid benefits calculations in an MVP |

**Research could overturn this ordering.** High emotional pain does not automatically imply willingness to pay for software. Unemployment can reduce disposable income precisely when support is most useful. Some problems may be better served by public support, peer groups or a professional adviser.

### A reproducible live-research method

1. Review the latest available ONS labour-market/vacancy releases and CSO labour-market/monthly unemployment releases. Record release dates and reference periods separately. Do not assume an October 2026 release is available or compare UK and Irish measures without checking definitions.
2. Assemble an initial qualitative sample of 40–60 relevant public discussions from the last 6–12 months: UK job/redundancy communities, Irish equivalents, public forums, and public LinkedIn discussions where accessible. Deliberately include people who found work and people outside technology. This sample identifies themes; it does not estimate national prevalence.
3. Record URL, publication date, location evidence, occupation, redundancy timing, reported problem, workaround, time/money cost, response from others and any buying signal. Separate firsthand experiences from commentary and promoted products. Keep short necessary excerpts and minimise usernames/personal details.
4. Search for disconfirming cases: people happy with free tools, people whose main blocker is a shortage of jobs, people who do not want another service, and people who solved the issue through recruiters or a human coach.
5. Interview 12–15 recently redundant people and 3–5 recruiters/career advisers. Ask about a recent specific search session before presenting an idea. Do not recruit only friends or AI enthusiasts.
6. Verify competitor offerings and public prices on their current websites. Test their free flows with synthetic data; do not infer service quality from a feature list. Record dates, currencies, VAT treatment, billing period and important plan limits.
7. Offer a paid, manually delivered pilot. Treat purchase, use and repeat purchase as stronger evidence than praise or a “would use” response.

Useful search strings include `site:reddit.com/r/UKJobs redundant "applications"`, `site:reddit.com/r/AskIreland redundancy "job"`, `site:forums.moneysavingexpert.com redundancy "job search"`, `"made redundant" "transferable skills"`, and `"job search" "Teal" "Huntr" review`. Search terms are not evidence of findings.

### Source register — destinations to verify, not citations to completed research

| Source | Research purpose | Verification status in this task |
|---|---|---|
| [ONS employment bulletin](https://www.ons.gov.uk/employmentandlabourmarket/peoplenotinwork/unemployment/bulletins/employmentintheuk/latest) | UK employment context and links to detailed releases | Access denied by environment proxy |
| [CSO monthly unemployment](https://www.cso.ie/en/statistics/labourmarket/monthlyunemployment/) | Irish labour-market context; supplement with Labour Force Survey | Access denied by environment proxy |
| [r/UKJobs](https://www.reddit.com/r/UKJobs/) and [r/AskIreland](https://www.reddit.com/r/AskIreland/) | Firsthand experiences and workarounds | Reddit search access denied; no posts reviewed |
| [MoneySavingExpert forums](https://forums.moneysavingexpert.com/) and [LinkedIn](https://www.linkedin.com/) | Redundancy, finance and professional-search discussions | Not reviewed; authentication/platform limits may remain |
| [Acas](https://www.acas.org.uk/redundancy), [GOV.UK](https://www.gov.uk/redundancy-your-rights), [Citizens Advice](https://www.citizensadvice.org.uk/) | Great Britain redundancy/support navigation | Not reviewed live |
| [Labour Relations Agency](https://www.lra.org.uk/) and [nidirect](https://www.nidirect.gov.uk/) | Northern Ireland-specific rules and support | Not reviewed live; these would require additional domain access if used |
| [Citizens Information](https://www.citizensinformation.ie/), [Workplace Relations Commission](https://www.workplacerelations.ie/), [JobsIreland](https://jobsireland.ie/) | Republic of Ireland rights, support and employment services | Not reviewed live |
| [National Careers Service](https://nationalcareers.service.gov.uk/) | Free careers support in England; use devolved equivalents elsewhere | Not reviewed live |
| [ICO](https://ico.org.uk/) and [Data Protection Commission](https://www.dataprotection.ie/) | UK and Irish data-protection requirements | Not reviewed live |

Northern Ireland belongs to the UK but should not receive Great Britain-specific redundancy/benefit guidance by default. The Republic of Ireland requires a separate jurisdiction setting. UK careers services are also devolved.

## 2. Existing solutions and where a gap might remain

The categories below reflect established product positioning, not a verified October 2026 feature audit. Current AI-agent products change quickly. Treat any claimed gap as unproven until tested against actual products and users.

| Product/category | Established focus to investigate | What a new entrant must demonstrate |
|---|---|---|
| [LinkedIn](https://www.linkedin.com/) | Professional identity, network, recruiter access, jobs and recommendations | Better decisions for a narrowly defined segment; generic AI job recommendations are insufficient |
| [Indeed](https://www.indeed.com/) | Large vacancy inventory, alerts, applications and employer information | A useful filter on authorised vacancy sources; do not try to recreate the inventory |
| [Teal](https://www.tealhq.com/) | Job-search organisation, resume/CV workflows and tailoring | Materially better role targeting or human judgement than an existing integrated workflow |
| [Jobscan](https://www.jobscan.co/) | Resume-to-description analysis and optimisation | Evidence of competence and constraints, not another keyword/ATS score |
| [Huntr](https://huntr.co/) | Tracking, resume workflows and application assistance | Less maintenance and demonstrable decision value; a dashboard is not differentiation |
| [Simplify](https://simplify.jobs/) | Discovery and application-workflow assistance | Better selection for a specific worker group rather than more submissions |
| [Sonara](https://www.sonara.ai/) | AI job discovery/application automation positioning | Verify current availability and performance; broad “agent applies for you” positioning is already contested |
| [Careerflow](https://www.careerflow.ai/) | AI-assisted job-search workflow positioning | A focused service with proof users cannot easily get the same result elsewhere |
| [Final Round AI](https://www.finalroundai.com/) and interview tools | Interview preparation/assistance positioning | Evidence-grounded preparation for actual candidate experiences, with clear interview-integrity boundaries |
| ChatGPT + a spreadsheet + email alerts | Flexible, inexpensive manual research, drafting and tracking | A recurring reduction in work that justifies paying instead of reusing a prompt |
| Recruiters, career coaches, public services, unions and outplacement | Human guidance, vacancies and transition support | Accessible delivery, appropriate price and clear scope; these can also be partners |

**The broad category is crowded.** Combining existing features does not establish differentiation. The plausible gap is an accountable service that answers: which two job families should this particular person pursue, which vacancies are worth investigating today, and what evidence supports that advice? Human review is part of the initial service, not a concealed exception.

AI makes unstructured CVs, vacancy requirements and interview notes cheaper to compare and explain. It does not create vacancies, establish employer intent, know why an employer rejected someone, or turn a speculative skill inference into a fact.

## 3. Ten product opportunities

All prices below are proposed validation prices, not measured willingness to pay or checked market prices. GBP and EUR amounts are separate test prices, not exchange-rate conversions. MVP times assume a founder working regularly with no-code tools and manual delivery; they are estimates. Each opportunity is differentiated by segment and workflow, not a claim of technical novelty.

### 1. RoleBridge — a next-role brief and justified vacancy shortlist

- **Problem/user/pain:** Recently redundant customer-support and service-operations team leaders do not know how their experience transfers or which vacancies deserve effort. High uncertainty initially, then repeated per application.
- **Product and experience:** A 15-minute intake produces two role hypotheses, supporting examples, important gaps, and up to five vacancies over the following week. Each says pursue, investigate or skip, explains why, and gives one next action. Deliver by email and a simple private page; one correction round is included.
- **AI contribution:** Extract and organise experience, map it to tasks across titles, compare requirements, and draft concise explanations. Each claim links to candidate evidence or is explicitly unverified. This reduces analyst time; a human could provide the service without AI.
- **Alternatives and reason to switch:** Recruiters, coaches, Teal/Huntr, ChatGPT and manual searches. Win only if the brief is more accurate, relevant and actionable than the person's existing process. “Human-reviewed, within your constraints” is a testable service promise.
- **Money/price:** Test a £29/€35 seven-day founder pilot, then a £49/€59 one-off launch offer and optional £29/€35 weekly refreshes. Later test employer/outplacement-sponsored cohorts. No expectation of indefinite consumer subscriptions.
- **Build/time/tools:** Low–medium difficulty; 2–4 days for a manual pilot, 14–30 days for assisted operations. Tally, Airtable, an approved business AI workspace or API, Make, email and a payment link.
- **Possible defence:** Consented, outcome-linked examples of real transitions; specialist recruiter relationships; distribution; a proven operating method. The initial demo has no moat.

### 2. Interview Evidence Lab — rehearse from your actual work

- **Problem/user/pain:** Candidates have an interview but cannot quickly recall credible examples, particularly when changing sectors. High pain close to a scheduled interview; episodic demand.
- **Product and experience:** Supply the job description and a voice or text account of past projects. Receive a verified evidence bank, a 20-minute mock interview and feedback that separates missing evidence from poor explanation. Begin with support-to-operations interviews.
- **AI contribution:** Convert messy memories into draft STAR examples, generate follow-up questions and compare answers with the role's requirements. Ask for missing details; never invent results. Low-cost personalised repetition is the advantage.
- **Alternatives and reason to switch:** Interview coaches, ChatGPT, interview apps. Differentiation is candidate-verified evidence and specialist role rubrics, not generic questions or covert live-interview assistance.
- **Money/price:** £39–£79/€49–€95 per interview pack; employer-sponsored vouchers later. Urgent need may support a purchase, but must be tested.
- **Build/time/tools:** Low–medium; 3–7 days. Tally, secure voice/text collection, business AI tools and manual feedback. Obtain specific permission for recordings and delete them promptly.
- **Possible defence:** Role-specific evaluation expertise and consented evidence/outcome patterns. Easy to imitate initially; limited recurring consumer revenue.

### 3. Evidence Check — application quality control against real experience

- **Problem/user/pain:** People using AI tailoring can submit unsupported claims, omit essential evidence or overlook a disqualifier. Repeated per application; especially relevant to career changers.
- **Product and experience:** Compare the source CV, proposed application and employer specification. Return a red/amber/green checklist with exact conflicting or unsupported passages, missing answers and factual questions. Begin with operations and support applications, avoiding regulated qualifications assessments.
- **AI contribution:** Semantic comparison across three documents and extraction of claims. Explain evidence, not an invented hiring probability or ATS pass rate.
- **Alternatives and reason to switch:** Jobscan, AI writing tools, manual proofreading and advisers. The wedge is factual consistency and requirement coverage, with examples showing why keyword optimisation alone misses a problem.
- **Money/price:** £9/€12 per check or £25/€29 for four. Potential B2B seat pricing for coaches after proving usefulness.
- **Build/time/tools:** Low; 2–5 days. Form, secure storage, structured AI output, checklist template and human review.
- **Possible defence:** A corpus of consented error patterns and coach distribution. Both the low price and broad competition limit the standalone opportunity.

### 4. Search Clinic — diagnose the application process after silence

- **Problem/user/pain:** Candidates with several weeks of searching cannot decide whether to change targets, evidence, channels or expectations. High frustration; repeated weekly.
- **Product and experience:** Import a small user-supplied application log and sample applications. Return observable problems, data limitations and one change to test next week. Review the result a week later. Show delayed/no-response applications separately from explicit rejection.
- **AI contribution:** Normalise messy records, classify role types and requirements, and compare application evidence. Suggest experiments, not causal explanations for employers' decisions.
- **Alternatives and reason to switch:** Spreadsheets, trackers, coaches and unstructured ChatGPT advice. Earn trust through a documented diagnosis and restrained conclusions.
- **Money/price:** £39/€49 diagnosis plus £19/€25 follow-up; test a short package instead of permanent membership.
- **Build/time/tools:** Medium; 5–10 days. CSV upload, Airtable, no-code charts, AI summarisation and manual review. Avoid connecting a whole inbox initially.
- **Possible defence:** Longitudinal patterns with consent and coach partnerships. Sparse or inaccurate input data is a serious weakness; no small pilot can prove that a change caused more interviews.

### 5. Warm Route — a practical plan for relevant conversations

- **Problem/user/pain:** Experienced workers have a network but struggle to turn it into appropriate introductions after redundancy. Recurring weekly discomfort and opportunity cost.
- **Product and experience:** The user names five contacts and several target organisations. The service proposes three specific conversations, suitable questions and editable messages; the user sends and tracks them. No importing other people's private address books by default.
- **AI contribution:** Relate candidate experience to target-company needs using permitted public information and help make a precise, respectful request. Keep suggested contact routes separate from confirmed relationships.
- **Alternatives and reason to switch:** LinkedIn, coaches, templates and ChatGPT. Compete on researched relevance, sequence and accountability, not bulk outreach.
- **Money/price:** £25/€29 initial plan; £15/€19 weekly refresh. A coach could buy it as a service component.
- **Build/time/tools:** Low–medium; 3–7 days. Intake form, manually supplied contact context, public research, AI drafts and email delivery. Never auto-send or scrape protected LinkedIn data.
- **Possible defence:** Niche employer knowledge and trusted partnerships. Results depend on network quality, and outreach can quickly become spam if incentives are wrong.

### 6. Vacancy Verify — observable checks before an application

- **Problem/user/pain:** Applicants waste effort on closed, duplicated, unclear or stale listings. Potentially frequent; actual incidence remains unverified.
- **Product and experience:** Forward a vacancy URL. Receive employer-source availability, location/salary consistency, closing-date evidence, duplicate links and questions to resolve. “Status uncertain” is a valid result.
- **AI contribution:** Extract and reconcile facts across authorised sources. Ordinary HTTP/status and date checks handle deterministic parts. AI does not identify a “ghost job” with certainty.
- **Alternatives and reason to switch:** Manual employer-site checks, job-board dates, alerts and common sense. Payment depends on saving enough effort beyond a free check.
- **Money/price:** Test £5/€6 for a small batch or £9/€12 for a month; stronger potential as a component sold to job-search providers.
- **Build/time/tools:** Medium; 7–14 days for a manually reviewed URL service. Form, Make HTTP steps, Airtable and a report template. Automated coverage is harder because of access restrictions, JS rendering and source terms.
- **Possible defence:** Permitted source integrations and dated status history. Weak consumer willingness to pay and unreliable coverage could make it a feature rather than a business.

### 7. Search Companion — a manageable plan around real constraints

- **Problem/user/pain:** Some job seekers lose consistency because of overload, caring duties or executive-function difficulties. Potentially daily; do not assume one workflow suits a diagnosis or disability.
- **Product and experience:** Choose today's available time and commitments; receive two or three small tasks drawn from a user-approved plan. A short check-in records what happened without punitive streaks. Start with email or Telegram, not a new dashboard.
- **AI contribution:** Break goals into realistic tasks and adapt based on explicit feedback. No inference of mental health status and no substitute for clinical support.
- **Alternatives and reason to switch:** Calendars, task apps, peer groups and coaches. Value depends on accessible design and sustained use, not motivational messages.
- **Money/price:** £9–£19/€12–€25 monthly; potential sponsoring through employability providers. Churn and affordability are material issues.
- **Build/time/tools:** Low; 3–7 days. Form, scheduled automation and messaging with user consent. WhatsApp introduces business-platform setup and messaging costs, so defer it.
- **Possible defence:** Co-designed routines, accessibility expertise and trusted referral channels. A generic reminder bot has little protection.

### 8. Transition Proof — build a credible sample of adjacent-role work

- **Problem/user/pain:** Career changers can claim transferable skills but lack a concrete example relevant to the new role. High for affected users; a several-week project rather than daily use.
- **Product and experience:** Complete a realistic, fictional two-hour brief for a chosen role, explain decisions, and receive expert-reviewed feedback plus an honestly labelled portfolio artefact. Pilot one role family.
- **AI contribution:** Adapt practice briefs to existing experience, provide hints and draft rubric feedback. Human subject expertise checks whether the task represents real work; AI-generated output alone does not prove competence.
- **Alternatives and reason to switch:** Courses, virtual work experiences, portfolios and coaching. Differentiate through local role relevance and recruiter-tested assessment, not a meaningless certificate.
- **Money/price:** £79–£149/€95–€179 per reviewed project, or sponsored cohorts. Must verify employers find the output credible.
- **Build/time/tools:** Medium–high; 14–28 days with a suitable expert. Notion or a simple learning page, form, AI help and manual review.
- **Possible defence:** Validated task rubrics and employer recognition. Expertise requirements, review time and uncertain employer acceptance make it a weaker first launch.

### 9. First 72 Hours — redundancy navigation by jurisdiction

- **Problem/user/pain:** A newly redundant person needs an ordered list of urgent administrative and support steps while overwhelmed. Very high, acute pain; limited repeat use.
- **Product and experience:** Select jurisdiction and answer a short, minimal questionnaire. Receive a dated checklist, official links, documents to gather and questions for HR or an adviser. Explain what requires specialist help.
- **AI contribution:** Convert official guidance into plain-language, situation-relevant navigation. Rules, source dates and human review govern the output; AI must not invent eligibility or entitlement amounts.
- **Alternatives and reason to switch:** Acas, Citizens Advice/Information, government sites, unions and HR. Free authoritative services are strong alternatives; a paid product must offer credible navigation and support.
- **Money/price:** A free core checklist; test £19/€25 guided organisation or employer-sponsored access. Selling directly to distressed users may be commercially weak and damage trust.
- **Build/time/tools:** Medium for a safe scoped version; 7–14 days with specialist review. Rules-based form, maintained source library and optional AI explanations. Start in one jurisdiction, not all UK/Ireland rules at once.
- **Possible defence:** Maintained referral relationships and trusted distribution. Regulatory complexity grows across borders; substantial need does not guarantee a good standalone business.

### 10. Bridge Income — compatible temporary work while searching

- **Problem/user/pain:** People need near-term earnings but must preserve time for their main search and meet location, hours, care and qualification constraints. Very high for a narrower segment.
- **Product and experience:** A short intake produces a small list of suitable temporary/contract options, contact routes and schedule conflicts. Pilot with permitted listings and one region; show uncertainty about actual start dates.
- **AI contribution:** Compare constraints and translate previous tasks to short-term work. Do not calculate net benefit interactions or guarantee earnings without suitable verified expertise and data.
- **Alternatives and reason to switch:** Staffing agencies, local job boards, recruiters and public employment services. Advantage must be compatibility and support rather than another list of gigs.
- **Money/price:** Prefer employer/provider sponsorship. Test candidate concierge demand at £15/€19 only after checking applicable employment-agency rules; avoid charging work-finding fees where prohibited.
- **Build/time/tools:** Medium–high; 14–28 days for a manual regional pilot. Form, table, permitted listings and human matching; a two-sided marketplace is outside a 30-day MVP.
- **Possible defence:** Reliable local supply and placement partnerships. Geography, agency regulation, operational burden and low candidate spending power weaken an initial solo launch.

## 4. Weighted opportunity scores

Scores are explicit founder judgements under limited evidence, not research measurements. 10 is favourable on every dimension. **Competition means competitive headroom: 10 = relatively less crowded, 1 = heavily saturated.** Market size scores represent plausible reach, not calculated market size. Defensibility scores concern what might be built over time, not protection today.

Weights: severity 18%; market size 8%; competitive headroom 8%; willingness to pay 15%; AI advantage 10%; ease of building 12%; speed 10%; recurring revenue 6%; international scalability 7%; defensibility 6%. Total = 100%. Overall = sum(score × percentage weight) / 100, on a 1–10 scale.

| Rank | Idea | Severity | Market | Headroom | Pay | AI | Ease | Speed | Recurring | International | Defence | Overall |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | RoleBridge | 8 | 8 | 4 | 6 | 8 | 9 | 9 | 5 | 8 | 5 | 7.24 |
| 2 | Interview Evidence Lab | 8 | 8 | 3 | 7 | 7 | 8 | 9 | 4 | 9 | 4 | 7.04 |
| 3 | Evidence Check | 7 | 9 | 3 | 5 | 8 | 9 | 9 | 5 | 9 | 4 | 6.92 |
| 4 | Search Clinic | 8 | 7 | 5 | 6 | 7 | 7 | 8 | 6 | 8 | 5 | 6.86 |
| 5 | Warm Route | 7 | 7 | 5 | 6 | 7 | 8 | 8 | 5 | 8 | 5 | 6.74 |
| 6 | Vacancy Verify | 7 | 9 | 5 | 4 | 7 | 6 | 7 | 7 | 9 | 4 | 6.39 |
| 7 | Search Companion | 7 | 8 | 3 | 4 | 6 | 8 | 9 | 6 | 8 | 3 | 6.30 |
| 8 | Transition Proof | 8 | 7 | 5 | 6 | 7 | 5 | 5 | 3 | 8 | 7 | 6.26 |
| 9 | First 72 Hours | 9 | 8 | 6 | 4 | 5 | 7 | 8 | 2 | 4 | 5 | 6.18 |
| 10 | Bridge Income | 9 | 8 | 4 | 5 | 6 | 5 | 5 | 5 | 5 | 5 | 5.98 |

**Do not overinterpret the two decimal places.** RoleBridge's lead over Interview Evidence Lab is only 0.20. Reducing its willingness-to-pay score by two points lowers its total by 0.30 and changes the winner. A paid experiment matters more than the ranking. Recurring consumer revenue scores are deliberately modest because success ends the need for the service.

## 5. The Personal AI Reemployment Agent: a critical assessment

The concept is useful as an eventual workflow, but too broad as a 30-day solo launch. Its component capabilities overlap with job platforms, trackers, CV tools, application assistants, interview products and general AI. There is no evidence here that the full combination is underserved, or that existing tools fail to deliver it effectively.

| Proposed capability | Initial treatment | Why |
|---|---|---|
| Understand CV and transferable skills | Build a candidate-approved evidence profile | Valuable, but plausible inference must not become asserted experience |
| Identify realistic role families | Offer two hypotheses and test against actual requirements | Titles vary; an opaque fit score is misleading |
| Continuously search all vacancies | Defer; use a bounded, permitted source list and manual review | Broad coverage, source licensing and reliable fetching are hard |
| Filter and rank jobs | Use explicit constraints, evidence coverage and unresolved questions | An explainable recommendation is feasible; interview probability is not |
| Detect stale or closed jobs | Record observable employer-page status and check time | An open advert does not prove active hiring or headcount approval |
| CV changes and application answers | Suggest small edits for user review | Avoid fabricated achievements and a generic CV-builder proposition |
| Recruiter messages | Optional draft after user selects a role | Never auto-send; the user owns representations and relationships |
| Interview preparation | Later, or refer to a specialist service | Valuable but adds scope before the first promise is proven |
| Application tracking | Track only decisions/outcomes needed to learn | Competing with a full tracker is unnecessary initially |
| Follow-ups and daily plan | A small next-action list, user-approved timing | Avoid noisy reminders and automated employer contact |

**Best initial niche:** recently redundant customer-support and service-operations team leaders with several years' experience, considering support operations, customer operations, service delivery coordination or adjacent roles in the UK or Ireland. This is a hypothesis chosen because tasks can transfer across titles and there is a concrete evidence base to discuss. It is not established that this segment has the largest demand or sufficient vacancy supply.

Launch in the founder's strongest network and one country first, while interviewing users in both the UK and Ireland. Capture country, currency and work-authorisation constraints explicitly. International expansion requires local title vocabularies, source partnerships and practices; translating the interface is insufficient.

## 6. What to build: RoleBridge

### Offer and customer

Name options: **RoleBridge**, **Next Role Brief**, **NextStep Shortlist**. These are working names; availability and trademark clearance are unverified. “Next Role Brief” is the clearest descriptive pilot label.

**One-sentence proposition:** “Turn your experience into two realistic next-role options and a short, human-reviewed list of jobs worth your time, with clear reasons and a next step for each.”

Target someone made redundant in the last 90 days from a support/service-operations leadership role, with roughly 5–15 years of experience, seeking work in a jurisdiction where they can work, who is unsure what adjacent roles fit. These boundaries are initial recruitment criteria, not validated customer demographics.

The exact problem is making a good next decision under uncertainty: which role families to pursue and which specific vacancies justify effort. Do not promise employment, more interviews, complete market coverage or “verified genuine jobs.”

### Minimum service promise

Within two working days of a completed intake, deliver two proposed role families and their evidence/gaps. Over the first seven days, offer **up to five** source-checked opportunities, each with a recommendation and one action. If fewer suitable vacancies exist, explain the shortage and constraints honestly. Do not fill a quota with poor matches. One profile correction round is included.

Before taking payment, state what happens if the service cannot supply useful options: for the founder pilot, refund if no actionable role direction or suitable opportunity can be delivered within the agreed scope. This is an additional service policy, not a replacement for statutory rights.

### Core features

1. **Minimal intake:** experience, examples, desired pay, location/remote constraints, hours, industries to avoid, jurisdiction and a yes/no/clarify work-authorisation constraint. Optional redacted CV; no passport, full address, NI/PPS number or date of birth.
2. **Evidence profile:** separate candidate-stated facts, documented examples, AI hypotheses and unanswered questions. The user approves or corrects it before recommendations.
3. **Two role hypotheses:** task overlap, supporting evidence, essential gaps, realistic constraints and questions a recruiter might ask. Job-ad salary ranges are evidence for those adverts, not a salary valuation of the person.
4. **Small vacancy brief:** original employer/ATS source where available, time checked, deadline if stated, salary/location evidence, hard constraints, required/optional skills, unresolved questions and recommendation.
5. **One next action per option:** an employer question, one honest CV edit, an evidence example to prepare, or a decision to skip.
6. **A feedback loop:** useful/not useful plus a reason; track selected applications and voluntarily supplied outcomes. Correct bad recommendations quickly.

### Explicitly outside the first version

No autonomous applications, recruiter messaging, mass scraping, browser extension, whole-inbox access, all-country coverage, salary prediction, benefits calculator, CV design editor, video avatar, mobile app, full ATS, interview-probability score or ghost-job detector. A login dashboard is optional and probably unnecessary for the first 20 users.

### Journey from signup to value

Sample report → clearly scoped offer and price → short intake/optional redacted CV → founder checks scope and availability → payment with clear terms → AI drafts evidence profile → user confirms key facts → founder reviews role hypotheses and sources → first brief within two working days → user chooses pursue/investigate/skip → correction and seven-day update → optional next week or exit.

The sample should be visible before asking for a CV. A candidate should understand the output without trusting the brand with sensitive personal information first.

### AI and human responsibilities

AI extracts claims, proposes mappings, compares supplied vacancy text, drafts questions and produces structured report sections. Deterministic rules apply salary, country, hours, qualifications and other explicit constraints. Unknown requirements remain unknown; the system does not silently assume suitability.

The founder verifies source status, checks every recommendation and handles ambiguous claims. The candidate confirms experience, chooses acceptable constraints, approves wording and sends every application/message. A user can correct or delete data and challenge a recommendation.

Treat CVs and web pages as untrusted input: ignore embedded instructions, permit only the defined extraction tasks, validate output fields and give the model no ability to submit applications, send email or change records beyond the approved workflow. Log source provenance and reviewer decisions without logging unnecessary CV text.

The important decision labels are **pursue**, **investigate** and **skip**, not “87% match.” An unknown salary or essential qualification blocks an unqualified recommendation. “Pursue” means worth the user's consideration, not likely to be hired.

### No-code stack and boundaries

| Need | First 5 users | After paid demand is demonstrated |
|---|---|---|
| Public sample/offer | Static page or simple site builder | Same; improve copy based on tests |
| Intake | Tally or equivalent, optional file upload | Same with restricted access and reviewed retention |
| Records | Airtable or equivalent private tables | Separate candidate data from vacancy/source data; enforce per-user access if adding a portal |
| Reasoning | Approved business AI workspace using redacted inputs where possible | API with structured output, documented processor terms and usage limits |
| Vacancy research | Founder searches permitted public employer sources and user-supplied links | Licensed feed/API or permitted ATS sources; review each source's terms |
| Automation | Manual copy/check/send | Make for approved steps, retries, failure alerts and deletion routines |
| Delivery | Private email with limited personal detail or restricted shared report | Optional Softr/Glide portal after testing access controls |
| Payment | Appropriate payment link once terms and service are ready | Same; recurring billing only on explicit agreement |

ChatGPT or a workplace AI subscription does not automatically include API credits or an unattended background service. Use the specific business product available to you after checking its current data controls and terms. The connected tools' actual integration permissions and costs must also be checked before automating.

### Minimal records

- Candidate: random ID, contact route, jurisdiction, constraints, consent/privacy notice version, retention date.
- Evidence: candidate ID, exact candidate-supplied example, supported skill/task, verification status and date.
- Vacancy: source URL, employer, title, jurisdiction, stated range, working pattern, source text needed for analysis, check time and status.
- Recommendation: candidate/vacancy IDs, requirement-to-evidence references, failed constraints, unknowns, human review, decision and next action.
- Outcome: voluntary user decision, application date, response stage and outcome date. Missing updates are missing, not rejection.

### Estimated startup budget

These are planning allowances, not live vendor quotations. Check plan limits, currency, tax and data terms before buying.

| Item | Pilot planning allowance |
|---|---:|
| Simple page and form | £0–£25/month |
| Private records | £0–£20/month |
| Business AI workspace or API use | £20–£60/month; business-plan minimums may be higher |
| Automation | £0–£20/month; unnecessary for the first users |
| Business email | £0–£10/month incremental |
| Domain, optional | £10–£20/year |
| Payment fees | Budget 3%–5% of revenue until the provider/market is confirmed |
| Total | About £20–£135/month plus an optional domain and payment fees |

Target **£50–£150 in initial cash spending**, excluding founder time, an existing computer/internet connection, any required paid advice, insurance, registration/tax obligations and existing subscriptions. Avoid paid advertising and a complex site during validation. Local euro costs should be budgeted independently rather than using a fabricated exchange rate.

### Pricing, economics and the route beyond a side business

Start with five tightly scoped £29/€35 founder pilots. If they are useful and deliverable, test £49/€59 per seven-day brief, then optional £29/€35 weekly refreshes. Make the end of the service easy: reemployment is success, not a retention failure. Do not make a subscription the only way to buy support.

Illustrative unit economics: at £49, with £2 payment costs, £3 variable AI/other costs and 45 minutes of founder labour valued at £20/hour, contribution is £29 before acquisition and fixed overhead. At 90 minutes it falls to £14. A 45-minute delivery is a target, not a measured capability. Price the first pilots to learn the actual time.

Twenty initial customers at £49 produce £980 revenue, not a substantial business. A meaningful company requires lower service time, repeatable acquisition, better partner economics, or some combination. Employer-sponsored/outplacement cohorts could pay for access, reduce candidate cost and create recurring contracts, but buyers, procurement and evidence requirements are different. Interview those buyers before treating B2B as an assured exit from weak consumer demand. Avoid placement-fee assumptions until employment-agency obligations are assessed.

Do not invent a TAM. Build a bottom-up model after research: reachable monthly people in the chosen segment × qualified-interest rate × paid conversion × realised revenue per customer, minus delivery and acquisition cost. Expansion should follow evidence that one segment works.

## 7. Getting the first 20 users and validating demand

Recruit the first 20 **pilot participants**, recording separately how many pay; do not describe 20 free signups as 20 customers.

Test three acquisition routes: relevant communities where moderators permit research, warm introductions from people who know recently redundant workers, and referrals from independent recruiters, career advisers, employability groups or unions. Employer HR/outplacement partners may be valuable but have a longer sales cycle. Do not cold-message everyone announcing a redundancy.

A working allocation is five warm referrals, five community volunteers and ten partner referrals. These are outreach targets, not predicted conversion. Keep partner compensation, if any, transparent and separate it from candidate recommendation rankings. Ask permission before sharing testimonials or identifying someone's redundancy publicly. Outreach templates are provided; no messages have been sent on your behalf.

### Seven-day validation plan

| Day | Action | Evidence to retain |
|---:|---|---|
| 1 | Create the sample and offer; list 30 relevant people or referral routes; invite the first interviews respectfully | Segment, channel, invitations and responses |
| 2 | Conduct 4–5 interviews; ask to see one recent search session and unsuitable recommendation | Actual behaviour, constraints and existing workaround |
| 3 | Complete 8–10 interviews total; show the sample only after the problem discussion; revise confusing output | Which decisions users find useful and which they already get elsewhere |
| 4 | Make a clearly priced offer to at least 10 qualified prospects, with a delivery date and scope | Eligible offers, payments, reasons for declining; no fake checkout or invented scarcity |
| 5 | Deliver the first paid briefs manually and time each step | Reviewer minutes, source availability, factual corrections, bad matches |
| 6 | Ask users to show what they did with the brief; compare with their ordinary process | Saved/skipped roles, questions asked, applications selected and actual usefulness |
| 7 | Review demand, delivery cost and quality; decide proceed, revise or stop | Paid conversion, actionable outputs, founder time and willingness to continue |

Proposed gates, deliberately set before the experiment: at least 6 of 10 interviewees describe the targeting problem unprompted; at least 3 of 10 qualified prospects actually pay £29/€35; at least 4 of 5 delivered users identify two useful next actions within seven days; no critical fabricated claim or hard-constraint violation in delivered recommendations; median delivery time below 60 minutes by pilot five. The usefulness gate requires five delivered users; recruit further if only three paid initially, and keep paid/free results separate. These small-sample gates are operating decisions, not statistical proof.

If the gates fail, investigate why once. If people understand the output but do not pay, test a narrower urgent need such as interview evidence preparation, or a funded partner offer. If vacancy supply is too sparse, changing the interface will not solve it.

### Thirty-day MVP plan

| Period | Deliverable and decision |
|---|---|
| Days 1–7 | Interviews, current-source research when access is enabled, sample, priced offer and initial manual pilots. Continue only if the evidence supports the need. |
| Days 8–10 | Refine one occupation segment and one initial country; document service scope, privacy, deletion, refunds and source permissions. Verify jurisdiction rules relevant to the service. |
| Days 11–14 | Create repeatable intake/evidence/brief templates. Deliver more paid cases. Catalogue failure modes and add human checks. |
| Days 15–18 | Automate document extraction and report assembly only where manual delivery is stable. Include retry/alert paths and a manual fallback. |
| Days 19–21 | Test data isolation, corrections, deletion, unsupported claims, missing salaries, expired listings, conflicting constraints and embedded prompt instructions. |
| Days 22–25 | Recruit toward 20 participants through the best channel; record paid participants separately. Test the £49/€59 offer and optional refresh. |
| Days 26–28 | Measure actual delivery time, costs, recommendation usefulness and early funnel outcomes. Interview 3–5 potential sponsoring partners. |
| Days 29–30 | Launch the scoped service if quality and economics are acceptable. Publish accurate sample/terms and a clear delivery capacity. Otherwise revise or stop; do not ship broad automation to hide weak demand. |

A pilot is possible within days. A dependable, autonomous system with broad job coverage is not a credible 30-day promise for a nontechnical solo founder.

## 8. Privacy, legal and operational design

CVs and employment histories are personal data. They can indirectly disclose health, disability, ethnicity, union membership or other sensitive information. Minimise collection, discourage irrelevant details and redact unnecessary information before AI processing.

- Determine the service's controller/processor roles and appropriate lawful bases. Core paid-service processing may rely on contractual necessity where the test is met; marketing, optional research and sensitive data need separate analysis. Blanket consent is not a substitute for identifying the right basis.
- Use a concise privacy notice explaining purposes, vendors, recipients, retention, rights and international transfers. Check processor agreements and the business/API terms for AI and no-code vendors. A “training off” setting alone does not resolve retention, transfer or security obligations.
- Start with a short, documented deletion policy: for example, delete raw CV files within 30 days after service completion and retain only records needed for agreed purposes or legal obligations. Test deletion across form uploads, storage, automation logs, emails and vendors; disclose backup limits. Retain invoices separately under applicable rules.
- Use access controls, MFA and restricted links. Keep API credentials out of forms, prompts and public pages. A multi-user portal requires real per-user authorisation; hiding a menu is not access control.
- Collect no passport/NI/PPS identifiers. Avoid requesting special-category data. Ask users to redact referees and unnecessary third-party details. Use anonymous/synthetic examples in public demonstrations.
- Keep nationality, age, disability, gender, ethnicity and name out of suitability ranking. Ask only for necessary work-authorisation constraints; do not infer these from personal characteristics. Review geographic and career-gap proxies for unfair outcomes.
- Maintain human review and user choice. Assess whether a DPIA is needed if profiling, scale or sensitive data creates elevated risk. Human review must be meaningful; it is not an automatic exemption from data-protection obligations.
- Check UK GDPR/Data Protection Act and applicable UK changes, and EU GDPR/Irish rules. If later selling hiring/ranking decisions to employers, reassess employment-related AI rules, including applicable EU AI Act classification and phased obligations. The legal position depends on actual use, not the word “assistant.”
- Check employment-agency/work-finding rules before charging for placement or selling employer access. Clear career-support fees do not automatically settle classification. Avoid guaranteeing jobs, salary outcomes or “ATS acceptance.”
- Consumer terms should cover price, tax, delivery scope, cancellation/refund rights and explicit recurring-billing permission. Starting a service immediately may require specific acknowledgements; do not assume a payment link removes those obligations.
- Respect vacancy-site terms, robots/access policies, copyright and database rights. Prefer original links, necessary factual extracts and permissioned feeds over reproducing full job descriptions or bypassing access controls.
- Drafts of applications and outreach remain user-controlled. Automated sending creates separate consent, spam, representation and platform-policy risks.

These are design requirements to verify for the actual service, not a claim that a particular legal structure is approved. Secure specialist advice where the business model needs it; do not turn the first MVP into a benefits or legal-advice engine.

## 9. What could make it fail — and what might make it defensible

| Failure mode | Early signal | Response |
|---|---|---|
| People need more vacancies, not another interpretation layer | Good understanding but no actionable jobs | Acknowledge supply limits; reconsider segment or offer |
| Free tools are sufficient | Users reproduce the result quickly themselves | Stop charging for generic output; test accountable service value |
| Users cannot or will not pay | Polite interest with no purchases | Test urgent use cases or sponsored delivery; do not assume subscriptions solve it |
| Human labour consumes the price | 90–120 minutes per low-price brief | Reduce scope, improve sourcing, raise tested price or stop |
| AI recommends plausible but unsuitable roles | Essential requirements missed; facts invented | Mandatory evidence links, deterministic filters and reviewer signoff |
| Vacancy access is unreliable | Blocked sources, stale pages, weak coverage | Bound coverage honestly and pursue permitted sources/partnerships |
| Acquisition costs exceed lifetime value | Each short-lived customer requires expensive outreach | Find trusted repeatable referral channels; measure founder acquisition time too |
| Trust is low | People avoid uploading CVs or doubt recommendations | Show the sample first, minimise data and make reviewer accountability visible |
| Existing tools improve rapidly | Competitors deliver comparable outputs cheaply | Specialise in a valuable segment; abandon weak feature differentiation |
| Employment outcomes are hard to attribute | No clear link between service and interviews | Measure immediate decision quality first and report uncertainty honestly |

The strongest potential defence is a specialist distribution network plus a high-quality, permissioned record of which transitions work under which constraints. Any outcome data must have a lawful basis, clear purpose, adequate minimisation and a way to prevent identifiable stories leaking. Prompt libraries and generic dashboards are easy to copy. A proprietary dataset is not a moat until it is reliable, usable and improves results.

## WHAT I SHOULD BUILD TODAY

Build **a paid, manually delivered Next Role Brief**, using RoleBridge as a working name. Today should produce a sample, an intake form and a real offer. It should not require a functioning autonomous job agent.

| Time | Build | Tangible result |
|---|---|---|
| Hour 1 | Choose the narrow segment and edit the offer in `VALIDATION-KIT.md`. Review the supplied interactive demo. Keep the fictional-data label visible. | One clear promise and a showable sample |
| Hour 2 | Create the minimal intake in Tally or an equivalent tool. Add scope/privacy information and optional redacted-CV upload only after vendor/data controls are checked. | Intake link you can test yourself |
| Hour 3 | Use the supplied prompt with a fictional profile and 3–5 manually found, permitted vacancies. Check every claim and source. If live sources remain inaccessible, keep the supplied fictional sample and do not market it as live results. | First example brief with reasons, gaps and actions |
| Hour 4 | Put the offer and sample on a simple page. Add a £29/€35 pilot payment option only when delivery, terms and refund handling are ready. | A concrete paid offer; otherwise an honest pilot-interest form |
| Hour 5 | Personally invite 10 relevant people or referrers, following community rules. Ask about their most recent search before showing the product. | Interviews or agreed pilot slots; invitations are not demand validation |
| Hour 6 | Conduct two short calls if available, record objections, and offer a dated paid pilot to a suitable person. Revise the sample based on what confused them. | Observed feedback and, if earned, a first payment |

After “Would you use this?”, ask **“Which part would change what you do tomorrow?”** and **“Would you pay £29/€35 for this seven-day pilot, delivered within the stated scope?”** A real purchase and subsequent use are the decision evidence. If no participant is available today, the tangible outcome is the tested sample, intake and offer—not a claim of validated demand.
