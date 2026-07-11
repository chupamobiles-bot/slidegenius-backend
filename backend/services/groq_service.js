const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const STYLE_INSTRUCTIONS = {
  professional: 'Formal business tone. Structure: problem → evidence → solution → action.',
  creative: 'Vivid engaging language. Use storytelling, bold statements, memorable hooks.',
  minimal: 'Ultra-concise. Every word must earn its place. Data-driven, no fluff.',
  academic: 'Scholarly tone. Include methodology, research findings, data-backed insights.',
};

async function generatePresentationContent(topic, style, slideCount) {
  const styleGuide = STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS.professional;

  const prompt = `Create a ${slideCount}-slide professional presentation about: "${topic}"
Style: ${style}. ${styleGuide}

Use VARIED slide types to make it visually dynamic. Mix these types:
- "content": 3 detailed bullet points + 1 key stat
- "stat": ONE dramatic number/statistic as the hero
- "quote": powerful quote or bold insight statement
- "divider": bold section-break statement

Return ONLY valid JSON (no markdown, no code fences):
{
  "title": "Presentation Title",
  "subtitle": "One powerful subtitle",
  "slides": [
    {
      "type": "content",
      "title": "Slide Title (5-8 words)",
      "bullets": [
        "Detailed 15-25 word point with specific facts, data, and real-world context that informs the audience",
        "Second substantial point with concrete examples, statistics, or implications for this topic",
        "Third actionable point with a clear takeaway or recommendation the audience can use"
      ],
      "highlight": "Key stat: e.g. '68% of companies report 3x ROI within the first year'"
    },
    {
      "type": "stat",
      "title": "The Numbers Don't Lie",
      "number": "73%",
      "numberLabel": "of organizations that adopted this saw measurable results within 6 months",
      "context": "Additional sentence giving context or comparison to make the stat land harder"
    },
    {
      "type": "quote",
      "title": "Key Insight",
      "quote": "A powerful, specific, memorable statement or real quote relevant to ${topic}",
      "source": "Source, Author or Report Name, Year"
    },
    {
      "type": "divider",
      "message": "Bold section statement or chapter title",
      "subtitle": "Brief supporting phrase (5-8 words)"
    }
  ]
}

RULES:
- First slide must be "content" type — hook with a surprising opening stat
- Last slide must be "content" type — strong call-to-action with next steps
- Use at least one "stat" slide and one "quote" slide for variety
- Content bullets: 15-25 words each, specific and informative
- Stats: use real-looking data with percentages, millions/billions, years
- Make it genuinely expert-level about "${topic}"
- Total: ${slideCount} slides`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are a world-class presentation designer. Return ONLY valid JSON, absolutely no markdown or code fences.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.65,
    max_tokens: 4000,
  });

  const raw = response.choices[0].message.content.trim();
  const cleaned = raw
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function generateDocumentContent(topic, docType, length) {
  const lengthMap = { short: '400-600', medium: '700-1000', long: '1100-1600' };
  const words = lengthMap[length] || '700-1000';

  const prompt = `Write a professional, well-researched ${docType} about: "${topic}"
Target: ${words} words. Use clear headings and detailed paragraphs.

Return ONLY valid JSON (no markdown, no code fences):
{
  "title": "Professional Document Title",
  "sections": [
    {
      "heading": "Section Heading",
      "content": "Full detailed paragraph — minimum 100 words. Include specific facts, examples, data, expert analysis. Write like an industry expert publishing a report."
    }
  ]
}

Rules:
- Minimum 4 sections (start with Executive Summary)
- Each section: 100-200 words of detailed prose
- Include real-sounding statistics and specific examples
- Genuinely insightful and expert-level content about "${topic}"`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are a professional business writer and industry expert. Return only valid JSON.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 4000,
  });

  const raw = response.choices[0].message.content.trim();
  const cleaned = raw
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { generatePresentationContent, generateDocumentContent };
