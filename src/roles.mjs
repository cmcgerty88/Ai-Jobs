import { normalise, hasPhrase } from './model.mjs';
import { canonicalSkill } from './skills.mjs';

// A small, editorial catalogue for exploration, not an occupational standard,
// qualification assessment, vacancy feed, or representation of market demand.
export const CATALOGUE_VERSION = '2026-10-20';
const aliases = {
  service: ['Customer service', 'Customer support'],
  leadership: ['Team leadership', 'Team management', 'People management', 'Team leader'],
  excel: ['Excel', 'Microsoft Excel', 'Spreadsheets'],
  reporting: ['Reporting', 'Service reporting', 'Management reporting'],
  scheduling: ['Scheduling', 'Rota planning', 'Staff scheduling'],
  projects: ['Project management', 'Project coordination'],
  process: ['Process improvement', 'Continuous improvement'],
  operations: ['Operations', 'Operations management'],
  stakeholders: ['Stakeholder management', 'Stakeholder engagement'],
  communication: ['Communication', 'Written communication', 'Verbal communication'],
  administration: ['Administration', 'Administrative', 'Administrative support'],
  office: ['Microsoft 365', 'Office 365', 'Microsoft Office'],
  crm: ['Salesforce', 'Zendesk', 'CRM', 'CRM administration'],
  accounts: ['Account management', 'Customer success'],
  sales: ['Sales', 'Sales support'],
  recruitment: ['Recruitment', 'Recruiting', 'Talent acquisition'],
  training: ['Training', 'Staff training', 'Training delivery'],
  data: ['Data analysis', 'Data analytics'],
  sql: ['SQL', 'Structured query language'],
  bi: ['Power BI', 'Tableau', 'Business intelligence'],
  logistics: ['Logistics', 'Supply chain', 'Inventory management'],
  release: ['Release management', 'Deployment management'],
  change: ['IT change management', 'Change control', 'Service transition'],
  itil: ['ITIL', 'IT service management'],
  delivery: ['CI/CD', 'DevOps', 'SDLC'],
  agile: ['Agile', 'Scrum', 'Kanban', 'SAFe'],
  risk: ['Risk management', 'RAID management', 'Dependency management'],
  budget: ['Budgeting'],
  tools: ['Jira', 'Azure DevOps', 'ServiceNow'],
  testing: ['User acceptance testing', 'Regression testing', 'Software testing', 'Rollback planning']
};
const signal = (key, connection, core = false) => ({ key, connection, core });

