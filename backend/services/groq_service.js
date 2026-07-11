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

async function generatePresentationContent(topic, style, slideCount) {
  const styleGuide = STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS.professional;

  const prompt = `You are a world-class management consultant creating a high-stakes presentation about: "${topic}"
Style: ${styleGuide}

CRITICAL REQUIREMENT: Each slide must contain SUBSTANTIAL, DETAILED content that a professional can actually present. Not vague summaries — real data, real insights, real depth.

EXAMPLE OF BAD bullet (too short — NEVER do this):
"Increased player engagement by 25%"

EXAMPLE OF GOOD bullet (detailed, informative — ALWAYS write like this):
"Cloud gaming platforms have increased average session length by 25% compared to traditional models, driven by zero-friction access to premium titles, cross-device save synchronization, and AI-powered personalized game recommendations that surface relevant content within seconds of login."

Create ${slideCount} slides using these VARIED types:
- "content": Title + 2-sentence body paragraph + 2 detailed bullets + key stat
- "stat": ONE dramatic number as the hero with full context
- "quote": Powerful statement or insight displayed dramatically
- "divider": Bold section-break statement

Return ONLY valid JSON (absolutely no markdown, no code fences):
{
  "title": "Compelling Presentation Title",
  "subtitle": "One powerful subtitle that hooks the audience immediately",
  "slides": [
    {
      "type": "content",
      "title": "Clear Slide Title (5-8 words)",
      "body": "A detailed 2-3 sentence paragraph providing essential context, background, and framing for this section. Include specific figures, named examples, timeframes, or market conditions. This should be the kind of paragraph a consultant would write in a report — informative, authoritative, and evidence-based.",
      "bullets": [
        "First key insight written as a complete thought with specific data, a named example or case study, and a clear implication for the audience — minimum 30 words, maximum 45 words, no vague generalities",
        "Second critical point with concrete evidence: include a percentage, dollar figure, timeframe, or named organization. Explain the WHY behind the data, not just the number itself. Make it actionable."
      ],
      "highlight": "Precise key stat with context: e.g. 'Market projected to reach $847B by 2027, growing at 18.3% CAGR — outpacing all adjacent sectors'"
    },
    {
      "type": "stat",
      "title": "The Scale of Opportunity",
      "number": "$847B",
      "numberLabel": "projected global market value by 2027, up from $198B in 2022 — representing a 4.3x growth multiplier in just 5 years",
      "context": "This growth rate outpaces traditional software (8% CAGR), SaaS (16% CAGR), and hardware markets (6% CAGR) combined, making this one of the highest-conviction investment categories of the decade."
    },
    {
      "type": "quote",
      "title": "The Defining Insight",
      "quote": "A specific, powerful, and memorable statement or real quote that captures a profound truth about ${topic}. Should be thought-provoking enough that the audience will remember it after the presentation ends.",
      "source": "Full attribution: Author Name, Title, Organization, Year"
    },
    {
      "type": "divider",
      "message": "Bold section statement that creates anticipation",
      "subtitle": "Supporting context that sharpens the statement"
    }
  ]
}

ABSOLUTE RULES:
1. "body" field: minimum 50 words, 2-3 full sentences, specific and expert-level
2. Each "bullet": minimum 30 words, maximum 45 words — a complete professional thought
3. "highlight": include a real-sounding specific number with context (not just a number)
4. "stat" number: use realistic figures ($B, %, X times, years) with real-sounding precision
5. First slide: content type — open with a shocking fact or urgent problem
6. Last slide: content type — strong call-to-action with specific next steps
7. Use at least 1 stat slide, 1 quote slide, and 1 divider slide for variety
8. All content must be genuinely expert-level about "${topic}"
9. Total slides: exactly ${slideCount}`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a McKinsey senior partner creating board-level presentations. You write with precision, authority, and depth. Return ONLY valid JSON — no markdown, no code fences, no explanation.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 6000,
  });

  const raw = response.choices[0].message.content.trim();
  const cleaned = raw
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function generateDocumentContent(topic, docType, length) {
  const lengthMap = { short: '500-700', medium: '900-1200', long: '1400-1800' };
  const words = lengthMap[length] || '900-1200';

  const prompt = `Write a professional, deeply researched ${docType} about: "${topic}"
Target: ${words} words.

Return ONLY valid JSON (no markdown, no code fences):
{
  "title": "Professional Document Title",
  "sections": [
    {
      "heading": "Section Heading",
      "content": "Minimum 150 words of expert-level prose per section. Write like a senior consultant authoring a client deliverable. Include specific data points, named examples, industry context, causal explanations, and forward-looking analysis. Avoid generic statements — every sentence must add information value. Use active voice and precise language."
    }
  ]
}

Rules:
- Minimum 5 sections (Executive Summary → Background → Analysis → Implications → Recommendations)
- Each section: 150-250 words of detailed, expert prose
- Include realistic statistics, named companies/countries/technologies as examples
- Write at the level of a Harvard Business Review article about "${topic}"`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a senior research analyst at a top-tier consultancy. Return only valid JSON with no markdown.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.55,
    max_tokens: 6000,
  });

  const raw = response.choices[0].message.content.trim();
  const cleaned = raw
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { generatePresentationContent, generateDocumentContent };
