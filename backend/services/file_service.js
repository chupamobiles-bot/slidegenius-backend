const PptxGenJS = require('pptxgenjs');
const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, BorderStyle, ShadingType } = require('docx');

// ── THEMES ──────────────────────────────────────────────────────────────────
const THEMES = {
  professional: {
    slideBg:     'F0F4FF',
    headerBg:    '1E3A8A',   // deep navy
    accent:      '3B82F6',   // blue
    accentDark:  '1D4ED8',
    titleText:   'FFFFFF',
    bodyText:    '1E293B',
    bulletBg:    'FFFFFF',
    bulletBorder:'BFDBFE',
    numBg:       '3B82F6',
    numText:     'FFFFFF',
    hlBg:        '1E3A8A',
    hlText:      'FFFFFF',
    sub:         '93C5FD',
    slideNum:    '94A3B8',
  },
  creative: {
    slideBg:     '12002A',
    headerBg:    '6D28D9',
    accent:      'EC4899',
    accentDark:  'BE185D',
    titleText:   'FFFFFF',
    bodyText:    'F3E8FF',
    bulletBg:    '1E0040',
    bulletBorder:'7C3AED',
    numBg:       'EC4899',
    numText:     'FFFFFF',
    hlBg:        '7C3AED',
    hlText:      'FFFFFF',
    sub:         'DDD6FE',
    slideNum:    'A78BFA',
  },
  minimal: {
    slideBg:     'FAFAFA',
    headerBg:    '18181B',
    accent:      '18181B',
    accentDark:  '000000',
    titleText:   'FFFFFF',
    bodyText:    '27272A',
    bulletBg:    'FFFFFF',
    bulletBorder:'D4D4D8',
    numBg:       '18181B',
    numText:     'FFFFFF',
    hlBg:        '27272A',
    hlText:      'FFFFFF',
    sub:         '71717A',
    slideNum:    'A1A1AA',
  },
  academic: {
    slideBg:     'F7FFF9',
    headerBg:    '14532D',
    accent:      '16A34A',
    accentDark:  '166534',
    titleText:   'FFFFFF',
    bodyText:    '14532D',
    bulletBg:    'FFFFFF',
    bulletBorder:'86EFAC',
    numBg:       '16A34A',
    numText:     'FFFFFF',
    hlBg:        '14532D',
    hlText:      'FFFFFF',
    sub:         '86EFAC',
    slideNum:    '4ADE80',
  },
};

