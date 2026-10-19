import { normalise } from './model.mjs';

// A small, editorial catalogue for exploration, not an occupational standard,
// qualification assessment, vacancy feed, or representation of market demand.
export const CATALOGUE_VERSION = '2026-10-18';
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
  logistics: ['Logistics', 'Supply chain', 'Inventory management']
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
  }
];

export function roleById(id) { return ROLE_CATALOGUE.find(role => role.id === id); }

export function matchRole(profile, role) {
  // Only exact, confirmed skill labels/aliases count. Do not infer skills from
  // a name, title, country, unreviewed CV, free-text examples or negative phrases.
  const entered = String(profile.skills || '').split(/[,;\n]/).map(value => value.trim()).filter(Boolean);
  const matches = role.signals.flatMap(signal => {
    const accepted = new Set(aliases[signal.key].map(normalise));
    const supplied = entered.find(value => accepted.has(normalise(value)));
    return supplied ? [{ ...signal, supplied, skill: aliases[signal.key][0] }] : [];
  });
  const coreCount = matches.filter(match => match.core).length;
  return {
    role, matches,
    relevant: matches.length >= 2 && coreCount >= 1,
    // This is only a catalogue ordering rule, never a qualification/probability score.
    order: matches.length + coreCount,
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