export const ROLE_CATALOGUE = [
  {
    id: 'service-delivery-coordinator', title: 'Service delivery coordinator', category: 'Service & operations',
    description: 'Coordinate service requests, keep work moving between teams, and communicate progress.',
    signals: [signal('service', 'may help you understand service issues and customer expectations', true), signal('scheduling', 'may support coordinating work and cover', true), signal('reporting', 'may support tracking service measures'), signal('excel', 'may support keeping service records'), signal('stakeholders', 'may support updates across teams')],
    checks: ['Whether the role requires sector-specific knowledge, technical support or formal project qualifications.', 'The scope of responsibility: coordination, account ownership and technical service management are different jobs.'],
    example: 'Prepare one example of coordinating a request or escalation across teams, including what you personally did.',
    terms: ['service delivery coordinator', 'service coordinator', 'service operations coordinator']
  },
  {
    id: 'operations-coordinator', title: 'Operations coordinator', category: 'Service & operations',
    description: 'Organise day-to-day processes, handle operational information, and follow up on outstanding work.',
    signals: [signal('operations', 'may connect to the day-to-day work of an operations team', true), signal('process', 'may support improving how work is completed', true), signal('scheduling', 'may support coordinating people and tasks', true), signal('excel', 'may support operational records and reports'), signal('administration', 'may support keeping processes organised')],
    checks: ['Which industry, systems and processes the employer expects you to know.', 'Whether the advert describes office coordination, warehouse work or a specialist operational role.'],
    example: 'Describe a process you kept running or improved, and the outcome you can support with evidence.',
    terms: ['operations coordinator', 'business operations coordinator', 'operations administrator']
  },
  {
    id: 'project-coordinator', title: 'Project coordinator', category: 'Projects & administration',
    description: 'Help a project team track actions, organise information, and keep people updated.',
    signals: [signal('projects', 'may support project planning and follow-up', true), signal('stakeholders', 'may support coordinating project updates', true), signal('scheduling', 'may support meetings and delivery schedules'), signal('reporting', 'may support progress reports'), signal('administration', 'may support project records')],
    checks: ['Whether a project qualification or experience in a particular delivery method is essential.', 'The required sector knowledge and responsibility for budgets, risks or technical delivery.'],
    example: 'Prepare an example of tracking actions or coordinating a piece of work with a deadline.',
    terms: ['project coordinator', 'project support officer', 'project administrator']
  },
  {
    id: 'customer-success-associate', title: 'Customer success associate', category: 'Customers & sales',
    description: 'Support customers in using a product or service and help resolve questions during their journey.',
    signals: [signal('service', 'may support understanding customer needs', true), signal('accounts', 'may support ongoing customer relationships', true), signal('crm', 'may support managing customer records'), signal('communication', 'may support customer explanations and updates'), signal('training', 'may support customer onboarding')],
    checks: ['Whether B2B software experience, renewals, sales targets or account ownership are essential.', 'The product knowledge expected and whether the role is primarily support or commercial account management.'],
    example: 'Describe a time you helped a customer achieve an outcome, and distinguish support work from sales or renewal ownership.',
    terms: ['customer success associate', 'customer onboarding specialist', 'customer success coordinator']
  },
  {
    id: 'sales-support-coordinator', title: 'Sales support coordinator', category: 'Customers & sales',
    description: 'Help a sales team manage records, customer enquiries, quotations and follow-up tasks.',
    signals: [signal('sales', 'may support understanding a sales team’s workflow', true), signal('accounts', 'may support following up on customer requirements', true), signal('administration', 'may support quotations and records'), signal('crm', 'may support maintaining the sales pipeline'), signal('excel', 'may support sales reporting')],
    checks: ['Whether this is a support role or includes outbound selling and individual revenue targets.', 'The required product knowledge, CRM system and handling of quotations or orders.'],
    example: 'Prepare an example of keeping customer or sales information accurate and following work through to completion.',
    terms: ['sales support coordinator', 'sales administrator', 'sales operations assistant']
  },
  {
    id: 'training-coordinator', title: 'Training coordinator', category: 'People & learning',
    description: 'Organise training sessions, coordinate participants and trainers, and maintain learning records.',
    signals: [signal('training', 'may support understanding how people learn', true), signal('scheduling', 'may support organising sessions', true), signal('administration', 'may support learning records'), signal('communication', 'may support participant and trainer updates'), signal('reporting', 'may support completion reporting')],
    checks: ['Whether the job requires delivering training, designing learning materials or only coordinating sessions.', 'Any required learning-system experience, sector checks or training qualifications.'],
    example: 'Describe a session or programme you organised or delivered, being clear about your own contribution.',
    terms: ['training coordinator', 'learning and development coordinator', 'training administrator']
  },
  {
    id: 'recruitment-coordinator', title: 'Recruitment coordinator', category: 'People & learning',
    description: 'Coordinate interviews, maintain candidate records, and help keep a hiring process organised.',
    signals: [signal('recruitment', 'may support understanding hiring processes', true), signal('scheduling', 'may support interview coordination', true), signal('administration', 'may support accurate records'), signal('communication', 'may support candidate updates'), signal('stakeholders', 'may support coordination with hiring managers')],
    checks: ['Whether recruitment-system experience or prior end-to-end recruiting is essential.', 'Whether the role includes agency sales, sourcing targets, or responsibilities requiring employment-law knowledge.'],
    example: 'Prepare an example of coordinating people and appointments while handling information carefully.',
    terms: ['recruitment coordinator', 'recruitment administrator', 'talent acquisition coordinator']
  },
  {
    id: 'administrative-coordinator', title: 'Administrative coordinator', category: 'Projects & administration',
    description: 'Keep office information, schedules and administrative tasks organised for a team.',
    signals: [signal('administration', 'may connect to day-to-day administrative work', true), signal('scheduling', 'may support calendars and appointments', true), signal('office', 'may support documents and team information'), signal('excel', 'may support maintaining records'), signal('communication', 'may support queries and updates')],
    checks: ['The level of responsibility and whether the role fits the direction you want to take.', 'Specialist software, finance duties or sector requirements mentioned in the advert.'],
    example: 'Describe a system, schedule or set of records you kept accurate and useful for other people.',
    terms: ['administrative coordinator', 'office coordinator', 'team administrator']
  },
  {
    id: 'reporting-analyst', title: 'Reporting analyst', category: 'Data & reporting',
    description: 'Prepare and explain reports that help a team understand its activity or performance.',
    signals: [signal('data', 'may support interpreting information', true), signal('reporting', 'may support preparing useful reports', true), signal('excel', 'may support spreadsheet-based analysis'), signal('sql', 'may support extracting data where required'), signal('bi', 'may support dashboards and visual reporting')],
    checks: ['The actual level of SQL, statistics, spreadsheet work and business-intelligence tools required.', 'Whether a technical qualification, portfolio or specialist domain experience is essential.'],
    example: 'Prepare a report you can explain: its question, source data, checks and how someone used it. Remove confidential information.',
    terms: ['reporting analyst', 'MI analyst', 'reporting coordinator']
  },
  {
    id: 'workforce-scheduler', title: 'Workforce scheduler', category: 'Service & operations',
    description: 'Help organise staffing schedules, respond to changes, and maintain coverage information.',
    signals: [signal('scheduling', 'may connect to planning cover and handling changes', true), signal('excel', 'may support schedules and staffing records'), signal('reporting', 'may support coverage and workload information'), signal('leadership', 'may provide context about team capacity'), signal('communication', 'may support communicating changes')],
    checks: ['Whether specialist workforce-management tools or demand forecasting experience are essential.', 'Shift patterns, out-of-hours duties and the scale of the scheduling operation.'],
    example: 'Describe a time you balanced availability, workload and a change in staffing requirements.',
    terms: ['workforce scheduler', 'resource scheduling coordinator', 'workforce planning administrator']
  },
  {
    id: 'logistics-coordinator', title: 'Logistics coordinator', category: 'Service & operations',
    description: 'Coordinate the movement of goods or related information and follow up on delivery issues.',
    signals: [signal('logistics', 'may connect to delivery or stock processes', true), signal('operations', 'may provide context for operational coordination', true), signal('scheduling', 'may support timing and resource coordination'), signal('excel', 'may support delivery records'), signal('service', 'may support queries about deliveries')],
    checks: ['Whether customs, freight, transport compliance or specific logistics systems are essential.', 'Physical location, shifts and any warehouse or driving duties in the actual job.'],
    example: 'Prepare an example of coordinating work or resolving an operational delay, without claiming logistics expertise you do not have.',
    terms: ['logistics coordinator', 'transport administrator', 'supply chain coordinator']
  },
  {
    id: 'customer-support-lead', title: 'Customer support team lead', category: 'Customers & sales',
    description: 'Support a customer-service team, organise day-to-day work and help improve service delivery.',
    signals: [signal('leadership', 'may connect to supporting and managing a team', true), signal('service', 'may support understanding customer issues', true), signal('training', 'may support coaching colleagues'), signal('reporting', 'may support understanding service performance'), signal('process', 'may support improving team processes')],
    checks: ['The level of line-management experience expected, including performance management and hiring.', 'Required sector or technical knowledge, team size and shift responsibilities.'],
    example: 'Describe how you supported a colleague or team, including your actual authority and the outcome.',
    terms: ['customer support team lead', 'customer service team leader', 'support team supervisor']
  },
  {
    id: 'release-manager', title: 'Release manager', category: 'Technology delivery',
    description: 'Plan and coordinate software releases, readiness checks, dependencies and safe production changes.',
    signals: [signal('release', 'connects to coordinating releases and deployments', true), signal('change', 'supports approval and change control', true), signal('delivery', 'supports understanding the delivery lifecycle'), signal('risk', 'supports managing release risks and dependencies'), signal('stakeholders', 'supports cross-team readiness decisions'), signal('testing', 'supports testing and recovery planning'), signal('tools', 'supports delivery tracking')],
    checks: ['Whether this is release coordination or a hands-on engineering role requiring scripting and pipeline ownership.', 'The scale of releases, change approvals, deployment windows and on-call responsibilities.'],
    example: 'Describe a release you coordinated: dependencies, readiness criteria, your decision-making authority and the outcome.',
    terms: ['release manager', 'software release manager', 'release and deployment manager']
  },
  {
    id: 'it-change-manager', title: 'IT change manager', category: 'Technology delivery',
    description: 'Coordinate technology change assessment, approvals, scheduling and post-change review.',
    signals: [signal('change', 'connects to assessing and controlling IT changes', true), signal('itil', 'supports service-management practices', true), signal('risk', 'supports evaluating impact and recovery'), signal('release', 'supports change and release coordination'), signal('stakeholders', 'supports decision-making across teams')],
    checks: ['Whether the advert concerns IT service changes or organisational change; these require different experience.', 'The expected ITIL knowledge, approval authority and emergency-change responsibilities.'],
    example: 'Prepare an example of a technology change you assessed, including the risk, decision and post-change review.',
    terms: ['IT change manager', 'technology change manager', 'change and release manager']
  },
  {
    id: 'technical-delivery-manager', title: 'Technical delivery manager', category: 'Technology delivery',
    description: 'Coordinate technology delivery across teams, dependencies, risks and stakeholders.',
    signals: [signal('projects', 'supports planning and coordinating delivery', true), signal('delivery', 'connects to software delivery practices', true), signal('agile', 'supports iterative planning'), signal('risk', 'supports dependency and risk management'), signal('stakeholders', 'supports expectations and delivery decisions')],
    checks: ['The depth of engineering knowledge and responsibility for architecture or people management.', 'Whether commercial ownership, supplier management or a particular delivery method is essential.'],
    example: 'Explain a technical delivery you coordinated, including dependencies, trade-offs and what you personally owned.',
    terms: ['technical delivery manager', 'software delivery manager', 'IT delivery manager']
  },
  {
    id: 'operations-manager', title: 'Operations manager', category: 'Service & operations',
    description: 'Manage operational processes, resources, service performance and improvement.',
    signals: [signal('operations', 'connects to running operational processes', true), signal('leadership', 'supports responsibility for people and performance', true), signal('process', 'supports improving operational work'), signal('budget', 'supports resource decisions'), signal('reporting', 'supports performance review')],
    checks: ['The industry, location and operational systems required; office and manufacturing operations differ.', 'The team size, budget authority, safety duties and level of responsibility.'],
    example: 'Prepare an example of improving an operation, specifying your authority, constraints and a verifiable result.',
    terms: ['operations manager', 'business operations manager', 'service operations manager']
  },
  {
    id: 'project-manager', title: 'Project manager', category: 'Projects & administration',
    description: 'Plan and manage project scope, milestones, risks, resources and stakeholder decisions.',
    signals: [signal('projects', 'connects to managing project work', true), signal('risk', 'supports managing delivery uncertainty', true), signal('stakeholders', 'supports decisions and expectations'), signal('budget', 'supports financial control'), signal('agile', 'supports iterative delivery where appropriate')],
    checks: ['The required sector expertise, qualifications and responsibility for scope and budget.', 'Whether this is technical, construction, business-change or another specialist project role.'],
    example: 'Describe a project you owned, including scope, trade-offs, your decisions and the result.',
    terms: ['project manager', 'business project manager', 'IT project manager']
  }
];

