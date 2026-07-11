const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const STYLE_INSTRUCTIONS = {
  professional: 'Formal business tone. Structure: problem → solution → evidence → action.',
  creative: 'Vivid engaging language. Use storytelling, bold statements, and memorable hooks.',
  minimal: 'Ultra-concise. Every word must earn its place. Data-driven, no fluff.',
  academic: 'Scholarly tone. Include methodology, research findings, citations structure.',
};

async function generatePresentationContent(topic, style, slideCount) {
  const styleGuide = STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS.professional;

  const prompt = `Create a ${slideCount}-slide professional presentation about: "${topic}"

Style: ${style}. ${styleGuide}

Return ONLY valid JSON (no markdown, no code fences, no explanation):
{
  "title": "Compelling Presentation Title",
  "subtitle": "One powerful subtitle that hooks the audience",
  "slides": [
    {
      "title": "Clear Slide Title (5-8 words)",
      "bullets": [
        "Detailed informative point with specific facts and insights that fully explains this aspect of the topic",
        "Second substantial point covering a key dimension with concrete data, examples, or implications",
        "Third actionable point with a clear takeaway, next step, or real-world application"
      ],
      "highlight": "Key stat, quote, or powerful fact: e.g. '73% of companies see 3x ROI within 12 months'",
      "notes": "Full paragraph speaker notes with additional context and talking points for presenter"
    }
  ]
}

CRITICAL RULES:
- Each bullet MUST be 15-25 words — specific, informative, detailed (NOT vague 3-word headings)
- Include real statistics, percentages, timelines, named examples where appropriate
- highlight = one powerful stat or quote per slide (10-15 words)
- Slide 1 = compelling problem/hook with a surprising fact or provocative question
- Last slide = strong call-to-action with concrete next steps
- Make all content genuinely expert-level and specific to "${topic}"
- ${slideCount} slides total`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are a world-class presentation designer and subject matter expert. Return only valid JSON with no markdown.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.65,
    max_tokens: 3000,
  });

  const raw = response.choices[0].message.content.trim();
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function generateDocumentContent(topic, docType, length) {
  const lengthMap = { short: '400-600', medium: '700-1000', long: '1100-1600' };
  const words = lengthMap[length] || '700-1000';

  const prompt = `Write a professional, well-researched ${docType} about: "${topic}"

Target length: ${words} words. Use clear headings and well-developed paragraphs.

Return ONLY valid JSON (no markdown, no code fences):
{
  "title": "Professional Document Title",
  "sections": [
    {
      "heading": "Section Heading",
      "content": "Full detailed paragraph(s) — minimum 80 words per section. Include specific facts, examples, data, and analysis. Write like an industry expert."
    }
  ]
}

Rules:
- Minimum 4 sections
- Each section content must be 80-150 words (detailed paragraphs, not bullet points)
- Include executive summary as first section
- Make content genuinely insightful and specific to "${topic}"`;

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
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { generatePresentationContent, generateDocumentContent };
