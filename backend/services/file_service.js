const PptxGenJS = require('pptxgenjs');
const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, BorderStyle } = require('docx');

// ══════════════════════════════════════════════════════════════════════════════
// 6 BEAUTIFUL TEMPLATE THEMES — each with a unique visual identity
// ══════════════════════════════════════════════════════════════════════════════
const THEMES = {

  // 1. CORPORATE NAVY — Professional with left sidebar accent
  corporate: {
    id: 'corporate',
    titleBg: '0D1B4B',   accent: '4A8FE7',  accentAlt: '00D4FF',
    headerBg: '1A3A8F',  slideBg: 'EEF5FF', cardBg: 'FFFFFF',
    cardBorder: 'BDD4F7', bodyText: '1A2B4A', numBg: '1A3A8F',
    hlBg: '0D1B4B', hlText: 'FFFFFF',        sub: '93C5FD',
    divBg: '1A3A8F', layout: 'sidebar',
  },

  // 2. SUNSET FIRE — Warm orange/coral, diagonal accents
  sunset: {
    id: 'sunset',
    titleBg: '7C1D06',   accent: 'F97316',  accentAlt: 'FCD34D',
    headerBg: 'C2410C',  slideBg: 'FFF7ED', cardBg: 'FFFFFF',
    cardBorder: 'FED7AA', bodyText: '431407', numBg: 'C2410C',
    hlBg: '7C1D06', hlText: 'FFFFFF',        sub: 'FED7AA',
    divBg: 'EA580C', layout: 'diagonal',
  },

  // 3. EMERALD ELITE — Deep green, gold accents, premium feel
  forest: {
    id: 'forest',
    titleBg: '052E16',   accent: '4ADE80',  accentAlt: 'FCD34D',
    headerBg: '14532D',  slideBg: 'F0FFF4', cardBg: 'FFFFFF',
    cardBorder: 'BBF7D0', bodyText: '052E16', numBg: '15803D',
    hlBg: '052E16', hlText: 'FFFFFF',        sub: '86EFAC',
    divBg: '166534', layout: 'rightpanel',
  },

  // 4. ROYAL GOLD — Deep purple with gold accents, luxury elegant
  royal: {
    id: 'royal',
    titleBg: '2E1065',   accent: 'D4AF37',  accentAlt: 'C084FC',
    headerBg: '4C1D95',  slideBg: 'FAF5FF', cardBg: 'FFFFFF',
    cardBorder: 'DDD6FE', bodyText: '2E1065', numBg: '6D28D9',
    hlBg: '2E1065', hlText: 'FFFFFF',        sub: 'DDD6FE',
    divBg: '5B21B6', layout: 'centered',
  },

  // 5. MINIMAL CLEAN — White/dark, ultra-clean Apple-style
  minimal: {
    id: 'minimal',
    titleBg: '18181B',   accent: '6366F1',  accentAlt: '10B981',
    headerBg: '27272A',  slideBg: 'FAFAFA', cardBg: 'FFFFFF',
    cardBorder: 'E4E4E7', bodyText: '18181B', numBg: '3F3F46',
    hlBg: '18181B', hlText: 'FFFFFF',        sub: 'A1A1AA',
    divBg: '3F3F46', layout: 'lines',
  },

  // 6. BOLD IMPACT — Deep crimson, high contrast, powerful
  bold: {
    id: 'bold',
    titleBg: '3F0808',   accent: 'F87171',  accentAlt: 'FCD34D',
    headerBg: '991B1B',  slideBg: 'FFF1F1', cardBg: 'FFFFFF',
    cardBorder: 'FECACA', bodyText: '450A0A', numBg: 'B91C1C',
    hlBg: '3F0808', hlText: 'FFFFFF',        sub: 'FCA5A5',
    divBg: 'DC2626', layout: 'bold',
  },
};

// Legacy mapping
THEMES.professional = THEMES.corporate;
THEMES.creative     = THEMES.royal;
THEMES.academic     = THEMES.forest;

const TRANS = ['fade', 'push', 'wipe', 'zoom', 'split', 'cover', 'uncover'];
const trans = (i) => ({ type: TRANS[i % TRANS.length], dur: 1100 });

