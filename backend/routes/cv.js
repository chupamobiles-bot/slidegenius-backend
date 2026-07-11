const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/', async (req, res) => {
  try {
    const { cv } = req.body;

    const prompt = `You are an expert CV/resume writer with 15+ years experience helping professionals land senior roles.

Enhance this CV content to be highly professional, impactful, and ATS-optimized.
Rules:
- Keep all company names, job titles, dates, education institutions EXACTLY as provided
- Enhance the professional summary to be 3-4 powerful sentences highlighting key achievements
- Enhance job descriptions using strong action verbs (Led, Architected, Delivered, Scaled, etc.)
- Add quantified achievements where possible (e.g. "increased X by Y%") based on context
- Keep descriptions concise but impactful
- If summary is empty, write a compelling one based on their experience
- Skills: keep exactly as provided

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "summary": "enhanced summary text",
  "experience": [
    {
      "company": "same company name",
      "role": "same role title", 
      "startDate": "same date",
      "endDate": "same date",
      "description": "enhanced description with achievements"
    }
  ]
}

CV DATA:
Name: ${cv.fullName}
Title: ${cv.title}
Summary: ${cv.summary || 'not provided'}
Experience: ${JSON.stringify(cv.experience)}
Education: ${JSON.stringify(cv.education)}
Skills: ${JSON.stringify(cv.skills)}`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    let text = completion.choices[0].message.content;
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const enhanced = JSON.parse(text);
    res.json({ success: true, enhanced });
  } catch (err) {
    console.error('CV enhance error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
