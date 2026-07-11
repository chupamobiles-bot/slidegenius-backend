const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const STYLE_INSTRUCTIONS = {
  professional: 'Use formal business language. Structure: problem → solution → data → action.',
  creative: 'Use engaging vivid language. Include storytelling elements and bold statements.',
  minimal: 'Use concise impactful phrases. Maximum 3 bullet points per slide. Short sentences only.',
  academic: 'Use scholarly tone. Include methodology, findings, and citations structure.',
};

async function generatePresentationContent(topic, style, slideCount) {
  const styleGuide = STYLE_INSTRUCTIONS[style] || STYLE_INSTRUCTIONS.professional;

  const prompt = `Create a ${slideCount}-slide presentation about: "${topic}"

Style: ${style}. ${styleGuide}

Return ONLY valid JSON, no markdown, no explanation:
{
  "title": "Presentation Title",
  "subtitle": "One line subtitle",
  "slides": [
    {
      "title": "Slide Title",
      "bullets": ["Point one", "Point two", "Point three"],
      "notes": "Speaker note for this slide"
    }
  ]
}

Rules:
- First slide = title/intro slide
- Last slide = summary/call-to-action
- 2-4 bullets per slide maximum
- Each bullet max 10 words
- ${slideCount} slides total`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are a professional presentation designer. Return only valid JSON with no markdown formatting.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const raw = response.choices[0].message.content.trim();
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

async function generateDocumentContent(topic, docType, length) {
  const lengthMap = { short: '300-500', medium: '600-900', long: '1000-1500' };
  const words = lengthMap[length] || '600-900';

  const prompt = `Write a professional ${docType} about: "${topic}"
Length: ${words} words. Use clear headings.
Return ONLY valid JSON:
{
  "title": "Document Title",
  "sections": [
    { "heading": "Section Heading", "content": "Paragraph text here..." }
  ]
}`;

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: 'You are a professional business writer. Return only valid JSON.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.6,
    max_tokens: 3000,
  });

  const raw = response.choices[0].message.content.trim();
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

module.exports = { generatePresentationContent, generateDocumentContent };
