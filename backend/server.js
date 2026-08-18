const express = require('express');
const cors = require('cors');

const presentationRouter = require('./routes/presentation');
const documentRouter = require('./routes/document');
const cvRouter = require('./routes/cv');
const rewriteRouter = require('./routes/rewrite');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'SlideGenius API', version: '1.2.0' });
});

// Diagnostic endpoint — lists available models for this key
app.get('/test-gemini', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await r.json();
    const names = (data.models || []).map(m => m.name);
    res.json({ ok: r.ok, status: r.status, key_set: !!apiKey, models: names, raw_error: data.error });
  } catch (e) {
    res.json({ ok: false, error: e.message, key_set: !!apiKey });
  }
});

app.use('/generate/presentation', presentationRouter);
app.use('/generate/document', documentRouter);
app.use('/enhance/cv', cvRouter);
app.use('/rewrite', rewriteRouter);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`SlideGenius API running on port ${PORT}`);
  });
}

module.exports = app;
