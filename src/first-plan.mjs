import { exploreRoles } from './roles.mjs';
import { diagnose } from './progress.mjs';

// A starting experiment, not an assessment of hiring probability or rejection causes.
// Only reviewed skill labels influence role suggestions; raw CV text is never used.
export function firstPlan(state, now = Date.now()) {
  const goal = state.profile.goal;
  const roles = goal === 'clarity' ? exploreRoles(state.profile, 2) : [];
  const report = diagnose(state, now);
  const limitation = 'This is a starting experiment based on your entries, not a prediction of an offer or an explanation of an employer’s decision.';
  if (report.applications) return {
    title: 'Take one step based on your recorded outcomes',
    detail: report.recommendation,
    basis: `${report.applications} applications and ${report.interviews} completed interviews recorded. Your next step uses these entries and your chosen goal.`,
    action: 'Review my applications', step: 5, roles: [], limitation: report.caveat
  };
  if (goal === 'offers') return {
    title: 'Practise one specific example for your next interview',
    detail: 'Choose one essential requirement from a real advert. Explain the situation, your task, what you personally did and the result. Use only facts you can support; practise saying it aloud.',
    basis: 'You want help turning interviews into offers. Your experience example gives you something concrete to practise, but we don’t yet have recorded outcomes to identify a pattern.',
    action: 'Choose a vacancy to practise for', step: 4, roles, limitation
  };
  if (goal === 'interviews' || goal === 'applications') return {
    title: 'Check the evidence in one application',
    detail: 'Choose one real advert. For each essential requirement, find a specific example in your experience. Make relevant evidence easy to find in your CV, and check any missing requirements before applying.',
    basis: 'You want to improve your applications. Your summary is a starting point; without individual application records we can’t tell whether targeting, evidence or response times are the issue.',
    action: 'Compare one vacancy', step: 4, roles, limitation
  };
  return {
    title: roles.length ? 'Explore one of these role directions' : 'Start with a role you want to investigate',
    detail: roles.length
      ? `Look for one ${roles[0].role.title.toLowerCase()} advert. Compare its essential requirements with your example of work. Check the location, pay and working pattern before deciding whether to pursue it.`
      : 'Find one advert for work you have done or would like to explore. Check the essential requirements against your experience. You can compare it here even if its title isn’t in our role library.',
    basis: roles.length ? 'These directions connect to the skill labels you confirmed. They are starting points to investigate, not a judgement that you are qualified.'
      : 'Our small role library has no connections to the skill labels you entered. This says nothing about your employability; many careers and skill descriptions are not covered.',
    action: roles.length ? 'Explore these directions' : 'Compare a vacancy I choose', step: roles.length ? 3 : 4, roles,
    limitation: limitation + ' Actual vacancies may have requirements or working conditions you haven’t checked yet.'
  };
}