// ── TITLE SLIDES — one per layout ────────────────────────────────────────────

function titleSidebar(pres, c, t, total) {
  const s = pres.addSlide(); s.background = { color: t.titleBg }; s.transition = trans(0);
  // Left bold panel
  s.addShape('rect', { x:0, y:0, w:3.2, h:7.5, fill:{color:t.headerBg} });
  s.addShape('rect', { x:0, y:0, w:0.12, h:7.5, fill:{color:t.accent} });
  // Circles on right
  s.addShape('ellipse', { x:7.5, y:5.0, w:3.5, h:3.5, fill:{color:t.headerBg,transparency:75}, line:{color:t.accent,width:1.5,transparency:65} });
  s.addShape('ellipse', { x:8.8, y:0.5, w:1.5, h:1.5, fill:{color:t.accent,transparency:82}, line:{color:t.accent,width:1,transparency:72} });
  // Title in right area
  s.addText(c.title||'Presentation', { x:3.5, y:1.2, w:6.0, h:3.5, fontSize:38, bold:true, color:'FFFFFF', align:'left', valign:'middle', wrap:true });
  // Accent line
  s.addShape('rect', { x:3.5, y:5.0, w:3.5, h:0.08, fill:{color:t.accent} });
  s.addShape('rect', { x:7.1, y:5.0, w:0.5, h:0.08, fill:{color:t.accentAlt} });
  if (c.subtitle) s.addText(c.subtitle, { x:3.5, y:5.2, w:6.0, h:1.0, fontSize:17, color:t.sub, italic:true, wrap:true });
  s.addText(`${total} SLIDES`, { x:3.5, y:6.7, w:2.0, h:0.4, fontSize:9, bold:true, color:t.sub, charSpacing:2 });
  s.addShape('rect', { x:0, y:7.38, w:'100%', h:0.12, fill:{color:t.accent} });
}

function titleDiagonal(pres, c, t, total) {
  const s = pres.addSlide(); s.background = { color:t.titleBg }; s.transition = trans(0);
  // Diagonal slash across slide
  s.addShape('rect', { x:-1, y:-1, w:8, h:10, rotate:15, fill:{color:t.headerBg}, line:{color:t.headerBg} });
  s.addShape('rect', { x:-1, y:-1, w:0.5, h:10, rotate:15, fill:{color:t.accent}, line:{color:t.accent} });
  s.addShape('rect', { x:0, y:0, w:'100%', h:0.1, fill:{color:t.accent} });
  s.addShape('ellipse', { x:7.8, y:5.5, w:2.5, h:2.5, fill:{color:t.accentAlt,transparency:88}, line:{color:t.accentAlt,width:1.5,transparency:76} });
  s.addText(c.title||'Presentation', { x:0.6, y:1.0, w:6.5, h:3.8, fontSize:40, bold:true, color:'FFFFFF', align:'left', valign:'middle', wrap:true });
  s.addShape('rect', { x:0.6, y:5.1, w:4.0, h:0.08, fill:{color:t.accent} });
  if (c.subtitle) s.addText(c.subtitle, { x:0.6, y:5.3, w:7.5, h:1.0, fontSize:17, color:t.sub, italic:true, wrap:true });
  s.addText(`${total} SLIDES`, { x:0.6, y:6.7, w:2.0, h:0.4, fontSize:9, bold:true, color:t.sub, charSpacing:2 });
  s.addShape('rect', { x:0, y:7.38, w:'100%', h:0.12, fill:{color:t.accent} });
}

