const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const STYLE_INSTRUCTIONS = {
  professional: 'Formal business language. Focus on ROI, strategy, market data, and executive-level insights.',
  creative:     'Vivid engaging language. Use compelling storytelling, bold predictions, and memorable hooks.',
  minimal:      'Precise, evidence-based. Every sentence must carry weight. No filler, only insights.',
  academic:     'Scholarly tone. Cite methodology, research findings, statistics, and peer-reviewed concepts.',
  corporate:    'Formal business language. Focus on ROI, strategy, market data, and executive-level insights.',
  sunset:       'Energetic and persuasive. Use dynamic language that inspires action and excitement.',
  forest:       'Premium and authoritative. Emphasize sustainability, long-term value, and trusted expertise.',
  royal:        'Elegant and sophisticated. Use refined language that conveys exclusivity and excellence.',
  bold:         'High-impact language. Use bold statements, dramatic contrasts, and powerful calls to action.',
};

const DOC_TYPE_CONFIGS = {
  cover_letter: {
    role: 'professional career coach and expert cover letter writer',
    structure: 'Opening Hook → Why This Company/Role → Relevant Achievements (quantified) → Unique Value Proposition → Call to Action',
    guidance: 'Write for a highly competitive role. Be specific. Avoid cliches. Quantify achievements wherever possible.',
  },
  business_proposal: {
    role: 'senior business development consultant',
    structure: 'Executive Summary → Problem & Opportunity → Proposed Solution → Methodology → Timeline → Investment & ROI → Risk Mitigation → Next Steps',
    guidance: 'Include realistic cost estimates and compelling ROI arguments. Make the reader confident this is the right solution.',
  },
  meeting_minutes: {
    role: 'professional executive assistant and certified corporate minute-taker',
    structure: 'Meeting Info (date/time/venue/chairperson) → Attendees → Agenda Items → Discussion Points → Decisions Made → Action Items (owner + deadline) → Next Meeting',
    guidance: 'Formal and concise. Action items must have specific owners and deadlines. All decisions must be clearly stated.',
  },
  business_plan: {
    role: 'MBA-level business strategist and startup mentor',
    structure: 'Executive Summary → Business Overview → Market Analysis (TAM/SAM/SOM) → Products & Services → Competitive Analysis → Go-to-Market → Operations → Management Team → Financial Projections → Funding Requirements',
    guidance: 'Include realistic market size figures. Write competitive landscape analysis. 3-year projections should be ambitious but credible. Investor-pitch quality.',
  },
  assignment: {
    role: 'expert academic writer and PhD researcher in the relevant field',
    structure: 'Introduction & Thesis → Literature Review → Methodology → Main Analysis & Arguments → Supporting Evidence → Critical Discussion → Conclusion → References',
    guidance: 'Undergraduate to postgraduate university level. Formal academic language, clear logical arguments. Critical analysis throughout.',
  },
  project_report: {
    role: 'certified Project Management Professional (PMP)',
    structure: 'Project Summary & Status → Objectives & Metrics → Work Completed → Milestone Tracker → KPIs → Budget Status → Risk Register → Decisions Required → Next Steps',
    guidance: 'Use professional PM language. Include specific percentages and metrics. Flag RAG status. Identify critical path items.',
  },
  email: {
    role: 'C-suite executive and business communication expert',
    structure: 'Subject Line → Salutation → Opening Purpose Statement → Context & Body → Clear Call to Action → Professional Closing',
    guidance: 'State purpose in first sentence. Busy executives should understand core message in 15 seconds. One specific actionable CTA.',
  },
  announcement: {
    role: 'corporate communications director',
    structure: 'Headline Announcement → Key Message → Background & Context → Impact on Stakeholders → What Happens Next → Action Required → Contact Information',
    guidance: 'Inverted pyramid style. Write for a diverse audience. Anticipate questions. Positive forward-looking tone.',
  },
  report: {
    role: 'senior research analyst at a McKinsey-caliber consultancy',
    structure: 'Executive Summary → Background → Methodology → Key Findings → Analysis → Strategic Implications → Recommendations → Conclusion',
    guidance: 'Harvard Business Review quality. Specific data, named examples, actionable insights. No filler.',
  },
  proposal: {
    role: 'award-winning proposal writer and senior consultant',
    structure: 'Executive Summary → Problem Statement → Proposed Solution → Implementation → Timeline → Team → Budget → Expected Outcomes & ROI',
    guidance: 'Focus on value delivered to client. Include measurable success criteria. Make not choosing this proposal feel risky.',
  },
  letter: {
    role: 'professional business correspondent',
    structure: 'Sender/Date/Ref → Recipient Details → Subject → Salutation → Purpose Statement → Body → Requested Action & Timeline → Formal Closing',
    guidance: 'Formal language. Clear and precise. State purpose early and expected response clearly.',
  },
  summary: {
    role: 'C-suite executive advisor in strategic communications',
    structure: 'Purpose & Scope → Situation Overview → Key Findings → Financial Implications → Critical Risks & Opportunities → Recommended Actions → Conclusion',
    guidance: 'Write for a CEO with 2 minutes. Lead with most important insight. No summaries of summaries.',
  },
  plan: {
    role: 'senior project strategist and organizational consultant',
    structure: 'Project Charter → Objectives & Success Metrics → Scope & Deliverables → Work Breakdown Structure → Resource Plan → Timeline & Milestones → Risk Register → Communication Plan → Budget',
    guidance: 'Specific task durations and dependencies. Identify critical path. Include contingency. SMART success metrics.',
  },
  article: {
    role: 'award-winning journalist and industry thought leader',
    structure: 'Compelling Headline → Hook Paragraph → Context & Background → Main Argument → Supporting Evidence → Expert Perspectives → Implications & Outlook → Conclusion & CTA',
    guidance: 'Start with surprising fact or compelling story. Active voice. Clear narrative arc. Educated general audience.',
  },
};

