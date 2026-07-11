const express = require('express');
const router = express.Router();
const fs = require('fs');
const { generateDocumentContent } = require('../services/groq_service');
const { createDocument } = require('../services/officecli_service');

const DOC_TYPES = ['report', 'proposal', 'memo', 'article', 'letter', 'plan'];

router.post('/', async (req, res) => {
  const { topic, docType = 'report', length = 'medium' } = req.body;

  if (!topic || topic.trim().length < 3) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const type = DOC_TYPES.includes(docType) ? docType : 'report';

  try {
    console.log(`Generating ${type} document: "${topic}"`);

    const content = await generateDocumentContent(topic, type, length);
    const filePath = await createDocument(content, type);

    const filename = `${content.title.replace(/[^a-z0-9]/gi, '_').substring(0, 40)}.docx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('X-Doc-Title', encodeURIComponent(content.title));

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on('end', () => fs.unlink(filePath, () => {}));

  } catch (err) {
    console.error('Document generation error:', err.message);
    res.status(500).json({ error: 'Generation failed: ' + err.message });
  }
});

module.exports = router;