function titleRightPanel(pres, c, t, total) {
  const s = pres.addSlide(); s.background = { color:t.titleBg }; s.transition = trans(0);
  s.addShape('rect', { x:6.5, y:0, w:3.5, h:7.5, fill:{color:t.headerBg} });
  s.addShape('rect', { x:9.88, y:0, w:0.12, h:7.5, fill:{color:t.accent} });
  // Decorative in right panel
  s.addShape('ellipse', { x:6.8, y:1.0, w:2.8, h:2.8, fill:{color:t.accent,transparency:86}, line:{color:t.accent,width:2,transparency:74} });
  s.addShape('ellipse', { x:7.2, y:4.5, w:1.5, h:1.5, fill:{color:t.accentAlt,transparency:84}, line:{color:t.accentAlt,width:1.5,transparency:76} });
  s.addShape('rect', { x:0, y:0, w:'100%', h:0.1, fill:{color:t.accent} });
  s.addText(c.title||'Presentation', { x:0.5, y:1.2, w:5.8, h:3.6, fontSize:40, bold:true, color:'FFFFFF', align:'left', valign:'middle', wrap:true });
  s.addShape('rect', { x:0.5, y:5.1, w:3.5, h:0.08, fill:{color:t.accent} });
  s.addShape('rect', { x:4.1, y:5.1, w:0.5, h:0.08, fill:{color:t.accentAlt} });
  if (c.subtitle) s.addText(c.subtitle, { x:0.5, y:5.3, w:5.5, h:1.0, fontSize:17, color:t.sub, italic:true, wrap:true });
  s.addText(`${total} SLIDES`, { x:0.5, y:6.7, w:2.0, h:0.4, fontSize:9, bold:true, color:t.sub, charSpacing:2 });
  s.addShape('rect', { x:0, y:7.38, w:'100%', h:0.12, fill:{color:t.accent} });
}

function titleCentered(pres, c, t, total) {
  const s = pres.addSlide(); s.background = { color:t.titleBg }; s.transition = trans(0);
  // Top + bottom bands
  s.addShape('rect', { x:0, y:0, w:'100%', h:1.8, fill:{color:t.headerBg} });
  s.addShape('rect', { x:0, y:5.7, w:'100%', h:1.8, fill:{color:t.headerBg} });
  s.addShape('rect', { x:0, y:0, w:'100%', h:0.12, fill:{color:t.accent} });
  s.addShape('rect', { x:0, y:7.38, w:'100%', h:0.12, fill:{color:t.accent} });
  // Decorative rings
  s.addShape('ellipse', { x:3.5, y:1.9, w:3.0, h:3.0, fill:{color:t.accent,transparency:92}, line:{color:t.accent,width:2.5,transparency:80} });
  s.addShape('ellipse', { x:4.0, y:2.4, w:2.0, h:2.0, fill:{color:t.accent,transparency:95}, line:{color:t.accent,width:1,transparency:85} });
  s.addText(c.title||'Presentation', { x:0.5, y:1.9, w:9.0, h:3.0, fontSize:36, bold:true, color:'FFFFFF', align:'center', valign:'middle', wrap:true });
  s.addShape('rect', { x:3.0, y:5.1, w:4.0, h:0.08, fill:{color:t.accent} });
  s.addShape('rect', { x:4.5, y:5.1, w:1.0, h:0.08, fill:{color:t.accentAlt} });
  if (c.subtitle) s.addText(c.subtitle, { x:0.5, y:5.3, w:9.0, h:1.0, fontSize:17, color:t.sub, italic:true, align:'center', wrap:true });
  s.addText(`${total} SLIDES`, { x:0, y:6.7, w:'100%', h:0.4, fontSize:9, bold:true, color:t.sub, align:'center', charSpacing:2 });
}

function titleLines(pres, c, t, total) {
  const s = pres.addSlide(); s.background = { color:t.titleBg }; s.transition = trans(0);
  s.addShape('rect', { x:0, y:0, w:'100%', h:0.07, fill:{color:t.accent} });
  s.addShape('rect', { x:0, y:7.43, w:'100%', h:0.07, fill:{color:t.accent} });
  s.addShape('rect', { x:0.5, y:2.5, w:9.0, h:0.03, fill:{color:t.accent,transparency:50} });
  s.addShape('rect', { x:0.5, y:5.3, w:9.0, h:0.03, fill:{color:t.accent,transparency:50} });
  s.addText(c.title||'Presentation', { x:0.5, y:0.7, w:9.0, h:1.8, fontSize:44, bold:true, color:'FFFFFF', align:'left', valign:'bottom', wrap:true });
  if (c.subtitle) s.addText(c.subtitle, { x:0.5, y:2.7, w:9.0, h:1.2, fontSize:20, color:t.sub, italic:true, wrap:true });
  s.addText(`${total} SLIDES`, { x:0.5, y:5.5, w:2.0, h:0.4, fontSize:9, bold:true, color:t.sub, charSpacing:2 });
}

