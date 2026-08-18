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

// Diagnostic endpoint — tests Gemini generation
app.get('/test-gemini', async (req, res) => {
  try {
    const { geminiChat } = require('./services/gemini_client');
    const result = await geminiChat(
      [{ role: 'user', content: 'Say hello in one word.' }],
      { max_tokens: 500 }
    );
    res.json({ ok: true, reply: result.choices[0].message.content, key_set: !!process.env.GEMINI_API_KEY });
  } catch (e) {
    res.json({ ok: false, error: e.message, key_set: !!process.env.GEMINI_API_KEY });
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
