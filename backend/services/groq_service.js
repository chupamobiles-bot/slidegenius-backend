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

FORBIDDEN: vague bullets with no data (e.g. "AI is transforming healthcare", "companies are seeing improvements").
REQUIRED: every bullet must name a real company + specific metric + year + causal reason (e.g. "DeepMind's AlphaFold 3 mapped 200M proteins in 2024, cutting Moderna's R&D cycle from 4 years to 14 months").

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

Return ONLY valid JSON:
{"title":"...","subtitle":"...","slides":[
  {"type":"content","title":"...","body":"90-120 word expert paragraph","bullets":["45-60 word bullet with named org+metric+year","second bullet"],"highlight":"★ specific stat"},
  {"type":"stat","title":"...","number":"$X.XB","numberLabel":"...","context":"2-3 sentences with causal drivers"},
  {"type":"quote","title":"...","quote":"...","source":"Name, Title, Org, Year"},
  {"type":"divider","message":"Bold thesis statement","subtitle":"Setup sentence"}
]}${langNote}`;

  const resp = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are a McKinsey senior partner and world-class keynote speaker. You write presentations that get standing ovations. You NEVER write vague bullets. Every claim has a specific company name, metric, and year. Return ONLY valid JSON — no markdown, no code fences.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.72,
    max_tokens: 4000,
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
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: `You are a ${config.role}. Return only valid JSON with no markdown.` },
      { role: 'user', content: prompt },
    ],
    temperature: 0.55,
    max_tokens: 3000,
  });
  const raw = resp.choices[0].message.content.trim();
  return JSON.parse(raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/\s*```$/i,'').trim());
}

function _safeJsonParse(raw) {
  try { return JSON.parse(raw); } catch (_) {}
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) try { return JSON.parse(match[0]); } catch (_) {}
  throw new Error('Non-JSON response: ' + raw.substring(0, 150));
}

async function _groqJson(messages, maxTokens = 2000) {
  const resp = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages,
    temperature: 0.1,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
  });
  return _safeJsonParse(resp.choices[0].message.content.trim());
}

async function parseLinkedInProfile(profileText) {
  // LinkedIn layout: name/headline → about → experience → education → skills
  // Education is near the END — use first chunk for personal/experience, last chunk for education
  const topText  = profileText.substring(0, 7000);   // personal + experience
  const tailText = profileText.substring(Math.max(0, profileText.length - 4000)); // education + skills

  // ── Pass 1: full extraction from top of profile ───────────────────────────
  const result = await _groqJson([
    {
      role: 'system',
      content: 'You are a CV parser. Return only a valid JSON object with no markdown.',
    },
    {
      role: 'user',
      content: `Extract all CV data from this LinkedIn profile text.

Return a JSON object with these exact keys:
{
  "fullName": "...",
  "title": "current role or headline",
  "email": "",
  "phone": "",
  "location": "City, Country",
  "linkedin": "",
  "summary": "3-4 sentence professional summary",
  "experience": [{"company":"","role":"","startDate":"","endDate":"","description":""}],
  "education": [{"institution":"","degree":"","field":"","year":""}],
  "skills": []
}

LinkedIn text:
---
${topText}
---`,
    },
  ]);

  // ── Pass 2: targeted education from TAIL of profile (where it actually is) ─
  if (!result.education || result.education.length === 0) {
    try {
      const eduResult = await _groqJson([
        {
          role: 'system',
          content: 'Extract education history from text. Return JSON only.',
        },
        {
          role: 'user',
          content: `Find every school, university, college, or academic qualification in this text.
Look for: institution names, degree types (Bachelor, Master, MBA, BSc, MSc, PhD, Diploma, B.E., B.Tech, etc.), fields of study, and year ranges.

Return: {"education": [{"institution":"...","degree":"...","field":"...","year":"..."}]}
If nothing found return: {"education": []}

Text (bottom section of a LinkedIn profile — education appears here):
---
${tailText}
---`,
        },
      ], 1500);

      if (eduResult.education && eduResult.education.length > 0) {
        result.education = eduResult.education;
      }
    } catch (_) {
      // keep empty array
    }
  }

  // ── Pass 3: skills from tail if also missing ──────────────────────────────
  if (!result.skills || result.skills.length === 0) {
    try {
      const skillResult = await _groqJson([
        { role: 'system', content: 'Extract skills list from text. Return JSON only.' },
        {
          role: 'user',
          content: `Find all skills, technologies, tools, and competencies listed in this text.
Return: {"skills": ["skill1", "skill2", ...]}

Text:
---
${tailText}
---`,
        },
      ], 800);
      if (skillResult.skills && skillResult.skills.length > 0) {
        result.skills = skillResult.skills;
      }
    } catch (_) {}
  }

  return result;
}

module.exports = { generatePresentationContent, generateDocumentContent, parseLinkedInProfile };
