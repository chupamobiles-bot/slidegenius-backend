const PptxGenJS = require('pptxgenjs');
const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, BorderStyle } = require('docx');

// ── THEMES ───────────────────────────────────────────────────────────────────
const THEMES = {
  professional: {
    dark: '0F2557',    headerBg: '1A3A8F',   accent: '4A90D9',
    accentAlt: '00C6FF', light: 'EEF4FF',    cardBg: 'FFFFFF',
    cardBorder: 'C5D8F5', bodyText: '1A2B4A', numBg: '1A3A8F',
    hlBg: '0F2557',   hlText: 'FFFFFF',      sub: 'A0BBDD',
    quoteText: 'FFFFFF', divBg: '1A3A8F',
  },
  creative: {
    dark: '0D0221',   headerBg: '5B21B6',   accent: 'F472B6',
    accentAlt: 'FB923C', light: 'F5F0FF',   cardBg: 'FFFFFF',
    cardBorder: 'DDD6FE', bodyText: '2E1065', numBg: '7C3AED',
    hlBg: '5B21B6',   hlText: 'FFFFFF',     sub: 'C4B5FD',
    quoteText: 'FFFFFF', divBg: '7C3AED',
  },
  minimal: {
    dark: '18181B',   headerBg: '27272A',   accent: '3B82F6',
    accentAlt: '10B981', light: 'F9FAFB',   cardBg: 'FFFFFF',
    cardBorder: 'D1D5DB', bodyText: '111827', numBg: '374151',
    hlBg: '111827',   hlText: 'FFFFFF',     sub: '9CA3AF',
    quoteText: 'FFFFFF', divBg: '374151',
  },
  academic: {
    dark: '052E16',   headerBg: '166534',   accent: '22C55E',
    accentAlt: 'FACC15', light: 'F0FDF4',   cardBg: 'FFFFFF',
    cardBorder: 'BBF7D0', bodyText: '052E16', numBg: '15803D',
    hlBg: '052E16',   hlText: 'FFFFFF',     sub: '86EFAC',
    quoteText: 'FFFFFF', divBg: '166534',
  },
};

const TRANSITIONS = ['fade', 'push', 'wipe', 'zoom', 'split', 'cover'];

// ── HELPERS ──────────────────────────────────────────────────────────────────
function randomTransition(i) {
  return { type: TRANSITIONS[i % TRANSITIONS.length], dur: 1200 };
}

// Draw circles decoration (for stat/quote slides)
function addCircleDeco(slide, t) {
  const positions = [
    { x: -0.3, y: -0.3, r: 1.2, op: 15 },
    { x: 8.8,  y: 5.8,  r: 1.8, op: 10 },
    { x: 8.2,  y: -0.5, r: 0.9, op: 12 },
    { x: -0.2, y: 5.5,  r: 1.0, op: 10 },
  ];
  positions.forEach(p => {
    slide.addShape(PptxGenJS.ShapeType ? PptxGenJS.ShapeType.ellipse : 'ellipse', {
      x: p.x, y: p.y, w: p.r, h: p.r,
      fill: { color: t.accent, transparency: 100 - p.op },
      line: { color: t.accent, width: 1.5, transparency: 100 - p.op * 2 },
    });
  });
}