export function roleById(id) { return ROLE_CATALOGUE.find(role => role.id === id); }

const families = {
  'service-delivery-coordinator': 'service', 'customer-success-associate': 'service', 'customer-support-lead': 'service', 'workforce-scheduler': 'service',
  'operations-coordinator': 'operations', 'operations-manager': 'operations',
  'project-coordinator': 'projects', 'project-manager': 'projects',
  'sales-support-coordinator': 'sales', 'training-coordinator': 'learning',
  'recruitment-coordinator': 'recruitment', 'administrative-coordinator': 'administration',
  'reporting-analyst': 'data', 'logistics-coordinator': 'logistics',
  'release-manager': 'technology', 'it-change-manager': 'technology', 'technical-delivery-manager': 'technology'
};
const familyTerms = {
  technology: ['release', 'deployment', 'technical delivery', 'software delivery', 'IT delivery', 'IT change', 'technology change'],
  service: ['customer service', 'customer support', 'customer success', 'service coordinator', 'service delivery coordinator', 'workforce', 'resource scheduling'],
  operations: ['operations'], projects: ['project', 'programme', 'program manager'],
  sales: ['sales'], learning: ['training', 'learning and development'], recruitment: ['recruitment', 'recruiting', 'talent acquisition'],
  administration: ['administrative', 'administrator', 'office coordinator'], data: ['data', 'reporting', 'MI analyst', 'business intelligence'],
  logistics: ['logistics', 'supply chain', 'transport']
};
const level = title => /\b(?:director|head|chief)\b/.test(normalise(title)) ? 3
  : /\b(?:manager|lead|leader|supervisor)\b/.test(normalise(title)) ? 2 : 1;
