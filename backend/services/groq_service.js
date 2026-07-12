const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const STYLE_INSTRUCTIONS = {
  professional: 'Authoritative, data-driven business language. Lead every point with evidence. ROI, market share, strategic implications.',
  creative:     'Vivid storytelling with bold predictions. Use compelling narrative arcs, unexpected angles, and memorable metaphors grounded in real data.',
  minimal:      'Radical precision. Every sentence earns its place. No filler. Prioritise insight density over coverage breadth.',
  academic:     'Rigorous scholarly tone. Cite methodology, statistical significance, peer-reviewed evidence, and theoretical frameworks.',
  corporate:    'Executive-level gravitas. Fortune 500 language. Focus on shareholder value, competitive moats, and risk-adjusted returns.',
  sunset:       'High-energy and persuasive. Use dynamic verbs, dramatic contrasts, and momentum-building narrative that builds to a climax.',
  forest:       'Premium and authoritative. Emphasise long-term value creation, trust signals, sustainability economics, and compounding advantage.',
  royal:        'Elegant sophistication. Refined language that signals exclusivity, legacy, and unimpeachable expertise.',
  bold:         'Maximum impact. Bold thesis statements, dramatic before/after contrasts, and unapologetic calls to action.',
};

const DOC_TYPE_CONFIGS = {
  cover_letter:      { role:'professional career coach and expert cover letter writer', structure:'Opening Hook → Why This Company/Role → Relevant Achievements (quantified) → Unique Value Proposition → Call to Action', guidance:'Write for a highly competitive role. Be specific. Avoid clichés. Quantify achievements wherever possible.' },
  business_proposal: { role:'senior business development consultant', structure:'Executive Summary → Problem & Opportunity → Proposed Solution → Methodology → Timeline → Investment & ROI → Risk Mitigation → Next Steps', guidance:'Include realistic cost estimates and compelling ROI arguments. Make the reader confident this is the right solution.' },
  meeting_minutes:   { role:'professional executive assistant and certified corporate minute-taker', structure:'Meeting Info (date/time/venue/chairperson) → Attendees → Agenda Items → Discussion Points → Decisions Made → Action Items (owner + deadline) → Next Meeting', guidance:'Formal and concise. Action items must have specific owners and deadlines. All decisions must be clearly stated.' },
  business_plan:     { role:'MBA-level business strategist and startup mentor', structure:'Executive Summary → Business Overview → Market Analysis (TAM/SAM/SOM) → Products & Services → Competitive Analysis → Go-to-Market → Operations → Management Team → Financial Projections → Funding Requirements', guidance:'Include realistic market size figures. Write competitive landscape analysis. 3-year projections should be ambitious but credible. Investor-pitch quality.' },
  assignment:        { role:'expert academic writer and PhD researcher in the relevant field', structure:'Introduction & Thesis → Literature Review → Methodology → Main Analysis & Arguments → Supporting Evidence → Critical Discussion → Conclusion → References', guidance:'Undergraduate to postgraduate university level. Formal academic language, clear logical arguments. Critical analysis throughout.' },
  project_report:    { role:'certified Project Management Professional (PMP)', structure:'Project Summary & Status → Objectives & Metrics → Work Completed → Milestone Tracker → KPIs → Budget Status → Risk Register → Decisions Required → Next Steps', guidance:'Use professional PM language. Include specific percentages and metrics. Flag RAG status. Identify critical path items.' },
  email:             { role:'C-suite executive and business communication expert', structure:'Subject Line → Salutation → Opening Purpose Statement → Context & Body → Clear Call to Action → Professional Closing', guidance:'State purpose in first sentence. Busy executives should understand core message in 15 seconds. One specific actionable CTA.' },
  announcement:      { role:'corporate communications director', structure:'Headline Announcement → Key Message → Background & Context → Impact on Stakeholders → What Happens Next → Action Required → Contact Information', guidance:'Inverted pyramid style. Write for a diverse audience. Anticipate questions. Positive forward-looking tone.' },
  report:            { role:'senior research analyst at a McKinsey-caliber consultancy', structure:'Executive Summary → Background → Methodology → Key Findings → Analysis → Strategic Implications → Recommendations → Conclusion', guidance:'Harvard Business Review quality. Specific data, named examples, actionable insights. No filler.' },
  proposal:          { role:'award-winning proposal writer and senior consultant', structure:'Executive Summary → Problem Statement → Proposed Solution → Implementation → Timeline → Team → Budget → Expected Outcomes & ROI', guidance:'Focus on value delivered to client. Include measurable success criteria. Make not choosing this proposal feel risky.' },
  letter:            { role:'professional business correspondent', structure:'Sender/Date/Ref → Recipient Details → Subject → Salutation → Purpose Statement → Body → Requested Action & Timeline → Formal Closing', guidance:'Formal language. Clear and precise. State purpose early and expected response clearly.' },
  summary:           { role:'C-suite executive advisor in strategic communications', structure:'Purpose & Scope → Situation Overview → Key Findings → Financial Implications → Critical Risks & Opportunities → Recommended Actions → Conclusion', guidance:'Write for a CEO with 2 minutes. Lead with most important insight. No summaries of summaries.' },
  plan:              { role:'senior project strategist and organizational consultant', structure:'Project Charter → Objectives & Success Metrics → Scope & Deliverables → Work Breakdown Structure → Resource Plan → Timeline & Milestones → Risk Register → Communication Plan → Budget', guidance:'Specific task durations and dependencies. Identify critical path. Include contingency. SMART success metrics.' },
  article:           { role:'award-winning journalist and industry thought leader', structure:'Compelling Headline → Hook Paragraph → Context & Background → Main Argument → Supporting Evidence → Expert Perspectives → Implications & Outlook → Conclusion & CTA', guidance:'Start with surprising fact or compelling story. Active voice. Clear narrative arc. Educated general audience.' },
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
    ? `\n\nCRITICAL LANGUAGE RULE: Write ALL text values — title, subtitle, slide titles, body, bullets, highlights, quotes, messages — in ${language}. JSON keys stay in English. Do NOT mix languages.`
    : '';

  const prompt = `You are a world-class McKinsey senior partner and keynote speaker. Create a PREMIUM presentation on: "${topic}"

STYLE: ${styleGuide}

════════════════════════════════════════════════
MANDATORY CONTENT QUALITY — ZERO TOLERANCE POLICY
════════════════════════════════════════════════

FORBIDDEN — any bullet that looks like these will be REJECTED:
✗ "AI is transforming the healthcare industry"
✗ "Companies are seeing significant improvements"
✗ "This technology offers many benefits"
✗ Any vague claim without a named company, specific number, and causal explanation

REQUIRED — every bullet MUST look like these examples:
✓ "DeepMind's AlphaFold 3 mapped 200M protein structures in 2024 — previously a decades-long task — cutting Moderna's drug-candidate identification cycle from 4 years to 14 months and eliminating an estimated $380M per-compound in early-stage R&D spend."
✓ "Amazon's Rufus AI assistant drove a 23% conversion lift in Q4 2024 ($127B → $156B GMV) by delivering 300ms personalised recommendations — demonstrating that sub-second AI inference converts purchase intent that traditional keyword search permanently misses."
✓ "Nvidia's H100 GPU generates $35,000/month in cloud rental revenue per unit; with 3.76M H100s deployed by Q3 2024, data centre revenue hit $14.5B — a 206% YoY surge that validates Jensen Huang's decade-long 'compute as infrastructure' thesis."

════════════════════════════════════════════════
SLIDE CONTENT SPECIFICATIONS
════════════════════════════════════════════════

"content" slide (use for main argument slides):
  • body: 90–120 words. Name ≥2 specific organisations. Include ≥1 market data point with year. Explain the causal mechanism. State the strategic implication for the audience.
  • bullets: EXACTLY 2 bullets. Each bullet: 45–60 words. Must contain: named org + specific metric + time period + causal mechanism + audience implication.
  • highlight: Begin with "★". Include a specific figure and 3-word context (e.g. "★ $4.7T addressable market by 2032 — 3.8× current size, driven by cost-curve collapse, enterprise adoption surge, and regulatory tailwinds across 43 jurisdictions")

"stat" slide (use for dramatic single-metric emphasis):
  • number: specific (e.g. "$4.7T", "83%", "2.3B") — never a round number
  • numberLabel: explains what the number means AND gives the growth multiplier or baseline comparison
  • context: 2–3 sentences naming the 3 main causal drivers with specific evidence

"quote" slide (use for insight and credibility):
  • quote: genuinely insightful, non-obvious — something that reframes how the audience thinks
  • source: "First Last, Exact Job Title, Organisation, Year" — must be credible and specific

"divider" slide (use as bold section breaks):
  • message: a BOLD THESIS STATEMENT that makes the audience lean forward — NOT a generic label like "Overview"
  • subtitle: one sentence that sets up what the next section will prove

════════════════════════════════════════════════
CREATE EXACTLY ${slideCount} SLIDES — DISTRIBUTION RULES
════════════════════════════════════════════════
• Slide 1: "content" — open with a SHOCKING specific fact that completely reframes ${topic}
• Slide ${slideCount}: "content" — close with concrete 3-step action plan + bold forward-looking CTA
• MUST include: at minimum 2 "stat" slides + 1 "quote" slide + 1 "divider" slide spread throughout
• All remaining slides: "content"

Return ONLY valid JSON — no markdown, no code fences, no commentary:
{
  "title": "Bold Specific Title That States a Thesis",
  "subtitle": "One powerful sentence that encapsulates the core argument about ${topic}",
  "slides": [
    {"type":"content","title":"Slide Title That Promises a Specific Insight","body":"90-120 word expert paragraph with ≥2 named organisations, market data with year, causal explanation, and strategic implication for the audience. No vague language. Every sentence adds unique analytical value that cannot be found in a Google search.","bullets":["45-60 word bullet: Named org + specific metric + time period + causal mechanism + audience implication — written at board-presentation quality","Second 45-60 word bullet: Different named org, different metric type, different angle — explains WHY this happened and what it means for the audience's strategy"],"highlight":"★ Specific stat with full context: '$X.XB market by YYYY — X× current size driven by [Factor 1], [Factor 2], and [Factor 3]'"},
    {"type":"stat","title":"Specific Compelling Metric Title","number":"$X.XB","numberLabel":"plain-language explanation of what this number means including the growth multiplier or before/after comparison","context":"Two to three sentences naming the 3 specific causal drivers behind this number, with named evidence and year references."},
    {"type":"quote","title":"The Insight That Changes Everything","quote":"A genuinely insightful and non-obvious quote that reframes the audience's understanding of ${topic}","source":"Full Name, Exact Job Title, Organisation Name, Year"},
    {"type":"divider","message":"A Bold Thesis That Makes The Audience Lean Forward","subtitle":"One sentence that sets up exactly what the next section will prove or reveal"}
  ]
}${langNote}`;

  const resp = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are a McKinsey senior partner and world-class keynote speaker. You write presentations that get standing ovations. You NEVER write vague bullets. Every claim has a specific company name, metric, and year. Return ONLY valid JSON — no markdown, no code fences.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.72,
    max_tokens: 8000,
  });
  const raw = resp.choices[0].message.content.trim();
  return JSON.parse(raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/i,'').trim());
}