// ── TITLE SLIDE ───────────────────────────────────────────────────────────────
function addTitleSlide(pres, content, t, totalSlides) {
  const s = pres.addSlide();
  s.background = { color: t.dark };
  s.transition = randomTransition(0);

  // Diagonal accent block (top-right)
  s.addShape('rect', {
    x: 6.0, y: 0, w: 10, h: 4.5, rotate: 15,
    fill: { color: t.headerBg }, line: { color: t.headerBg },
  });

  // Accent stripe top
  s.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.12, fill: { color: t.accent } });

  // Left bold column
  s.addShape('rect', { x: 0, y: 0.12, w: 0.5, h: 7.38, fill: { color: t.headerBg } });
  s.addShape('rect', { x: 0, y: 0.12, w: 0.08, h: 7.38, fill: { color: t.accent } });

  // Decorative circles
  s.addShape('ellipse', { x: 7.8, y: 0.2, w: 2.5, h: 2.5, fill: { color: t.accent, transparency: 88 }, line: { color: t.accent, width: 2, transparency: 70 } });
  s.addShape('ellipse', { x: 8.5, y: 4.0, w: 1.5, h: 1.5, fill: { color: t.accent, transparency: 90 }, line: { color: t.accent, width: 1, transparency: 75 } });
  s.addShape('ellipse', { x: 0.8, y: 5.5, w: 1.0, h: 1.0, fill: { color: t.accent, transparency: 92 }, line: { color: t.accent, width: 1, transparency: 80 } });

  // Title
  s.addText(content.title || 'Presentation', {
    x: 0.8, y: 0.9, w: 8.8, h: 3.2,
    fontSize: 44, bold: true, color: 'FFFFFF',
    align: 'left', valign: 'middle', wrap: true, charSpacing: 0.3,
  });

  // Accent divider
  s.addShape('rect', { x: 0.8, y: 4.25, w: 4.0, h: 0.08, fill: { color: t.accent } });
  s.addShape('rect', { x: 4.9, y: 4.25, w: 0.5, h: 0.08, fill: { color: t.accentAlt } });

  // Subtitle
  if (content.subtitle) {
    s.addText(content.subtitle, {
      x: 0.8, y: 4.45, w: 8.5, h: 1.0,
      fontSize: 18, color: t.sub, align: 'left', wrap: true, italic: true,
    });
  }

  // Slide count tag
  s.addShape('rect', { x: 0.8, y: 6.6, w: 1.6, h: 0.4, fill: { color: t.headerBg } });
  s.addText(`${totalSlides} SLIDES`, {
    x: 0.8, y: 6.6, w: 1.6, h: 0.4,
    fontSize: 10, bold: true, color: t.sub, align: 'center', valign: 'middle', charSpacing: 1.5,
  });

  // Bottom accent
  s.addShape('rect', { x: 0, y: 7.38, w: '100%', h: 0.12, fill: { color: t.accent } });
}

