const express = require('express');
const router = express.Router();
const { generatePresentationContent } = require('../services/groq_service');
const { createPresentation } = require('../services/file_service');

router.post('/', async (req, res) => {
  try {
    const { topic, style = 'professional', slideCount = 8 } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic required' });

    const content = await generatePresentationContent(topic, style, slideCount);
    const buffer = await createPresentation(content, style);

    const filename = topic.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30) + '.pptx';
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