function titleBold(pres, c, t, total) {
  const s = pres.addSlide(); s.background = { color:t.titleBg }; s.transition = trans(0);
  // Full-width bold header block
  s.addShape('rect', { x:0, y:0, w:'100%', h:4.5, fill:{color:t.headerBg} });
  s.addShape('rect', { x:0, y:0, w:'100%', h:0.12, fill:{color:t.accent} });
  // Angled cut at bottom of header
  s.addShape('rect', { x:-1, y:3.8, w:12, h:1.5, rotate:-4, fill:{color:t.titleBg}, line:{color:t.titleBg} });
  s.addShape('ellipse', { x:7.5, y:0.3, w:2.2, h:2.2, fill:{color:t.accent,transparency:86}, line:{color:t.accent,width:1.5,transparency:74} });
  s.addShape('ellipse', { x:8.5, y:2.5, w:1.0, h:1.0, fill:{color:t.accentAlt,transparency:82}, line:{color:t.accentAlt,width:1,transparency:72} });
  s.addText(c.title||'Presentation', { x:0.5, y:0.4, w:7.5, h:3.8, fontSize:40, bold:true, color:'FFFFFF', align:'left', valign:'middle', wrap:true, charSpacing:0.3 });
  s.addShape('rect', { x:0.5, y:5.0, w:4.5, h:0.1, fill:{color:t.accent} });
  s.addShape('rect', { x:5.1, y:5.0, w:0.8, h:0.1, fill:{color:t.accentAlt} });
  if (c.subtitle) s.addText(c.subtitle, { x:0.5, y:5.2, w:8.5, h:1.0, fontSize:17, color:t.sub, italic:true, wrap:true });
  s.addText(`${total} SLIDES`, { x:0.5, y:6.7, w:2.0, h:0.4, fontSize:9, bold:true, color:t.sub, charSpacing:2 });
  s.addShape('rect', { x:0, y:7.38, w:'100%', h:0.12, fill:{color:t.accent} });
}

function addTitleSlide(pres, content, t, total) {
  switch (t.layout) {
    case 'diagonal':  return titleDiagonal(pres, content, t, total);
    case 'rightpanel':return titleRightPanel(pres, content, t, total);
    case 'centered':  return titleCentered(pres, content, t, total);
    case 'lines':     return titleLines(pres, content, t, total);
    case 'bold':      return titleBold(pres, content, t, total);
    default:          return titleSidebar(pres, content, t, total);
  }
}