// ── CONTENT SLIDE ─────────────────────────────────────────────────────────────
function addContentSlide(pres, slide, t, slideNum, totalSlides) {
  const s = pres.addSlide();
  s.background = { color: t.light };
  s.transition = randomTransition(slideNum);

  // Header band
  s.addShape('rect', { x: 0, y: 0, w: '100%', h: 1.2, fill: { color: t.headerBg } });
  s.addShape('rect', { x: 0, y: 0, w: 0.1, h: 1.2, fill: { color: t.accent } });
  s.addShape('rect', { x: 0, y: 0, w: 0.5, h: 1.2, fill: { color: t.headerBg } });

  // Slide title
  s.addText(slide.title || '', {
    x: 0.3, y: 0.1, w: 8.9, h: 1.0,
    fontSize: 24, bold: true, color: 'FFFFFF', valign: 'middle', wrap: true,
  });

  // Slide counter
  s.addShape('rect', { x: 8.4, y: 0.38, w: 1.3, h: 0.44, fill: { color: t.dark } });
  s.addText(`${slideNum} / ${totalSlides}`, {
    x: 8.4, y: 0.38, w: 1.3, h: 0.44,
    fontSize: 10, bold: true, color: t.sub, align: 'center', valign: 'middle',
  });

  // Bullets
  const bullets = (slide.bullets || []).filter(Boolean).slice(0, 3);
  const cardH = 0.92;
  const gap = 0.1;
  const startY = 1.35;

  bullets.forEach((bullet, idx) => {
    const y = startY + idx * (cardH + gap);

    // Card shadow effect
    s.addShape('rect', { x: 0.38, y: y + 0.06, w: 9.4, h: cardH, fill: { color: 'D0D8EE', transparency: 50 } });
    // Card bg
    s.addShape('rect', {
      x: 0.3, y, w: 9.4, h: cardH,
      fill: { color: t.cardBg },
      line: { color: t.cardBorder, width: 1 },
    });
    // Number badge
    s.addShape('rect', { x: 0.3, y, w: 0.5, h: cardH, fill: { color: t.numBg } });
    s.addText(`${idx + 1}`, {
      x: 0.3, y, w: 0.5, h: cardH,
      fontSize: 16, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle',
    });
    // Accent top line on card
    s.addShape('rect', { x: 0.8, y, w: 8.9, h: 0.05, fill: { color: t.accent, transparency: 60 } });
    // Bullet text
    s.addText(bullet, {
      x: 0.88, y: y + 0.1, w: 8.65, h: cardH - 0.15,
      fontSize: 14, color: t.bodyText, valign: 'middle', wrap: true,
    });
  });

  // Highlight box
  if (slide.highlight) {
    const hlY = startY + bullets.length * (cardH + gap) + 0.1;
    s.addShape('rect', { x: 0.3, y: hlY, w: 9.4, h: 0.78, fill: { color: t.hlBg } });
    s.addShape('rect', { x: 0.3, y: hlY, w: 0.5, h: 0.78, fill: { color: t.accent } });
    s.addText('★', { x: 0.3, y: hlY, w: 0.5, h: 0.78, fontSize: 14, color: 'FFFFFF', align: 'center', valign: 'middle' });
    s.addText(slide.highlight, {
      x: 0.88, y: hlY + 0.08, w: 8.65, h: 0.62,
      fontSize: 13, bold: true, color: t.hlText, valign: 'middle', wrap: true,
    });
  }

  // Bottom accent
  s.addShape('rect', { x: 0, y: 7.38, w: '100%', h: 0.12, fill: { color: t.accent } });

  if (slide.notes) s.addNotes(slide.notes);
}

// ── STAT SLIDE ────────────────────────────────────────────────────────────────
function addStatSlide(pres, slide, t, slideNum, totalSlides) {
  const s = pres.addSlide();
  s.background = { color: t.dark };
  s.transition = randomTransition(slideNum);

  // Background circle decorations
  s.addShape('ellipse', { x: -1.0, y: -1.0, w: 4.5, h: 4.5, fill: { color: t.headerBg, transparency: 60 }, line: { color: t.accent, width: 2, transparency: 60 } });
  s.addShape('ellipse', { x: 7.5,  y: 4.0,  w: 3.5, h: 3.5, fill: { color: t.headerBg, transparency: 65 }, line: { color: t.accentAlt, width: 1.5, transparency: 60 } });
  s.addShape('ellipse', { x: 8.5,  y: 0.2,  w: 1.5, h: 1.5, fill: { color: t.accent, transparency: 80 }, line: { color: t.accent, width: 1, transparency: 70 } });

  // Top label
  s.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: t.accent } });
  s.addText((slide.title || 'By The Numbers').toUpperCase(), {
    x: 0.5, y: 0.3, w: 9, h: 0.6,
    fontSize: 13, bold: true, color: t.sub, align: 'center', charSpacing: 2.5,
  });

  // THE BIG NUMBER
  const numText = slide.number || '0';
  s.addText(numText, {
    x: 0.5, y: 1.1, w: 9, h: 3.5,
    fontSize: numText.length <= 5 ? 110 : 80, bold: true, color: t.accent,
    align: 'center', valign: 'middle',
  });

  // Accent line
  s.addShape('rect', { x: 2.5, y: 4.75, w: 5, h: 0.07, fill: { color: t.accent } });

  // Number label
  s.addText(slide.numberLabel || '', {
    x: 0.5, y: 4.9, w: 9, h: 1.1,
    fontSize: 20, color: 'FFFFFF', align: 'center', wrap: true, italic: true,
  });

  // Context line
  if (slide.context) {
    s.addText(slide.context, {
      x: 1.0, y: 6.1, w: 8, h: 0.7,
      fontSize: 13, color: t.sub, align: 'center', wrap: true,
    });
  }

  // Slide number
  s.addText(`${slideNum} / ${totalSlides}`, {
    x: 8.8, y: 6.9, w: 0.9, h: 0.3,
    fontSize: 10, color: t.sub, align: 'right',
  });

  s.addShape('rect', { x: 0, y: 7.38, w: '100%', h: 0.12, fill: { color: t.accent } });

  if (slide.notes) s.addNotes(slide.notes);
}

