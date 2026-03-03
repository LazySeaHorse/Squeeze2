// ── Structured social data ───────────────────────────────────────────
// Raw posts + pre-computed per-person summaries for each compression level.
// The component handles rendering: level 0 = all posts, level 1-3 = summary cards.

export interface SocialPost {
  handle: string;
  time: string;
  text: string;
  isReply: boolean;
  replyTo?: string;
}

export const SOCIAL_TITLE = 'Remote Work Debate Thread';

// User display data
export const SOCIAL_USERS: Record<string, { display: string; color: string; karma: string }> = {
  marcusdev:       { display: 'Marcus Chen',    color: '#9D4EDD', karma: '24.5k' },
  sarahcto:        { display: 'Sarah Park',     color: '#FF9E00', karma: '18.2k' },
  jakethepm:       { display: 'Jake Morrison',  color: '#FF6D00', karma: '3.1k' },
  remotework_fan:  { display: 'WFH Advocate',   color: '#9D4EDD', karma: '9.7k' },
  cloebizops:      { display: 'Chloe Nguyen',   color: '#240046', karma: '6.4k' },
  devops_dan:      { display: 'Dan Kowalski',   color: '#FF6D00', karma: '12.8k' },
  worklifebalance: { display: 'BalancedLife',    color: '#FF9E00', karma: '5.2k' },
  techlead_nina:   { display: 'Nina Petrova',   color: '#FF6D00', karma: '15.1k' },
  startup_steve:   { display: 'Steve Huang',    color: '#240046', karma: '7.3k' },
  hr_harmony:      { display: 'Harmony Wells',  color: '#9D4EDD', karma: '11.5k' },
  data_driven:     { display: 'DataDriven',     color: '#64748b', karma: '22.0k' },
};

