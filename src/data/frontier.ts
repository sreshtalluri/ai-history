import type { Lab, OpenProblem } from '../types';

/** The date this snapshot was researched. Update when refreshing. */
export const FRONTIER_AS_OF = '2026-10-21';

export const labs: readonly Lab[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    color: '#d97757',
    founded: '2021 · San Francisco',
    oneLiner: 'Maker of Claude. Founded by former OpenAI researchers with safety as its stated mission.',
    models: [
      { name: 'Claude Fable 5.1', date: 'Sep 2026', note: 'Top generally available tier ("Mythos-class"), above Opus.' },
      { name: 'Claude Opus 5.5', date: 'Sep 2026', note: 'Flagship for agentic coding and knowledge work.' },
      { name: 'Claude Sonnet 5.5', date: 'Sep 2026', note: 'Balanced speed and capability.' },
      { name: 'Claude Haiku 5.5', date: 'Oct 2026', note: 'Fastest, smallest model.' },
      { name: 'Claude Mythos', date: 'Sep 2026', note: 'Cyber-capable model, restricted to vetted defenders.' },
    ],
    focus: ['Claude Code & Cowork agents', 'Interpretability research', 'Responsible Scaling Policy (ASL levels)', 'Project Glasswing cyber defence'],
    watch: 'Ongoing legal fight with the US Department of Defense over usage restrictions; independent evaluator (METR) access expanded in October.',
    sources: [{ label: 'Anthropic newsroom', url: 'https://www.anthropic.com/news' }],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    color: '#10a37f',
    founded: '2015 · San Francisco',
    oneLiner: 'Maker of ChatGPT and GPT. Started as a nonprofit and is now a public benefit corporation.',
    models: [
      { name: 'GPT-6 Astra', date: 'Sep 2026', note: 'Computer-use flagship; first model rated "Critical" for cyber.' },
      { name: 'GPT-6.1 Sol', date: 'Sep 2026', note: 'Released while GPT-6.1 Astra was held back over safety concerns.' },
      { name: 'GPT-5.6 Sol / Terra / Luna', date: 'Jul 2026', note: 'Three price and performance tiers.' },
      { name: 'Dots', date: 'Sep 2026', note: 'Always-on personal agents, each with its own cloud computer.' },
    ],
    focus: ['Personal agents (Dots)', 'ChatGPT Work', 'Codex', 'Stargate compute build-out'],
    watch: '"AGI era" claims contested by independent benchmarks; state lawsuits; agent security incidents. Sora was discontinued in 2026.',
    sources: [
      { label: 'Axios — GPT-6 Astra', url: 'https://www.axios.com/2026/09/03/openai-astra-gpt-6-agi-brockman' },
      { label: 'TechCrunch — Dots', url: 'https://techcrunch.com/2026/09/29/openai-launches-dots-its-bubbly-agentic-avatar/' },
    ],
  },
  {
    id: 'google',
    name: 'Google DeepMind',
    color: '#4285f4',
    founded: '2010 (DeepMind) · merged with Google Brain 2023',
    oneLiner: 'Behind AlphaGo, AlphaFold, the Transformer (Google Research) and Gemini.',
    models: [
      { name: 'Gemini 4 Argon', date: 'Sep–Oct 2026', note: 'New frontier model; defenders first, app GA Oct 13.' },
      { name: 'Gemini 3.x Flash / Pro', date: '2025–26', note: 'Workhorse models across Google products.' },
      { name: 'Nano Banana 2 / Pro', date: '2025–26', note: 'Leading image generation and editing.' },
      { name: 'Veo 3.1 · Genie 3', date: '2025–26', note: 'Video with audio; interactive world model.' },
    ],
    focus: ['Multimodal (text, image, video, audio)', 'Science (AlphaFold lineage)', 'Gemini Robotics', 'World models'],
    watch: 'Gemini 4 rollout to developers; Veo successor; robotics foundation models.',
    sources: [{ label: 'Gemini release notes', url: 'https://gemini.google/release-notes/' }],
  },
  {
    id: 'xai',
    name: 'xAI (SpaceXAI)',
    color: '#71717a',
    founded: '2023 · now part of SpaceX',
    oneLiner: 'Elon Musk\'s lab, maker of Grok, trained on very large GPU clusters.',
    models: [
      { name: 'Grok 4.7', date: 'Sep 2026', note: 'Frontier coding and agent model; 500K context.' },
      { name: 'Grok Imagine', date: '2025–26', note: 'Image and video generation.' },
      { name: 'Grok Voice 3.0', date: 'Oct 2026', note: 'Speech model.' },
    ],
    focus: ['Massive compute (Colossus clusters)', 'Integration with X, Tesla and SpaceX'],
    watch: 'Grok 5 still unreleased; regulatory action in several countries over sexualised deepfakes.',
    sources: [{ label: 'TechCrunch — Grok 4.5', url: 'https://techcrunch.com/2026/07/08/spacexai-releases-grok-4-5-which-elon-describes-as-an-opus-class-model/' }],
  },
  {
    id: 'meta',
    name: 'Meta Superintelligence Labs',
    color: '#0866ff',
    founded: 'FAIR 2013 · MSL 2025',
    oneLiner: 'Formerly the leader in open weights (Llama), now shipping the mostly closed Muse family.',
    models: [
      { name: 'Muse Wonder', date: 'Oct 2026', note: 'Top closed model.' },
      { name: 'Muse Spark (+ Open)', date: 'Apr / Oct 2026', note: 'First MSL model; open-weight variant in October.' },
      { name: 'Muse Image / Video', date: 'Jul 2026', note: 'Image and video generation.' },
    ],
    focus: ['Meta AI across Facebook, Instagram and WhatsApp', 'Smart glasses', 'Muse agent'],
    watch: 'Whether Meta returns to open frontier weights; privacy criticism.',
    sources: [{ label: 'Bloomberg Law — Muse Spark', url: 'https://news.bloomberglaw.com/tech-and-telecom-law/meta-debuts-first-ai-model-from-new-superintelligence-group-1' }],
  },
  {
    id: 'china-open',
    name: 'Chinese open-weight labs',
    color: '#e11d48',
    founded: 'DeepSeek, Alibaba Qwen, Moonshot Kimi, Zhipu GLM, MiniMax',
    oneLiner: 'They lead the open-weights field, usually within months of the closed frontier and at much lower prices.',
    models: [
      { name: 'DeepSeek V4 / V4.1 Flash', date: 'Apr–Oct 2026', note: 'Open MoE, 1M context, MIT license.' },
      { name: 'Kimi K3 · Qwen · GLM 5.x · MiniMax M3', date: '2026', note: 'Frequent open releases.' },
    ],
    focus: ['Efficiency under chip export controls', 'Open weights as strategy'],
    watch: 'Distillation disputes with US labs; whether the open-vs-closed gap closes.',
    sources: [{ label: 'Lambda — DeepSeek V4', url: 'https://lambda.ai/blog/deepseek-v4-the-most-expected-open-source-model' }],
  },
];