// ── QUOTE SLIDE ───────────────────────────────────────────────────────────────
function addQuoteSlide(pres, slide, t, slideNum, totalSlides) {
  const s = pres.addSlide();
  s.background = { color: t.headerBg };
  s.transition = randomTransition(slideNum);

  // Background shapes
  s.addShape('rect', { x: 0,   y: 0, w: '100%', h: '100%', fill: { color: t.dark } });
  s.addShape('rect', { x: 0,   y: 5.5, w: '100%', h: 2.0, fill: { color: t.headerBg, transparency: 40 } });
  s.addShape('rect', { x: 7.5, y: 0, w: 2.5, h: 7.5, fill: { color: t.headerBg, transparency: 60 } });

  // Diagonal accent
  s.addShape('rect', { x: -2, y: 5.5, w: 14, h: 0.6, rotate: -8, fill: { color: t.accent, transparency: 80 } });

  // Top accent
  s.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.12, fill: { color: t.accent } });

  // Giant quote mark
  s.addText('“', {
    x: 0.3, y: 0.1, w: 2.5, h: 2.2,
    fontSize: 160, bold: true, color: t.accent,
    align: 'left', valign: 'top', transparency: 30,
  });

  // Quote text
  s.addText(slide.quote || slide.title || '', {
    x: 0.6, y: 1.6, w: 8.5, h: 3.6,
    fontSize: 26, color: 'FFFFFF', align: 'left', valign: 'middle',
    wrap: true, italic: true, charSpacing: 0.2,
  });

  // Source attribution
  if (slide.source) {
    s.addShape('rect', { x: 0.6, y: 5.6, w: 1.2, h: 0.06, fill: { color: t.accent } });
    s.addText(`— ${slide.source}`, {
      x: 0.6, y: 5.78, w: 8, h: 0.5,
      fontSize: 13, color: t.sub, italic: true, align: 'left',
    });
  }

  // Slide counter
  s.addText(`${slideNum} / ${totalSlides}`, {
    x: 8.8, y: 6.9, w: 0.9, h: 0.3,
    fontSize: 10, color: t.sub, align: 'right',
  });

  s.addShape('rect', { x: 0, y: 7.38, w: '100%', h: 0.12, fill: { color: t.accent } });

  if (slide.notes) s.addNotes(slide.notes);
}

