// Local, curated vocabulary. Mentions are review candidates, never verified abilities.
export function normalise(value) { return String(value || '').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}+#]+/gu, ' ').trim(); }
const entry = (name, ...aliases) => ({ name, aliases: [name, ...aliases] });
export const SKILLS = [
  entry('Customer service', 'customer support', 'customer care'),
  entry('Team leadership', 'team leader', 'team management', 'people management', 'led a team', 'managed a team'),
  entry('Excel', 'Microsoft Excel', 'MS Excel'),
  entry('Zendesk'), entry('Salesforce'), entry('CRM', 'customer relationship management'),
  entry('Project management', 'managed projects', 'managing projects'),
  entry('Project coordination', 'project co-ordination', 'coordinated projects'),
  entry('Programme management', 'program management'),
  entry('Scheduling', 'rota planning', 'staff scheduling'),
  entry('Reporting', 'management reporting', 'service reporting'),
  entry('Recruitment', 'recruiting', 'talent acquisition'),
  entry('Training', 'staff training', 'training delivery'),
  entry('Coaching', 'coached colleagues', 'coaching colleagues'),
  entry('Mentoring'), entry('Sales'), entry('Account management'), entry('Customer success'),
  entry('SQL', 'structured query language'), entry('MySQL'), entry('PostgreSQL'), entry('SQL Server'),
  entry('Python'), entry('JavaScript'), entry('TypeScript'), entry('Java'), entry('C++'), entry('C#'),
  entry('HTML'), entry('CSS'), entry('React'), entry('Node.js', 'NodeJS'),
  entry('Power BI', 'PowerBI'), entry('Tableau'), entry('Business intelligence'),
  entry('Data analysis', 'data analytics', 'analysed data', 'analyzed data'),
  entry('Data visualisation', 'data visualization'),
  entry('Data modelling', 'data modeling'), entry('Data quality'), entry('ETL'),
  entry('Budgeting', 'budget management', 'managed budgets'),
  entry('Forecasting'), entry('Financial analysis'), entry('Financial reporting'),
  entry('Bookkeeping'), entry('Payroll'), entry('Accounts payable'), entry('Accounts receivable'),
  entry('Reconciliation', 'reconciliations'), entry('SAP'), entry('Sage'), entry('Xero'), entry('QuickBooks'),
  entry('Process improvement', 'continuous improvement', 'process improvements'),
  entry('Stakeholder management', 'stakeholder engagement', 'managing stakeholders'),
  entry('Administration', 'administrative support', 'administrative'),
  entry('Logistics'), entry('Supply chain', 'supply chain management'),
  entry('Inventory management', 'stock control'), entry('Procurement'), entry('Contract management'),
  entry('Operations', 'operations management'),
  entry('Microsoft 365', 'Office 365', 'Microsoft Office', 'MS Office'),
  entry('SharePoint'), entry('PowerPoint'), entry('Microsoft Word', 'MS Word'),
  entry('Communication', 'written communication', 'verbal communication'),
  entry('Negotiation'), entry('Presentation skills'), entry('Conflict resolution'),
  entry('Release management', 'release planning', 'release coordination', 'release co-ordination', 'managed releases', 'managing releases'),
  entry('Deployment management', 'deployment planning', 'deployment coordination', 'production deployments'),
  entry('IT change management', 'IT change control', 'change enablement', 'change advisory board', 'CAB approvals', 'CAB management'),
  entry('Cutover planning', 'cutover management', 'cutover plans'),
  entry('Release governance'), entry('Release automation'), entry('Build management'),
  entry('Version control', 'source control'), entry('Release train coordination', 'release train management'),
  entry('Change management', 'organisational change', 'organizational change'),
  entry('Change control'), entry('ITIL', 'IT infrastructure library'),
  entry('IT service management', 'ITSM'), entry('ServiceNow'),
  entry('Incident management', 'major incident management'),
  entry('Problem management'), entry('Root cause analysis', 'root-cause analysis'),
  entry('Configuration management'), entry('CMDB', 'configuration management database'),
  entry('Service transition'), entry('Service level management', 'service level agreements', 'SLA management'),
  entry('Agile'), entry('Scrum'), entry('Kanban'), entry('SAFe', 'scaled agile framework'),
  entry('Sprint planning'), entry('Backlog management', 'backlog refinement'),
  entry('Scrum facilitation', 'scrum ceremonies'),
  entry('Jira', 'JIRA Software'), entry('Confluence'), entry('Azure DevOps', 'ADO pipelines'),
  entry('CI/CD', 'CI CD', 'continuous integration', 'continuous delivery', 'continuous deployment'),
  entry('Jenkins'), entry('GitLab', 'GitLab CI'), entry('GitHub Actions'), entry('Git'),
  entry('DevOps'), entry('Docker'), entry('Kubernetes', 'K8s'), entry('Terraform'), entry('Ansible'),
  entry('AWS', 'Amazon Web Services'), entry('Microsoft Azure', 'Azure'),
  entry('Google Cloud', 'GCP', 'Google Cloud Platform'), entry('Linux'), entry('Windows Server'),
  entry('PowerShell'), entry('Bash'), entry('REST APIs', 'REST API', 'RESTful APIs'),
  entry('API testing'), entry('Postman'), entry('Selenium'), entry('Test automation', 'automated testing'),
  entry('Software testing'), entry('Regression testing'), entry('Integration testing'),
  entry('User acceptance testing', 'UAT'), entry('Quality assurance'),
  entry('SDLC', 'software development lifecycle', 'software development life cycle'),
  entry('Rollback planning', 'rollback plans', 'backout plans', 'back-out plans'),
  entry('Environment management', 'test environment management'),
  entry('Risk management', 'risk assessment', 'risk assessments'),
  entry('Dependency management', 'dependency tracking'),
  entry('RAID management', 'RAID logs', 'RAID log'),
  entry('Governance'), entry('Audit', 'auditing'), entry('Compliance'),
  entry('Business analysis'), entry('Requirements gathering', 'requirements elicitation'),
  entry('User stories'), entry('Acceptance criteria'), entry('Process mapping'),
  entry('Product management'), entry('Roadmap planning', 'product roadmaps'),
  entry('PRINCE2'), entry('PMP'), entry('Lean Six Sigma', 'Six Sigma'),
  entry('Cybersecurity', 'cyber security', 'information security'),
  entry('Access management', 'identity and access management', 'IAM'),
  entry('GDPR', 'data protection'), entry('Business continuity'), entry('Disaster recovery'),
  entry('Digital marketing'), entry('SEO', 'search engine optimisation', 'search engine optimization'),
  entry('Content marketing'), entry('Social media management'), entry('Google Analytics'),
  entry('UX design', 'user experience design'), entry('User research'), entry('Figma'),
  entry('Health and safety'), entry('Safeguarding'), entry('Patient care'),
  entry('Care planning'), entry('Teaching'), entry('Lesson planning'), entry('Assessment')
];
const lookup = new Map(SKILLS.flatMap(skill => skill.aliases.map(alias => [normalise(alias), skill.name])));
export function canonicalSkill(value) { return lookup.get(normalise(value)) || String(value).trim(); }
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Normalised spaces allow PDF line breaks and hyphenation without substring matches.
const patterns = SKILLS.map(skill => ({ ...skill, patterns: skill.aliases.map(alias => ({
  alias, regex: new RegExp(`(?<![\\p{L}\\p{N}+#])${escape(normalise(alias)).replace(/ /g, '\\s+')}(?![\\p{L}\\p{N}+#])`, 'gu')
})) }));