// ── CONTENT SLIDE ─────────────────────────────────────────────────────────────
function addContentSlide(pres, slide, t, num, total) {
  const s = pres.addSlide(); s.background = { color:t.slideBg }; s.transition = trans(num);

  // Header varies by layout
  if (t.layout === 'lines') {
    s.addShape('rect', { x:0, y:0, w:'100%', h:1.15, fill:{color:t.headerBg} });
    s.addShape('rect', { x:0, y:1.15, w:'100%', h:0.06, fill:{color:t.accent} });
  } else if (t.layout === 'bold') {
    s.addShape('rect', { x:0, y:0, w:'100%', h:1.15, fill:{color:t.headerBg} });
    s.addShape('rect', { x:0, y:0, w:0.55, h:1.15, fill:{color:t.accent} });
    s.addShape('rect', { x:0, y:0, w:'100%', h:0.08, fill:{color:t.accent} });
  } else {
    s.addShape('rect', { x:0, y:0, w:'100%', h:1.15, fill:{color:t.headerBg} });
    s.addShape('rect', { x:0, y:0, w:0.1, h:1.15, fill:{color:t.accent} });
  }

  // Slide title
  s.addText(slide.title||'', { x:0.3, y:0.1, w:8.9, h:0.95, fontSize:23, bold:true, color:'FFFFFF', valign:'middle', wrap:true });

  // Slide counter badge
  s.addShape('rect', { x:8.35, y:0.35, w:1.35, h:0.45, fill:{color:t.titleBg||t.headerBg} });
  s.addText(`${num} / ${total}`, { x:8.35, y:0.35, w:1.35, h:0.45, fontSize:10, bold:true, color:t.sub, align:'center', valign:'middle' });

  // Body paragraph (if present)
  let startY = 1.32;
  if (slide.body) {
    s.addShape('rect', { x:0.28, y:1.28, w:9.35, h:1.22, fill:{color:t.cardBg}, line:{color:t.cardBorder,width:0.75} });
    s.addShape('rect', { x:0.28, y:1.28, w:0.08, h:1.22, fill:{color:t.accent} });
    s.addText(slide.body, { x:0.48, y:1.33, w:9.0, h:1.12, fontSize:12, color:t.bodyText, valign:'middle', wrap:true, charSpacing:0.1 });
    startY = 2.62;
  }

  // Bullet cards
  const bullets = (slide.bullets||[]).filter(Boolean).slice(0,2);
  const cardH = 1.25, gap = 0.1;

  bullets.forEach((b, idx) => {
    const y = startY + idx*(cardH+gap);
    // Shadow
    s.addShape('rect', { x:0.36, y:y+0.07, w:9.35, h:cardH, fill:{color:'C8D4E8',transparency:72} });
    // Card
    s.addShape('rect', { x:0.28, y, w:9.35, h:cardH, fill:{color:t.cardBg}, line:{color:t.cardBorder,width:1} });
    // Number badge
    s.addShape('rect', { x:0.28, y, w:0.5, h:cardH, fill:{color:t.numBg} });
    s.addText(`${idx+1}`, { x:0.28, y, w:0.5, h:cardH, fontSize:16, bold:true, color:'FFFFFF', align:'center', valign:'middle' });
    // Top accent
    s.addShape('rect', { x:0.78, y, w:8.85, h:0.06, fill:{color:t.accent, transparency:60} });
    // Text — more room for longer bullets
    s.addText(b, { x:0.86, y:y+0.1, w:8.6, h:cardH-0.15, fontSize:13.5, color:t.bodyText, valign:'middle', wrap:true });
  });

  // Highlight
  if (slide.highlight) {
    const hlY = startY + bullets.length*(cardH+gap) + 0.08;
    s.addShape('rect', { x:0.28, y:hlY, w:9.35, h:0.78, fill:{color:t.hlBg} });
    s.addShape('rect', { x:0.28, y:hlY, w:0.5, h:0.78, fill:{color:t.accent} });
    s.addText('★', { x:0.28, y:hlY, w:0.5, h:0.78, fontSize:13, color:'FFFFFF', align:'center', valign:'middle' });
    s.addText(slide.highlight, { x:0.86, y:hlY+0.08, w:8.6, h:0.62, fontSize:13, bold:true, color:t.hlText, valign:'middle', wrap:true });
  }

  s.addShape('rect', { x:0, y:7.38, w:'100%', h:0.12, fill:{color:t.accent} });
  if (slide.notes) s.addNotes(slide.notes);
}