export const SOCIAL_POSTS: SocialPost[] = [
  // ── Opening Salvo (0-9) ────────────────────────────────────────────
  {
    handle: 'marcusdev', time: '2h',
    text: 'Hot take: Return-to-office mandates aren\'t about productivity. They\'re about control. Every single study shows remote workers are as productive or more productive than in-office workers. The data is overwhelming. So why are companies dragging people back? 🧵',
    isReply: false,
  },
  {
    handle: 'marcusdev', time: '2h',
    text: 'I\'ve been remote for 4 years. My output has never been higher. I ship more features, take fewer sick days, and my team\'s velocity is up 30%. But suddenly my CEO wants "butts in seats" 3 days a week because... vibes?',
    isReply: false,
  },
  {
    handle: 'sarahcto', time: '1h',
    text: 'Respectfully disagree. I run a 200-person eng team. Remote works for senior ICs but junior devs are struggling. Mentorship over Zoom is painful. Onboarding takes 2x as long. Not everything is about shipping features.',
    isReply: false,
  },
  {
    handle: 'jakethepm', time: '1h',
    text: '@sarahcto This. The mentorship gap is real. I was onboarded remotely in 2022 and it took me 6 months to feel productive. My friends who started in-office were ramped in 6 weeks.',
    isReply: true, replyTo: 'sarahcto',
  },
  {
    handle: 'marcusdev', time: '1h',
    text: '@sarahcto @jakethepm Fair point on mentorship. But the solution isn\'t "everyone come back." It\'s better async documentation, structured 1:1s, and intentional in-person events. The office isn\'t magic — good management is.',
    isReply: true, replyTo: 'sarahcto',
  },
  {
    handle: 'remotework_fan', time: '58m',
    text: 'My commute was 2 hours round trip. That\'s 10 hours a week I now spend with my kids, exercising, and cooking actual meals. You want me to give that up so Chad from accounting can "bump into me" at the coffee machine? No.',
    isReply: false,
  },
  {
    handle: 'cloebizops', time: '55m',
    text: '@remotework_fan The casual hallway conversation thing is real though. Some of the best cross-team ideas at our company came from random encounters. Hard to replicate on Slack.',
    isReply: true, replyTo: 'remotework_fan',
  },
  {
    handle: 'devops_dan', time: '50m',
    text: 'The real problem nobody talks about: middle managers. Remote work exposed that many of them add zero value. RTO is their survival strategy. If you manage by watching people\'s screens, you\'re not managing.',
    isReply: false,
  },
  {
    handle: 'sarahcto', time: '45m',
    text: '@devops_dan That\'s a straw man. Good managers don\'t "watch screens." They build culture, resolve conflicts, and create psychological safety. Much harder to do fully remote.',
    isReply: true, replyTo: 'devops_dan',
  },
  {
    handle: 'marcusdev', time: '40m',
    text: '@sarahcto So you\'re saying the office is a crutch for management? That actually supports the argument that we need better remote management skills, not more offices.',
    isReply: true, replyTo: 'sarahcto',
  },

  // ── Deeper Arguments (10-19) ───────────────────────────────────────
  {
    handle: 'worklifebalance', time: '38m',
    text: 'Can we also talk about how RTO disproportionately hurts working parents, disabled people, and anyone living in a high-cost city? "Just move closer to the office" isn\'t a real solution when rent is $3k/month.',
    isReply: false,
  },
  {
    handle: 'techlead_nina', time: '35m',
    text: 'Hybrid is the answer. 2 days in, 3 days remote. Best of both. Team planning and mentorship in-person, deep work at home. We\'ve done this for a year and retention is at an all-time high.',
    isReply: false,
  },
  {
    handle: 'marcusdev', time: '30m',
    text: '@techlead_nina Hybrid only works if the in-person days are actually useful. Most companies just have people come in to sit on Zoom calls in an open office. That\'s the worst of both worlds.',
    isReply: true, replyTo: 'techlead_nina',
  },
  {
    handle: 'startup_steve', time: '28m',
    text: 'I run a 30-person startup. We\'ve been fully remote since founding. Our secret? We fly the whole team to one city for a week every quarter. Costs less than an annual office lease and the bonding is 10x better than daily hallway nods.',
    isReply: false,
  },
  {
    handle: 'hr_harmony', time: '25m',
    text: 'HR perspective here: We\'ve seen 3x more applications when we list positions as remote. The talent pool is incomparably larger. Companies mandating RTO are literally losing the hiring war.',
    isReply: false,
  },
  {
    handle: 'data_driven', time: '22m',
    text: 'Just to throw some actual data in here: Owl Labs 2025 survey shows remote workers report 24% higher job satisfaction, 13% higher productivity self-assessment, and are 87% less likely to quit. The numbers aren\'t ambiguous.',
    isReply: false,
  },
  {
    handle: 'devops_dan', time: '20m',
    text: '@data_driven Thank you. Every time someone says "but culture" I want to ask them to define culture in measurable terms. Spoiler: they can\'t.',
    isReply: true, replyTo: 'data_driven',
  },
  {
    handle: 'jakethepm', time: '18m',
    text: '@startup_steve The quarterly meetup model is interesting but doesn\'t work for everyone. Junior engineers need more than 4 weeks of in-person mentorship per year. It\'s not just about bonding, it\'s about learning by osmosis.',
    isReply: true, replyTo: 'startup_steve',
  },
  {
    handle: 'sarahcto', time: '16m',
    text: '@hr_harmony That hiring advantage is real. We lost two senior engineers to remote-first competitors last quarter. Both cited flexibility as the main reason for leaving.',
    isReply: true, replyTo: 'hr_harmony',
  },
  {
    handle: 'remotework_fan', time: '14m',
    text: '@data_driven 87% less likely to quit. Let that sink in. How much does replacing one engineer cost? $50-150k? RTO is literally burning money.',
    isReply: true, replyTo: 'data_driven',
  },

  // ── Trust, Stories & Evolution (20-29) ─────────────────────────────
  {
    handle: 'cloebizops', time: '12m',
    text: 'Hot take within a hot take: the real divide isn\'t remote vs office. It\'s whether you trust your employees or not. Full stop.',
    isReply: false,
  },
  {
    handle: 'techlead_nina', time: '11m',
    text: '@cloebizops Exactly. And trust has to be earned in both directions. Employees who abuse remote work make it harder for everyone else who\'s doing it right.',
    isReply: true, replyTo: 'cloebizops',
  },
  {
    handle: 'startup_steve', time: '10m',
    text: 'I\'ll be honest, we\'ve had to let go of two people who weren\'t delivering remotely. But that\'s a management problem, not a remote work problem. Underperformers hide in offices too — they just look busy.',
    isReply: false,
  },
  {
    handle: 'marcusdev', time: '9m',
    text: '@startup_steve This is key. Bad employees are bad employees regardless of location. An office just creates the illusion of productivity. "Looking busy" ≠ being productive.',
    isReply: true, replyTo: 'startup_steve',
  },
  {
    handle: 'worklifebalance', time: '8m',
    text: 'Personal story: I\'m a single parent. Remote work literally saved my career. I was about to quit because I couldn\'t manage school pickups with a 45-minute commute. Now I\'m the top performer on my team. RTO would force me out.',
    isReply: false,
  },
  {
    handle: 'hr_harmony', time: '7m',
    text: '@worklifebalance This is exactly why blanket mandates are problematic. They disproportionately push out caregivers, who are disproportionately women. It\'s a DEI issue that most C-suites aren\'t even considering.',
    isReply: true, replyTo: 'worklifebalance',
  },
  {
    handle: 'devops_dan', time: '6m',
    text: 'My prediction: offices will become like co-working spaces. You go when you need to collaborate. You stay home when you need to focus. No mandate needed, just common sense.',
    isReply: false,
  },
  {
    handle: 'jakethepm', time: '5m',
    text: 'I\'ve been thinking about this more. Maybe the solution for junior mentorship isn\'t the office — it\'s a dedicated mentorship program with scheduled in-person sessions. Like @startup_steve\'s quarterly meetup but more targeted.',
    isReply: false,
  },
  {
    handle: 'sarahcto', time: '4m',
    text: '@jakethepm That\'s actually what we\'re piloting now. New hires get 3 months of hybrid with 3 in-office days, then transition to the team\'s normal schedule. Early results are promising.',
    isReply: true, replyTo: 'jakethepm',
  },
  {
    handle: 'data_driven', time: '3m',
    text: 'Interesting evolution in this thread. Started with two opposing camps, now converging on structured flexibility. This is how most organizational debates should work — if people actually listen.',
    isReply: false,
  },

  // ── Convergence & Wrap (30-36) ─────────────────────────────────────
  {
    handle: 'marcusdev', time: '2m',
    text: '@data_driven You\'re right. The real answer was never "fully remote" or "fully office." It\'s intentional design. Design your work model the way you design your product — based on actual user needs, not executive vibes.',
    isReply: true, replyTo: 'data_driven',
  },
  {
    handle: 'techlead_nina', time: '2m',
    text: 'This thread has genuinely shifted my thinking. We do 2/3 hybrid but haven\'t been intentional about WHAT happens on office days. Adding structured mentorship and cross-team collaboration sessions starting next month.',
    isReply: false,
  },
  {
    handle: 'remotework_fan', time: '1m',
    text: 'Look, as long as nobody\'s forcing me to commute 2 hours to attend a Zoom call from a noisy open office, I\'m happy with reasonable compromise. That\'s all anyone\'s asking.',
    isReply: false,
  },
  {
    handle: 'startup_steve', time: '1m',
    text: 'Final thought: the companies that win the next decade will be the ones that treat "where to work" as a tool, not a policy. Different projects, different phases, different needs.',
    isReply: false,
  },
  {
    handle: 'sarahcto', time: '1m',
    text: 'I think we can all agree: the answer isn\'t one-size-fits-all. Different roles, teams, and people need different things. The problem is CEOs making blanket mandates instead of trusting team leads.',
    isReply: false,
  },
  {
    handle: 'marcusdev', time: 'just now',
    text: '@sarahcto Actually, that we can agree on. 🤝',
    isReply: true, replyTo: 'sarahcto',
  },
  {
    handle: 'remotework_fan', time: 'just now',
    text: 'Thread summary: Nobody actually disagrees. Everyone wants flexibility. CEOs are the problem. Tale as old as time.',
    isReply: false,
  },
];