export function skillEvidence(source) {
  const raw = String(source || '').slice(0, 100000);
  const fragments = raw.split(/\n\s*\n|[;•]+|(?<=[.!?])\s+/u).map(text => text.trim()).filter(Boolean).map(fragment => ({ fragment, text: normalise(fragment) }));
  const found = [];
  for (const skill of patterns) {
    let evidence;
    for (const { fragment, text } of fragments) {
      for (const { alias, regex } of skill.patterns) {
        regex.lastIndex = 0;
        for (const hit of text.matchAll(regex)) {
          // Reject explicit negation/aspiration in this clause. This is conservative,
          // not a complete natural-language understanding of the person's history.
          const before = text.slice(Math.max(0, hit.index - 100), hit.index).split(/\b(?:but|however|skills|technologies|tools)\b/).at(-1);
          if (/\b(?:no|not|never|without|lack|lacks|lacking|learn|learning|seeking|aspiring|interested|exposure only)\b/u.test(before)) continue;
          const after = text.slice(hit.index + hit[0].length);
          if (/^\s+(?:not used|no experience|not experienced|not proficient)\b/.test(after)) continue;
          if (skill.name === 'Microsoft Azure' && alias === 'Azure' && /^\s+devops\b/.test(after)) continue;
          // The ordinary adjective "safe" is not evidence of the SAFe framework.
          if (skill.name === 'SAFe' && alias === 'SAFe' && !/\bSAFe\b/.test(fragment)) continue;
          const start = Math.max(0, hit.index - 65), end = Math.min(text.length, hit.index + hit[0].length + 100);
          evidence = { name: skill.name, snippet: `${start ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}` };
          break;
        }
        if (evidence) break;
      }
      if (evidence) break;
    }
    if (evidence) found.push(evidence);
  }
  return found;
}
export function findSkillMentions(source) { return skillEvidence(source).map(item => item.name); }
