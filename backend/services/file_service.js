const PptxGenJS = require('pptxgenjs');
const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, BorderStyle } = require('docx');

const THEMES = {
  professional: { bg: '1A1A2E', title: 'FFFFFF', text: 'C8D0E0', accent: '4F8EF7', sub: 'A0AABB' },
  creative:     { bg: '2D1B69', title: 'FFFFFF', text: 'E8D5FF', accent: 'FF6B6B', sub: 'C9AAFF' },
  minimal:      { bg: 'FFFFFF', title: '1A1A2E', text: '444444', accent: '0066CC', sub: '888888' },
  academic:     { bg: '0F2044', title: 'FFFFFF', text: 'CCDDFF', accent: 'FFD700', sub: 'AABBDD' },
};

async function createPresentation(content, style) {
  const theme = THEMES[style] || THEMES.professional;
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';

  // Title slide
  const t = pres.addSlide();
  t.background = { color: theme.bg };
  t.addShape(pres.ShapeType.rect, { x: 0, y: 3.5, w: '100%', h: 0.06, fill: { color: theme.accent } });
  t.addText(content.title || 'Presentation', {
    x: 0.6, y: 1.2, w: 8.8, h: 1.6,
    fontSize: 38, bold: true, color: theme.title, align: 'center', wrap: true,
  });
  if (content.subtitle) {
    t.addText(content.subtitle, {
      x: 0.6, y: 3.0, w: 8.8, h: 0.7,
      fontSize: 20, color: theme.accent, align: 'center',
    });
  }

  // Content slides
  for (const slide of (content.slides || [])) {
    const s = pres.addSlide();
    s.background = { color: theme.bg };

    // Title bar
    s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.1, fill: { color: theme.bg } });
    s.addText(slide.title || '', {
      x: 0.5, y: 0.15, w: 9, h: 0.8,
      fontSize: 26, bold: true, color: theme.title,
    });
    // Accent line under title
    s.addShape(pres.ShapeType.rect, { x: 0.5, y: 1.1, w: 9, h: 0.05, fill: { color: theme.accent } });

    // Bullets
    const bullets = (slide.bullets || []).filter(Boolean);
    if (bullets.length > 0) {
      const rows = bullets.map(b => ({
        text: `• ${b}`,
        options: { color: theme.text, fontSize: 17, breakLine: true, paraSpaceAfter: 6 },
      }));
      s.addText(rows, { x: 0.5, y: 1.3, w: 9, h: 4.5, valign: 'top', wrap: true });
    }

    // Slide number
    s.addText(`${(content.slides.indexOf(slide) + 2)}`, {
      x: 9.2, y: 6.8, w: 0.5, h: 0.3, fontSize: 10, color: theme.sub, align: 'right',
    });

    if (slide.notes) s.addNotes(slide.notes);
  }

  // Return buffer
  return pres.write({ outputType: 'nodebuffer' });
}

async function createDocument(content, docType) {
  const accentColor = '1565C0';

  const children = [
    new Paragraph({
      children: [new TextRun({ text: content.title || 'Document', bold: true, size: 52, color: accentColor })],
      spacing: { after: 400 },
    }),
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: accentColor } },
      spacing: { after: 400 },
    }),
  ];

  for (const section of (content.sections || [])) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: section.heading || '', bold: true, size: 32, color: accentColor })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 320, after: 160 },
      }),
      new Paragraph({
        children: [new TextRun({ text: section.content || '', size: 24, color: '222222' })],
        spacing: { after: 240 },
        alignment: AlignmentType.JUSTIFIED,
      })
    );
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children,
    }],
  });

  return Packer.toBuffer(doc);
}

module.exports = { createPresentation, createDocument };
