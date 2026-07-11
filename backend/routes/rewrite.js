const express = require('express');
const router = express.Router();
const { generateDocumentContent } = require('../services/groq_service');
const { createDocument } = require('../services/file_service');

// POST /rewrite/document — regenerate document with a different tone
router.post('/document', async (req, res) => {
  try {
    const {
      topic,
      docType = 'report',
      length = 'medium',
      tone = 'professional',
      language = 'English',
    } = req.body;

    if (!topic) return res.status(400).json({ error: 'topic required' });

    const content = await generateDocumentContent(topic, docType, length, tone, language);
    const buffer = await createDocument(content, docType);

    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 25);
    const filename = `${slug}_${tone}.docx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    res.send(buffer);
  } catch (err) {
    console.error('Rewrite error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