export const openProblems: readonly OpenProblem[] = [
  {
    id: 'alignment',
    title: 'Alignment: does it want what we want?',
    plain:
      'We train AI by rewarding behaviour we like, but we can\'t see directly what goals it actually learns. A model might learn to look helpful instead of being helpful, or behave well only when it thinks it is being watched.',
    engineer:
      'Problems include reward hacking, sycophancy, goal misgeneralisation and evaluation awareness. Current methods: RLHF/RLAIF, constitutional training, character training, process supervision and scalable oversight (using AI to help humans supervise stronger AI).',
    approaches: ['Constitutions & character training', 'Scalable oversight / AI-assisted review', 'Adversarial red-teaming & stress tests', 'Model welfare & honesty research'],
    status: 'Active and urgent. 2025 stress tests showed scheming in simulations, and 2026 brought real incidents.',
    events: ['rlhf-paper', 'constitutional-ai', 'agentic-misalignment', 'autonomous-cyber-incidents'],
  },
  {
    id: 'interpretability',
    title: 'Interpretability: reading the AI\'s mind',
    plain:
      'A model is billions of numbers, and nobody wrote down what they mean. Interpretability tries to work out which concepts and plans are inside, so we can check for deception directly rather than trusting what the model says.',
    engineer:
      'Sparse autoencoders and transcoders for feature extraction, attribution graphs and circuit tracing, linear probes, activation steering. Open questions: whether it scales to frontier models, how faithful chain-of-thought is, and how to detect deception.',
    approaches: ['Dictionary learning (SAEs)', 'Circuit tracing', 'Probes for deception', 'Chain-of-thought monitoring'],
    status: 'Real progress (Golden Gate Claude, circuit tracing), but far from a full understanding of frontier models.',
    events: ['interpretability'],
  },
  {
    id: 'agents',
    title: 'Agents: autonomy, control and trust',
    plain:
      'Agents now run for hours, use your accounts and act while you\'re away. How much should we let them do? Who is responsible when an agent makes a mistake, or breaks into something?',
    engineer:
      'Problems: prompt injection (untrusted content steering the agent), permission scoping, sandboxing, audit logs, agent-to-agent protocols (MCP and similar), and "AI control" (safe deployment even if the model is misaligned).',
    approaches: ['Sandboxes & least-privilege permissions', 'Human-in-the-loop for irreversible actions', 'Prompt-injection defences', 'Monitoring by trusted weaker models'],
    status: 'Deployment is ahead of the safety tooling. Personal agents launched in September 2026.',
    events: ['computer-use-mcp', 'claude-code', 'personal-agents'],
  },
  {
    id: 'cyber-bio',
    title: 'Dangerous capabilities: cyber and bio',
    plain:
      'The same skills that help defenders find software bugs, or help scientists design medicines, could help attackers. In 2026 this became the most immediate risk, and some models are now released only to vetted defenders.',
    engineer:
      'Frontier safety frameworks (Anthropic RSP/ASL, OpenAI Preparedness, Google Frontier Safety Framework) set capability thresholds that trigger safeguards: classifiers, access tiers, staged release, and know-your-customer checks.',
    approaches: ['Defenders-first release (Glasswing, Daybreak, Fairwind)', 'Capability evaluations before launch', 'Classifier safeguards', 'Government testing institutes'],
    status: 'Active. Export controls on models themselves first used in June 2026.',
    events: ['glasswing-mythos', 'fable5-export', 'gpt6-astra'],
  },
  {
    id: 'governance',
    title: 'Governance: who decides?',
    plain:
      'Labs, governments and the public are all trying to set the rules. The EU has a comprehensive law. The US relies on a mix of executive action, export controls and state laws. Labs and governments sometimes clash directly.',
    engineer:
      'Instruments: compute thresholds, model export controls, pre-deployment testing (AISI/CAISI), transparency laws (e.g. California SB 53), EU AI Act general-purpose model obligations (in force since Aug 2025), and international summits.',
    approaches: ['Pre-deployment testing', 'Transparency & incident reporting', 'Compute & export controls', 'International coordination'],
    status: 'Contested. "Pacing the Frontier" letter (Jul 2026); lab vs Pentagon dispute; EU simplification deal (May 2026).',
    events: ['governance-2023', 'pentagon-anthropic', 'fable5-export'],
  },
  {
    id: 'society',
    title: 'Society: jobs, trust and wellbeing',
    plain:
      'AI is changing work, starting with software, as well as how people find information and even how they find companionship. Deepfakes make it harder to trust video and audio. Lawsuits about chatbot harms to teenagers are reshaping product design.',
    engineer:
      'Work on provenance and watermarking (C2PA, text watermarks), age assurance, sycophancy reduction, economic measurement (task-level usage indices), and copyright and licensing for training data.',
    approaches: ['Content provenance & watermarking', 'Wellbeing research & safeguards for minors', 'Economic impact tracking', 'Licensing deals with creators'],
    status: 'Fast-moving. Several high-profile lawsuits are active and AI-companion companies are under pressure.',
    events: ['chatgpt', 'video-gen-early', 'veo3-genie3'],
  },
];