// ── STAT SLIDE ────────────────────────────────────────────────────────────────
function addStatSlide(pres, slide, t, num, total) {
  const s = pres.addSlide(); s.background = { color:t.titleBg||t.headerBg }; s.transition = trans(num);
  // Background rings
  s.addShape('ellipse', { x:-1.2, y:-1.2, w:5.0, h:5.0, fill:{color:t.headerBg,transparency:68}, line:{color:t.accent,width:2,transparency:65} });
  s.addShape('ellipse', { x:7.3, y:4.2, w:3.8, h:3.8, fill:{color:t.headerBg,transparency:72}, line:{color:t.accentAlt,width:1.5,transparency:68} });
  s.addShape('ellipse', { x:8.4, y:0.3, w:1.8, h:1.8, fill:{color:t.accent,transparency:84}, line:{color:t.accent,width:1,transparency:76} });
  s.addShape('rect', { x:0, y:0, w:'100%', h:0.1, fill:{color:t.accent} });
  s.addShape('rect', { x:0, y:7.4, w:'100%', h:0.1, fill:{color:t.accent} });

  // Label
  s.addText((slide.title||'KEY METRIC').toUpperCase(), { x:0.5, y:0.3, w:9, h:0.55, fontSize:12, bold:true, color:t.sub, align:'center', charSpacing:3.0 });

  // BIG NUMBER
  const n = slide.number||'0';
  s.addText(n, { x:0.5, y:0.9, w:9, h:3.8, fontSize:n.length<=4?120:n.length<=6?88:66, bold:true, color:t.accent, align:'center', valign:'middle' });

  // Divider
  s.addShape('rect', { x:2.5, y:4.9, w:5.0, h:0.07, fill:{color:t.accent} });
  s.addShape('rect', { x:4.2, y:4.9, w:1.6, h:0.07, fill:{color:t.accentAlt} });

  // Number label
  s.addText(slide.numberLabel||'', { x:0.5, y:5.1, w:9, h:1.1, fontSize:19, color:'FFFFFF', align:'center', wrap:true, italic:true });

  // Context
  if (slide.context) s.addText(slide.context, { x:1.0, y:6.3, w:8.0, h:0.7, fontSize:13, color:t.sub, align:'center', wrap:true });

  s.addText(`${num} / ${total}`, { x:8.8, y:6.95, w:0.9, h:0.3, fontSize:10, color:t.sub, align:'right' });
  if (slide.notes) s.addNotes(slide.notes);
}

// ── QUOTE SLIDE ───────────────────────────────────────────────────────────────
function addQuoteSlide(pres, slide, t, num, total) {
  const s = pres.addSlide(); s.background = { color:t.titleBg||t.headerBg }; s.transition = trans(num);

  // Dark overlay base + accent panel
  s.addShape('rect', { x:0, y:0, w:'100%', h:7.5, fill:{color: t.titleBg||t.headerBg} });
  s.addShape('rect', { x:7.0, y:0, w:3.0, h:7.5, fill:{color:t.headerBg,transparency:50} });
  s.addShape('rect', { x:-2, y:4.8, w:16, h:1.0, rotate:-6, fill:{color:t.accent,transparency:84} });

  s.addShape('rect', { x:0, y:0, w:'100%', h:0.1, fill:{color:t.accent} });
  s.addShape('rect', { x:0, y:7.4, w:'100%', h:0.1, fill:{color:t.accent} });

  // Decorative quote marks (background)
  s.addText('"', { x:0.2, y:-0.3, w:2.8, h:2.5, fontSize:180, bold:true, color:t.accent, align:'left', transparency:82 });
  s.addText('"', { x:7.0, y:4.5, w:2.5, h:2.5, fontSize:120, bold:true, color:t.accentAlt, align:'right', transparency:86 });

  // Left accent bar
  s.addShape('rect', { x:0, y:0.1, w:0.18, h:7.3, fill:{color:t.accent} });

  // Quote text
  s.addText(slide.quote||slide.title||'', {
    x:0.55, y:1.2, w:8.8, h:4.0,
    fontSize:24, color:'FFFFFF', align:'left', valign:'middle',
    wrap:true, italic:true, charSpacing:0.3,
  });

  // Source
  if (slide.source) {
    s.addShape('rect', { x:0.55, y:5.5, w:1.5, h:0.07, fill:{color:t.accent} });
    s.addText(`— ${slide.source}`, { x:0.55, y:5.7, w:8.5, h:0.5, fontSize:13, color:t.sub, italic:true });
  }

  s.addText(`${num} / ${total}`, { x:8.8, y:6.95, w:0.9, h:0.3, fontSize:10, color:t.sub, align:'right' });
  if (slide.notes) s.addNotes(slide.notes);
}