// ── PRESENTATION ─────────────────────────────────────────────────────────────
async function createPresentation(content, style) {
  const t = THEMES[style] || THEMES.professional;
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';

  const slides = content.slides || [];
  const totalSlides = slides.length + 1;

  // ── TITLE SLIDE ──────────────────────────────────────────────────────────
  const ts = pres.addSlide();
  ts.background = { color: t.headerBg };

  // Top accent stripe
  ts.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: t.accent } });

  // Left bold bar
  ts.addShape(pres.ShapeType.rect, { x: 0, y: 0.1, w: 0.18, h: 7.4, fill: { color: t.accent } });

  // Large background text box
  ts.addShape(pres.ShapeType.rect, { x: 0.4, y: 0.8, w: 9.2, h: 4.6, fill: { color: t.headerBg }, line: { color: t.accent, width: 1.5 } });

  // Title
  ts.addText(content.title || 'Presentation', {
    x: 0.5, y: 1.1, w: 9, h: 3.0,
    fontSize: 42, bold: true, color: t.titleText,
    align: 'center', valign: 'middle', wrap: true, charSpacing: 0.5,
  });

  // Accent divider
  ts.addShape(pres.ShapeType.rect, { x: 2.5, y: 4.2, w: 5, h: 0.07, fill: { color: t.accent } });

  // Subtitle
  if (content.subtitle) {
    ts.addText(content.subtitle, {
      x: 0.5, y: 4.4, w: 9, h: 1.0,
      fontSize: 18, color: t.sub, align: 'center', wrap: true, italic: true,
    });
  }

  // Slide count
  ts.addText(`${totalSlides} slides`, {
    x: 8.5, y: 6.8, w: 1.2, h: 0.3,
    fontSize: 10, color: t.sub, align: 'right',
  });

  // Bottom accent
  ts.addShape(pres.ShapeType.rect, { x: 0, y: 7.4, w: '100%', h: 0.1, fill: { color: t.accent } });

  // ── CONTENT SLIDES ────────────────────────────────────────────────────────
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const s = pres.addSlide();
    s.background = { color: t.slideBg };

    // Header band
    s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 1.2, fill: { color: t.headerBg } });
    // Left accent in header
    s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.1, h: 1.2, fill: { color: t.accent } });

    // Slide title
    s.addText(slide.title || `Slide ${i + 2}`, {
      x: 0.25, y: 0.12, w: 8.8, h: 0.96,
      fontSize: 24, bold: true, color: t.titleText,
      valign: 'middle', wrap: true,
    });

    // Slide counter
    s.addText(`${i + 2} / ${totalSlides}`, {
      x: 8.5, y: 0.45, w: 1.2, h: 0.35,
      fontSize: 10, color: t.sub, align: 'right',
    });

    // ── BULLET CARDS ────────────────────────────────────────────────────────
    const bullets = (slide.bullets || []).filter(Boolean).slice(0, 3);
    const hasHighlight = !!(slide.highlight);
    const cardH = 0.92;
    const cardGap = 0.1;
    const startY = 1.35;

    bullets.forEach((bullet, idx) => {
      const y = startY + idx * (cardH + cardGap);

      // Card background
      s.addShape(pres.ShapeType.rect, {
        x: 0.3, y, w: 9.4, h: cardH,
        fill: { color: t.bulletBg },
        line: { color: t.bulletBorder, width: 1 },
      });

      // Number badge
      s.addShape(pres.ShapeType.rect, {
        x: 0.3, y, w: 0.42, h: cardH,
        fill: { color: t.numBg },
      });
      s.addText(`${idx + 1}`, {
        x: 0.3, y, w: 0.42, h: cardH,
        fontSize: 15, bold: true, color: t.numText,
        align: 'center', valign: 'middle',
      });

      // Bullet text
      s.addText(bullet, {
        x: 0.82, y: y + 0.08, w: 8.75, h: cardH - 0.16,
        fontSize: 14, color: t.bodyText,
        valign: 'middle', wrap: true,
      });
    });

    // ── HIGHLIGHT BOX ────────────────────────────────────────────────────────
    if (hasHighlight) {
      const hlY = startY + bullets.length * (cardH + cardGap) + 0.08;
      s.addShape(pres.ShapeType.rect, {
        x: 0.3, y: hlY, w: 9.4, h: 0.8,
        fill: { color: t.hlBg },
      });
      // Star icon area
      s.addShape(pres.ShapeType.rect, {
        x: 0.3, y: hlY, w: 0.42, h: 0.8,
        fill: { color: t.accent },
      });
      s.addText('★', {
        x: 0.3, y: hlY, w: 0.42, h: 0.8,
        fontSize: 14, color: 'FFFFFF', align: 'center', valign: 'middle',
      });
      s.addText(slide.highlight, {
        x: 0.82, y: hlY + 0.08, w: 8.75, h: 0.64,
        fontSize: 13, bold: true, color: t.hlText,
        valign: 'middle', wrap: true,
      });
    }

    // Bottom accent line
    s.addShape(pres.ShapeType.rect, { x: 0, y: 7.4, w: '100%', h: 0.1, fill: { color: t.accent } });

    if (slide.notes) s.addNotes(slide.notes);
  }

  return pres.write({ outputType: 'nodebuffer' });
}

// ── DOCUMENT ─────────────────────────────────────────────────────────────────
async function createDocument(content, docType) {
  const accentHex = '1E3A8A';

  const children = [
    // Title
    new Paragraph({
      children: [
        new TextRun({ text: content.title || 'Document', bold: true, size: 56, color: accentHex }),
      ],
      spacing: { after: 240 },
    }),
    // Subtitle line
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: accentHex } },
      spacing: { after: 480 },
    }),
  ];

  for (const section of (content.sections || [])) {
    // Section heading
    children.push(
      new Paragraph({
        children: [new TextRun({ text: section.heading || '', bold: true, size: 34, color: accentHex })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 160 },
      })
    );

    // Section content - handle both paragraph text and bullet points
    const text = section.content || '';
    // Split on double newlines for sub-paragraphs
    const paragraphs = text.split(/\n\n+/).filter(Boolean);
    for (const para of paragraphs) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: para.trim(), size: 24, color: '1E293B' })],
          spacing: { after: 200 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }

    // Separator
    children.push(
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' } },
        spacing: { after: 200 },
      })
    );
  }

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: { font: 'Calibri', size: 24 },
          paragraph: { spacing: { line: 360 } },
        },
      ],
    },
    sections: [{ properties: {}, children }],
  });

  return Packer.toBuffer(doc);
}

module.exports = { createPresentation, createDocument };