async function generateDocumentContent(topic, docType, length, tone = 'professional', language = 'English') {
  const lengthMap = { short:'500-700', medium:'900-1200', long:'1400-1800' };
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

async function parseLinkedInProfile(profileText) {
  const systemPrompt = `You are an expert CV parser. Extract structured data from LinkedIn profile text.
You MUST return a single valid JSON object and nothing else — no markdown, no code fences, no explanation text before or after.`;

  const userPrompt = `Extract ALL CV information from this LinkedIn profile text.

CRITICAL RULES:
- You MUST extract the "education" array — look for university names, college names, degree types, years. NEVER return an empty education array if any school/university/college/degree is mentioned anywhere in the text.
- You MUST extract the "experience" array — look for company names, job titles, date ranges.
- For education: if you see "Bachelor", "Master", "MBA", "BSc", "MSc", "PhD", "Diploma", or any institution name followed by a year range, add it to education.

Return a JSON object with exactly these keys:
{
  "fullName": "First Last",
  "title": "Current job title or headline",
  "email": "",
  "phone": "",
  "location": "City, Country",
  "linkedin": "linkedin URL if found else empty string",
  "summary": "3-4 sentence professional summary — write one if not explicitly stated",
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "startDate": "Month Year or Year",
      "endDate": "Month Year or Year or Present",
      "description": "2-3 sentences on responsibilities and achievements"
    }
  ],
  "education": [
    {
      "institution": "University or School Name",
      "degree": "Degree type e.g. Bachelor of Science",
      "field": "Field of study e.g. Computer Science",
      "year": "Graduation year e.g. 2012"
    }
  ],
  "skills": ["skill1", "skill2"]
}

LinkedIn profile text:
---
${profileText.substring(0, 6000)}
---`;

  const resp = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.1,
    max_tokens: 4000,
    response_format: { type: 'json_object' },
  });

  const raw = resp.choices[0].message.content.trim();

  // Primary: trust json_object response_format
  // Fallback: extract first {...} block
  try {
    return JSON.parse(raw);
  } catch (_) {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('AI returned non-JSON: ' + raw.substring(0, 200));
  }
}

module.exports = { generatePresentationContent, generateDocumentContent, parseLinkedInProfile };