// ── DIVIDER SLIDE ─────────────────────────────────────────────────────────────
function addDividerSlide(pres, slide, t, num, total) {
  const s = pres.addSlide(); s.background = { color:t.accent }; s.transition = trans(num);

  // Background depth shapes
  s.addShape('ellipse', { x:-1.5,y:-1.5, w:6.0,h:6.0, fill:{color:'FFFFFF',transparency:93}, line:{color:'FFFFFF',width:2,transparency:86} });
  s.addShape('ellipse', { x:7.0, y:3.5, w:4.0,h:4.0, fill:{color:'FFFFFF',transparency:95}, line:{color:'FFFFFF',width:1.5,transparency:89} });
  // Diagonal strip
  s.addShape('rect', { x:-2,y:3.0, w:16,h:2.0, rotate:-4, fill:{color:t.titleBg||t.headerBg,transparency:72} });
  s.addShape('rect', { x:0, y:0, w:'100%', h:0.1, fill:{color:'FFFFFF',transparency:55} });

  // Section tag
  s.addText(`SECTION ${num}`, { x:0.5, y:0.55, w:9, h:0.45, fontSize:10, bold:true, color:'FFFFFF', align:'center', charSpacing:4.0, transparency:40 });

  // Main bold message
  s.addText(slide.message||slide.title||'', { x:0.5, y:1.8, w:9.0, h:3.0, fontSize:42, bold:true, color:'FFFFFF', align:'center', valign:'middle', wrap:true });

  // Decorative lines
  s.addShape('rect', { x:3.0, y:5.1, w:4.0, h:0.07, fill:{color:'FFFFFF',transparency:50} });
  s.addShape('rect', { x:4.3, y:5.1, w:1.4, h:0.07, fill:{color:t.accentAlt||'FFFFFF',transparency:40} });

  if (slide.subtitle) s.addText(slide.subtitle, { x:0.5, y:5.3, w:9.0, h:0.9, fontSize:18, color:'FFFFFF', align:'center', wrap:true, transparency:25, italic:true });
  s.addText(`${num} / ${total}`, { x:8.8, y:6.95, w:0.9, h:0.3, fontSize:10, color:'FFFFFF', align:'right', transparency:40 });
  s.addShape('rect', { x:0, y:7.4, w:'100%', h:0.1, fill:{color:'FFFFFF',transparency:55} });
  if (slide.notes) s.addNotes(slide.notes);
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function createPresentation(content, style) {
  const t = THEMES[style] || THEMES.corporate;
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';
  const slides = content.slides || [];
  const total = slides.length + 1;

  addTitleSlide(pres, content, t, total);

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const num = i + 2;
    switch ((slide.type||'content').toLowerCase()) {
      case 'stat':    addStatSlide(pres, slide, t, num, total);    break;
      case 'quote':   addQuoteSlide(pres, slide, t, num, total);   break;
      case 'divider': addDividerSlide(pres, slide, t, num, total); break;
      default:        addContentSlide(pres, slide, t, num, total);
    }
  }

  return pres.write({ outputType: 'nodebuffer' });
}

// ── DOCUMENT ──────────────────────────────────────────────────────────────────
async function createDocument(content, docType) {
  const accentHex = '1A3A8F';
  const children = [
    new Paragraph({ children:[new TextRun({text:content.title||'Document', bold:true, size:56, color:accentHex})], spacing:{after:240} }),
    new Paragraph({ border:{bottom:{style:BorderStyle.SINGLE,size:8,color:accentHex}}, spacing:{after:480} }),
  ];
  for (const section of (content.sections||[])) {
    children.push(new Paragraph({ children:[new TextRun({text:section.heading||'', bold:true, size:34, color:accentHex})], heading:HeadingLevel.HEADING_1, spacing:{before:400,after:160} }));
    for (const para of (section.content||'').split(/\n\n+/).filter(Boolean)) {
      children.push(new Paragraph({ children:[new TextRun({text:para.trim(), size:24, color:'1E293B'})], spacing:{after:220}, alignment:AlignmentType.JUSTIFIED }));
    }
    children.push(new Paragraph({ border:{bottom:{style:BorderStyle.SINGLE,size:2,color:'E2E8F0'}}, spacing:{after:200} }));
  }
  const doc = new Document({
    styles:{ paragraphStyles:[{id:'Normal',name:'Normal',run:{font:'Calibri',size:24},paragraph:{spacing:{line:360}}}] },
    sections:[{properties:{},children}],
  });
  return Packer.toBuffer(doc);
}

module.exports = { createPresentation, createDocument };