export function directionContext(profile, role) {
  const target = String(profile.targetRole || '').trim();
  const title = target || String(profile.currentRole || '').trim();
  const basis = target ? 'target role' : 'current role';
  if (!title) return { compatible: true, direct: false, reason: 'Based on your confirmed skills; no role focus was entered.' };
  const direct = role.terms.some(term => hasPhrase(title, term));
  const exactFamily = ROLE_CATALOGUE.filter(item => item.terms.some(term => hasPhrase(title, term))).map(item => families[item.id]);
  const focus = exactFamily.length ? exactFamily : Object.entries(familyTerms).filter(([, terms]) => terms.some(term => hasPhrase(title, term))).map(([family]) => family);
  // Do not substitute another occupation merely because it shares generic skills.
  const compatible = direct || (focus.includes(families[role.id]) && level(title) === level(role.title));
  return { compatible, direct, reason: direct ? `Title connects to your ${basis}: ${title}. Check the actual responsibilities and level.`
    : compatible ? `Related work area and responsibility level to your ${basis}: ${title}. Sector requirements still need checking.`
      : `Outside the supported focus of your ${basis}: ${title}. Available to browse, not suggested.` };
}

export function matchRole(profile, role) {
  // Only exact, confirmed skill labels/aliases count. Do not infer skills from
  // a name, title, country, unreviewed CV, free-text examples or negative phrases.
  const entered = String(profile.skills || '').split(/[,;\n]/).map(value => value.trim()).filter(Boolean);
  const matches = role.signals.flatMap(signal => {
    const accepted = new Set(aliases[signal.key].map(value => normalise(canonicalSkill(value))));
    const supplied = entered.find(value => accepted.has(normalise(canonicalSkill(value))));
    return supplied ? [{ ...signal, supplied, skill: aliases[signal.key][0] }] : [];
  });
  const coreCount = matches.filter(match => match.core).length;
  const context = directionContext(profile, role);
  return {
    role, matches, context,
    relevant: context.direct || (context.compatible && matches.length >= 2 && coreCount >= 1),
    // This is only a catalogue ordering rule, never a qualification/probability score.
    order: (context.direct ? 100 : 0) + matches.length + coreCount,
    prompts: role.signals.filter(signal => !matches.some(match => match.key === signal.key)).map(signal => aliases[signal.key][0])
  };
}

export function exploreRoles(profile, limit = 5) {
  return ROLE_CATALOGUE.map(role => matchRole(profile, role)).filter(match => match.relevant)
    .sort((a, b) => b.order - a.order || a.role.title.localeCompare(b.role.title))
    .slice(0, Math.max(0, Math.min(5, limit)));
}

export function prepareSearchTerms(role, profile) {
  // The user copies plain text; there is no automatic search or external URL.
  const place = String(profile.locations || '').trim();
  const country = profile.country === 'IE' ? 'Ireland' : profile.country === 'GB' ? 'UK' : '';
  const pattern = profile.workMode === 'remote' ? 'remote' : profile.workMode === 'hybrid' ? 'hybrid' : '';
  return role.terms.map(term => [term, pattern, place || country].filter(Boolean).join(' '));
}