// ── DIVIDER SLIDE ─────────────────────────────────────────────────────────────
function addDividerSlide(pres, slide, t, slideNum, totalSlides) {
  const s = pres.addSlide();
  s.background = { color: t.accent };
  s.transition = randomTransition(slideNum);

  // Large background circles for depth
  s.addShape('ellipse', { x: -1.5, y: -1.5, w: 6.0, h: 6.0, fill: { color: 'FFFFFF', transparency: 93 }, line: { color: 'FFFFFF', width: 2, transparency: 85 } });
  s.addShape('ellipse', { x: 7.0,  y: 3.5,  w: 4.0, h: 4.0, fill: { color: 'FFFFFF', transparency: 95 }, line: { color: 'FFFFFF', width: 1.5, transparency: 88 } });
  s.addShape('ellipse', { x: 5.5,  y: -0.5, w: 2.0, h: 2.0, fill: { color: 'FFFFFF', transparency: 92 }, line: { color: 'FFFFFF', width: 1, transparency: 85 } });

  // Diagonal strip
  s.addShape('rect', { x: -2, y: 2.8, w: 16, h: 2.2, rotate: -3, fill: { color: t.dark, transparency: 75 } });

  s.addShape('rect', { x: 0, y: 0, w: '100%', h: 0.12, fill: { color: 'FFFFFF', transparency: 60 } });

  // Section number
  s.addText(`SECTION ${slideNum}`, {
    x: 0.5, y: 0.5, w: 9, h: 0.5,
    fontSize: 11, bold: true, color: 'FFFFFF', align: 'center', charSpacing: 3.5, transparency: 40,
  });

  // Main message
  s.addText(slide.message || slide.title || '', {
    x: 0.5, y: 2.0, w: 9, h: 2.5,
    fontSize: 40, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', wrap: true, charSpacing: 0.5,
  });

  // Accent line
  s.addShape('rect', { x: 3.0, y: 4.8, w: 4.0, h: 0.07, fill: { color: 'FFFFFF', transparency: 50 } });

  // Subtitle
  if (slide.subtitle) {
    s.addText(slide.subtitle, {
      x: 0.5, y: 5.0, w: 9, h: 0.9,
      fontSize: 18, color: 'FFFFFF', align: 'center', wrap: true, transparency: 25, italic: true,
    });
  }

  s.addText(`${slideNum} / ${totalSlides}`, {
    x: 8.8, y: 6.9, w: 0.9, h: 0.3,
    fontSize: 10, color: 'FFFFFF', align: 'right', transparency: 40,
  });

  s.addShape('rect', { x: 0, y: 7.38, w: '100%', h: 0.12, fill: { color: 'FFFFFF', transparency: 60 } });

  if (slide.notes) s.addNotes(slide.notes);
}

// ── MAIN ENTRY ────────────────────────────────────────────────────────────────
async function createPresentation(content, style) {
  const t = THEMES[style] || THEMES.professional;
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';

  const slides = content.slides || [];
  const totalSlides = slides.length + 1;

  addTitleSlide(pres, content, t, totalSlides);

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const slideNum = i + 2;
    const slideType = (slide.type || 'content').toLowerCase();

    switch (slideType) {
      case 'stat':
        addStatSlide(pres, slide, t, slideNum, totalSlides);
        break;
      case 'quote':
        addQuoteSlide(pres, slide, t, slideNum, totalSlides);
        break;
      case 'divider':
        addDividerSlide(pres, slide, t, slideNum, totalSlides);
        break;
      default:
        addContentSlide(pres, slide, t, slideNum, totalSlides);
    }
  }

  return pres.write({ outputType: 'nodebuffer' });
}

// ── DOCUMENT ──────────────────────────────────────────────────────────────────
async function createDocument(content, docType) {
  const accentHex = '1A3A8F';

  const children = [
    new Paragraph({
      children: [new TextRun({ text: content.title || 'Document', bold: true, size: 56, color: accentHex })],
      spacing: { after: 240 },
    }),
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: accentHex } },
      spacing: { after: 480 },
    }),
  ];

  for (const section of (content.sections || [])) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: section.heading || '', bold: true, size: 34, color: accentHex })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 160 },
      })
    );

    const paragraphs = (section.content || '').split(/\n\n+/).filter(Boolean);
    for (const para of paragraphs) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: para.trim(), size: 24, color: '1E293B' })],
          spacing: { after: 220 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }

    children.push(
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E2E8F0' } },
        spacing: { after: 200 },
      })
    );
  }

  const doc = new Document({
    styles: {
      paragraphStyles: [{
        id: 'Normal', name: 'Normal',
        run: { font: 'Calibri', size: 24 },
        paragraph: { spacing: { line: 360 } },
      }],
    },
    sections: [{ properties: {}, children }],
  });

  return Packer.toBuffer(doc);
}

module.exports = { createPresentation, createDocument };
