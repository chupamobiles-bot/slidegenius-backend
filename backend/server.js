const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const presentationRouter = require('./routes/presentation');
const documentRouter = require('./routes/document');
const cvRouter = require('./routes/cv');

const app = express();
const PORT = process.env.PORT || 3000;

const TEMP_DIR = path.join(__dirname, 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'SlideGenius API', version: '1.1.0' });
});

app.use('/generate/presentation', presentationRouter);
app.use('/generate/document', documentRouter);
app.use('/enhance/cv', cvRouter);

// Cleanup temp files older than 10 minutes
setInterval(() => {
  const now = Date.now();
  try {
    fs.readdirSync(TEMP_DIR).forEach(f => {
      const file = path.join(TEMP_DIR, f);
      const stat = fs.statSync(file);
      if (now - stat.mtimeMs > 10 * 60 * 1000) fs.unlinkSync(file);
    });
  } catch (_) {}
}, 5 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`SlideGenius API running on port ${PORT}`);
});