const TONE_GUIDE = {
  professional: 'Formal, business-appropriate language. Authoritative, precise, and credible.',
  friendly:     'Warm, approachable while staying professional. Conversational but credible.',
  formal:       'Highly formal language for legal, government, or senior official contexts.',
  concise:      'Extremely concise. Every sentence must earn its place. Target 40% fewer words while preserving all key information.',
};

async function generatePresentationContent(topic, style, slideCount, language = 'English') {
  const styleGuide = STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS.professional;
  const langNote = language !== 'English'
    ? `\n\nCRITICAL: Write ALL text values in ${language}. JSON keys remain in English.`
    : '';

  const prompt = `You are a world-class management consultant creating a presentation about: "${topic}"
Style: ${styleGuide}

BAD bullet (never do this): "Increased engagement by 25%"
GOOD bullet (always write like this): "Cloud platforms increased session length by 25%, driven by zero-friction access, cross-device sync, and AI recommendations that surface content within seconds."

Create ${slideCount} slides using VARIED types:
- "content": body paragraph (50+ words) + 2 detailed bullets (30-45 words each) + key stat
- "stat": ONE dramatic number with context
- "quote": Powerful statement displayed dramatically
- "divider": Bold section-break

Return ONLY valid JSON:
{
  "title": "Compelling Title",
  "subtitle": "One powerful subtitle",
  "slides": [
    {"type":"content","title":"Slide Title","body":"2-3 sentence expert paragraph with specific figures and context.","bullets":["First insight with data, named example, and implication — 30-45 words","Second point with evidence: percentage, dollar figure, or named org. Explain the WHY."],"highlight":"Key stat with context: e.g. '$847B market by 2027 at 18.3% CAGR'"},
    {"type":"stat","title":"Scale of Opportunity","number":"$847B","numberLabel":"projected value by 2027 — a 4.3x growth multiplier","context":"Full context sentence explaining significance."},
    {"type":"quote","title":"Defining Insight","quote":"Powerful memorable statement about ${topic}.","source":"Author Name, Title, Organization, Year"},
    {"type":"divider","message":"Bold section statement","subtitle":"Supporting context"}
  ]
}

RULES: first slide=content (shocking fact), last slide=content (CTA), use ≥1 stat/quote/divider, exactly ${slideCount} slides, all bullets 30-45 words.${langNote}`;

  const resp = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are a McKinsey senior partner. Return ONLY valid JSON — no markdown, no code fences.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 6000,
  });
  const raw = resp.choices[0].message.content.trim();
  return JSON.parse(raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/i,'').trim());
}

async function generateDocumentContent(topic, docType, length, tone = 'professional', language = 'English') {
  const lengthMap = { short: '500-700', medium: '900-1200', long: '1400-1800' };
  const words = lengthMap[length] || '900-1200';
  const config = DOC_TYPE_CONFIGS[docType] || DOC_TYPE_CONFIGS.report;
  const toneGuide = TONE_GUIDE[tone] || TONE_GUIDE.professional;
  const langNote = language !== 'English'
    ? `\n\nCRITICAL: Write ALL content in ${language} — title, headings, and body text. JSON keys remain in English.`
    : '';

  const prompt = `You are a ${config.role}.

Write a professional ${docType.replace(/_/g,' ')} about: "${topic}"

Structure: ${config.structure}
Guidance: ${config.guidance}
Tone: ${toneGuide}
Length: ${words} words total${langNote}

Return ONLY valid JSON:
{
  "title": "Specific Professional Title",
  "sections": [{"heading":"Section Heading","content":"Minimum 150 words of expert prose. Include specific data, named examples, causal analysis. No generic statements."}]
}

RULES: Follow the exact structure. Each section ≥150 words. Total ≥${words.split('-')[0]} words. No platitudes. Write as a ${config.role} for a premium client.`;

  const resp = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: `You are a ${config.role}. Return only valid JSON with no markdown.` },
      { role: 'user', content: prompt },
    ],
    temperature: 0.55,
    max_tokens: 6000,
  });
  const raw = resp.choices[0].message.content.trim();
  return JSON.parse(raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/i,'').trim());
}

module.exports = { generatePresentationContent, generateDocumentContent };
