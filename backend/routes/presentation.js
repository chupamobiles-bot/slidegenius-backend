const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { generatePresentationContent } = require('../services/groq_service');
const { createPresentation } = require('../services/officecli_service');

router.post('/', async (req, res) => {
  const { topic, style = 'professional', slideCount = 8 } = req.body;

  if (!topic || topic.trim().length < 3) {
    return res.status(400).json({ error: 'Topic is required (min 3 characters)' });
  }

  const count = Math.min(Math.max(parseInt(slideCount) || 8, 3), 20);

  try {
    console.log(`Generating ${count}-slide ${style} presentation: "${topic}"`);

    // Step 1: Generate content with Groq
    const content = await generatePresentationContent(topic, style, count);
    console.log(`Content generated: ${content.slides.length} slides`);

    // Step 2: Create PPTX with OfficeCLI
    const filePath = await createPresentation(content, style);
    console.log(`PPTX created: ${filePath}`);

    // Step 3: Send file
    const filename = `${content.title.replace(/[^a-z0-9]/gi, '_').substring(0, 40)}.pptx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Slide-Title', encodeURIComponent(content.title));
    res.setHeader('X-Slide-Count', content.slides.length);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on('end', () => {
      fs.unlink(filePath, () => {});
    });

  } catch (err) {
    console.error('Presentation generation error:', err.message);
    if (err.message?.includes('JSON')) {
      return res.status(500).json({ error: 'AI returned invalid content. Please try again.' });
    }
    res.status(500).json({ error: 'Generation failed: ' + err.message });
  }
});

module.exports = router;