// ── Pre-computed summaries ───────────────────────────────────────────

export const SOCIAL_SUMMARIES: Record<1 | 2 | 3, SocialPost[][]> = {
  // ── Level 1: groups of ~10 ─────────────────────────────────────────
  1: [
    // Group 0 (posts 0-9)
    [
      { handle: 'marcusdev', time: '2h', isReply: false,
        text: 'Argued RTO mandates are about control, not productivity. Cited 4 years of higher remote output, 30% velocity increase. Countered mentorship concerns with better async docs, structured 1:1s. Called the office a "crutch for management."' },
      { handle: 'sarahcto', time: '1h', isReply: false,
        text: 'Pushed back — remote hurts junior mentorship and onboarding (takes 2x longer). Defended managers as culture builders, not screen watchers. Creates psychological safety.' },
      { handle: 'jakethepm', time: '1h', isReply: false,
        text: 'Backed sarahcto. Took 6 months to ramp remotely vs. 6 weeks in-office for friends. The mentorship gap is real.' },
      { handle: 'remotework_fan', time: '58m', isReply: false,
        text: 'Saved 10hrs/week on commute. Now spends it with kids, exercising, cooking. Refuses to give that up for "hallway bumping."' },
      { handle: 'cloebizops', time: '55m', isReply: false,
        text: 'Acknowledged random hallway encounters do drive real cross-team innovation. Hard to replicate on Slack.' },
      { handle: 'devops_dan', time: '50m', isReply: false,
        text: 'Argued middle managers were exposed as low-value by remote work. RTO is their survival strategy.' },
    ],
    // Group 1 (posts 10-19)
    [
      { handle: 'worklifebalance', time: '38m', isReply: false,
        text: 'RTO disproportionately hurts working parents, disabled people, and high-cost-city residents.' },
      { handle: 'techlead_nina', time: '35m', isReply: false,
        text: 'Advocated hybrid (2 in/3 remote). Retention at all-time high. In-person for planning/mentorship, remote for deep work.' },
      { handle: 'startup_steve', time: '28m', isReply: false,
        text: 'Runs a 30-person fully remote startup. Quarterly in-person weeks cost less than an office lease and bonding is 10x better.' },
      { handle: 'hr_harmony', time: '25m', isReply: false,
        text: 'Remote listings get 3x more applications. Companies mandating RTO are losing the hiring war. sarahcto confirmed — lost 2 engineers to remote-first competitors.' },
      { handle: 'data_driven', time: '22m', isReply: false,
        text: 'Cited Owl Labs 2025 survey: 24% higher satisfaction, 13% higher productivity, 87% less likely to quit when remote.' },
      { handle: 'remotework_fan', time: '14m', isReply: false,
        text: 'Calculated that engineer replacement costs ($50-150k) make RTO financially reckless.' },
    ],
    // Group 2 (posts 20-29)
    [
      { handle: 'cloebizops', time: '12m', isReply: false,
        text: 'Reframed the debate: it\'s fundamentally about trust vs. control, not remote vs. office.' },
      { handle: 'startup_steve', time: '10m', isReply: false,
        text: 'Fired 2 remote underperformers, but called it a management problem, not a location problem. Underperformers hide in offices too.' },
      { handle: 'marcusdev', time: '9m', isReply: false,
        text: '"Looking busy" in an office ≠ being productive. Bad employees are bad regardless of location.' },
      { handle: 'worklifebalance', time: '8m', isReply: false,
        text: 'Shared personal story — single parent, remote work saved their career. RTO would force them out.' },
      { handle: 'hr_harmony', time: '7m', isReply: false,
        text: 'Connected blanket mandates to DEI issues — disproportionately pushes out caregivers (mostly women).' },
      { handle: 'jakethepm', time: '5m', isReply: false,
        text: 'Reconsidered position — maybe dedicated mentorship programs beat mandatory office time. Evolved from initial stance.' },
      { handle: 'sarahcto', time: '4m', isReply: false,
        text: 'Piloting 3-month hybrid onboarding for new hires with promising early results.' },
    ],
    // Group 3 (posts 30-36)
    [
      { handle: 'marcusdev', time: '2m', isReply: false,
        text: 'The real answer is intentional design — treat work location like product design, based on actual user needs. Agreed with sarahcto on flexibility.' },
      { handle: 'techlead_nina', time: '2m', isReply: false,
        text: 'Thread shifted her thinking. Adding structured mentorship and cross-team collaboration to hybrid office days.' },
      { handle: 'startup_steve', time: '1m', isReply: false,
        text: 'Companies that win will treat "where to work" as a tool, not a policy. Different projects need different setups.' },
      { handle: 'sarahcto', time: '1m', isReply: false,
        text: 'No one-size-fits-all. Trust team leads over executive mandates.' },
      { handle: 'remotework_fan', time: 'just now', isReply: false,
        text: 'Thread conclusion: Nobody actually disagrees. Everyone wants flexibility. Blanket mandates are the real problem.' },
    ],
  ],

  // ── Level 2: groups of ~19 ─────────────────────────────────────────
  2: [
    // Group 0 (posts 0-18)
    [
      { handle: 'marcusdev', time: '2h', isReply: false,
        text: 'RTO mandates are about control, not productivity. 4 years remote, 30% velocity increase. Office is a management crutch. Mentorship gaps need better tools, not mandatory office time.' },
      { handle: 'sarahcto', time: '1h', isReply: false,
        text: '200-person team lead. Remote hurts junior devs — onboarding takes 2x longer. Good managers build culture and psychological safety, harder remotely. Lost 2 engineers to remote-first competitors.' },
      { handle: 'remotework_fan', time: '58m', isReply: false,
        text: 'Saved 10hrs/week commuting. Calculated engineer replacement at $50-150k makes RTO financially reckless.' },
      { handle: 'devops_dan', time: '50m', isReply: false,
        text: 'Middle managers exposed as low-value. Challenged "culture" advocates to define culture in measurable terms.' },
      { handle: 'techlead_nina', time: '35m', isReply: false,
        text: 'Hybrid (2/3) with retention at all-time high. But needs intentional structure to work.' },
      { handle: 'startup_steve', time: '28m', isReply: false,
        text: '30-person remote startup. Quarterly team meetups cheaper than leasing offices, bonding 10x better.' },
      { handle: 'hr_harmony', time: '25m', isReply: false,
        text: 'Remote listings attract 3x more applicants. Talent pool advantage is decisive for hiring.' },
      { handle: 'data_driven', time: '22m', isReply: false,
        text: 'Owl Labs data: 24% higher satisfaction, 87% less likely to quit remote. Numbers aren\'t ambiguous.' },
    ],
    // Group 1 (posts 19-36)
    [
      { handle: 'cloebizops', time: '12m', isReply: false,
        text: 'Reframed debate as trust vs. control. Hallway encounters have real value but aren\'t worth mandatory attendance.' },
      { handle: 'startup_steve', time: '10m', isReply: false,
        text: 'Fired underperformers remotely — it\'s management, not location. Companies that win will treat where-to-work as a tool.' },
      { handle: 'marcusdev', time: '9m', isReply: false,
        text: '"Looking busy" ≠ productive. Real answer is intentional design based on needs. Agreed with sarahcto on flexibility.' },
      { handle: 'worklifebalance', time: '8m', isReply: false,
        text: 'Single parent — remote saved their career. Connected mandates to DEI and caregiver impact.' },
      { handle: 'sarahcto', time: '4m', isReply: false,
        text: 'Piloting 3-month hybrid onboarding. No one-size-fits-all — trust team leads over executive mandates.' },
      { handle: 'techlead_nina', time: '2m', isReply: false,
        text: 'Thread shifted her thinking. Adding structured collaboration to hybrid days.' },
      { handle: 'remotework_fan', time: 'just now', isReply: false,
        text: 'Open to reasonable compromise. Thread conclusion: everyone wants flexibility, CEOs making rigid rules are the problem.' },
    ],
  ],

  // ── Level 3: groups of all ─────────────────────────────────────────
  3: [
    // All posts
    [
      { handle: 'marcusdev', time: '2h', isReply: false,
        text: 'Led the debate. RTO is about control, not productivity — 4 years remote, strong output. Proposed better tooling over office mandates. Eventually agreed with sarahcto on intentional flexibility over blanket rules.' },
      { handle: 'sarahcto', time: '1h', isReply: false,
        text: 'Counterpoint — junior mentorship suffers remotely. 200-person team perspective. Lost engineers to remote competitors. Piloting hybrid onboarding. Concluded: trust team leads, no blanket mandates.' },
      { handle: 'remotework_fan', time: '58m', isReply: false,
        text: 'Strongest pro-remote voice. Saved 10hrs/week commuting. Calculated RTO replacement costs. Open to reasonable compromise if not forced into noisy-office Zoom calls.' },
      { handle: 'devops_dan', time: '50m', isReply: false,
        text: 'Middle management critique — RTO as survival strategy for managers who add low value. Challenged "culture" to be defined in measurable terms.' },
      { handle: 'techlead_nina', time: '35m', isReply: false,
        text: 'Hybrid advocate (2 in/3 remote). Thread shifted her thinking toward more intentional office days with structured collaboration and mentorship.' },
      { handle: 'startup_steve', time: '28m', isReply: false,
        text: 'Fully remote startup founder. Quarterly meetups model. Fired underperformers — management problem, not location. "Where to work" should be a tool, not a policy.' },
      { handle: 'hr_harmony', time: '25m', isReply: false,
        text: 'HR data: remote listings get 3x applications. Connected blanket mandates to DEI — disproportionately pushes out caregivers (mostly women).' },
      { handle: 'data_driven', time: '22m', isReply: false,
        text: 'Brought survey data: 24% higher satisfaction, 87% less likely to quit. Noted the thread\'s evolution from polarization to consensus.' },
      { handle: 'worklifebalance', time: '38m', isReply: false,
        text: 'Single parent perspective — remote saved their career. RTO would force them out. Equity issue for parents, disabled, high-cost-city residents.' },
      { handle: 'jakethepm', time: '1h', isReply: false,
        text: 'Initially pro-office for mentorship (took 6mo to ramp remotely). Evolved to supporting dedicated mentorship programs over mandatory attendance.' },
      { handle: 'cloebizops', time: '55m', isReply: false,
        text: 'Acknowledged hallway encounters\' value. Reframed the core debate as trust vs. control.' },
    ],
  ],
};