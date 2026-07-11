const express = require('express');
const router = express.Router();
const { generateDocumentContent } = require('../services/groq_service');
const { createDocument } = require('../services/file_service');

router.post('/', async (req, res) => {
  try {
    const { topic, docType = 'report', length = 'medium' } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic required' });

    const content = await generateDocumentContent(topic, docType, length);
    const buffer = await createDocument(content, docType);

    const filename = topic.toLowerCase().replace(/[^a-z0-9]+/g, '_').substring(0, 30) + '.docx';
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
