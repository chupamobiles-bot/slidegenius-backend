const express = require('express');
const cors = require('cors');

const presentationRouter = require('./routes/presentation');
const documentRouter = require('./routes/document');
const cvRouter = require('./routes/cv');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'SlideGenius API', version: '1.2.0' });
});

app.use('/generate/presentation', presentationRouter);
app.use('/generate/document', documentRouter);
app.use('/enhance/cv', cvRouter);

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`SlideGenius API running on port ${PORT}`);
  });
}

module.exports = app;
