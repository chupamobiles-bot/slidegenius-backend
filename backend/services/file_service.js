const PptxGenJS = require('pptxgenjs');
const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, Packer, BorderStyle } = require('docx');

// ══════════════════════════════════════════════════════════════════════════════
// 6 PREMIUM TEMPLATE THEMES
// ══════════════════════════════════════════════════════════════════════════════
const THEMES = {
  // 1. OBSIDIAN ELITE — Deep space dark, electric blue neon
  corporate: {
    name:'Obsidian Elite',
    titleBg:'080C18',    accent:'3B82F6',   accentAlt:'06B6D4',
    headerBg:'0F1729',   slideBg:'F0F6FF',  cardBg:'FFFFFF',
    cardBorder:'BFDBFE', bodyText:'0F172A', numBg:'1D4ED8',
    hlBg:'080C18',       hlText:'FFFFFF',   sub:'93C5FD',
    divBg:'1D4ED8',      layout:'obsidian',
  },
  // 2. CATALYST — Charcoal black, vivid orange energy
  sunset: {
    name:'Catalyst',
    titleBg:'0E0B08',    accent:'F97316',   accentAlt:'FBBF24',
    headerBg:'1C1007',   slideBg:'FFFBF5',  cardBg:'FFFFFF',
    cardBorder:'FED7AA', bodyText:'1C0A00', numBg:'EA580C',
    hlBg:'431407',       hlText:'FFFFFF',   sub:'FED7AA',
    divBg:'EA580C',      layout:'catalyst',
  },
  // 3. SOVEREIGN — Deep forest, emerald & gold
  forest: {
    name:'Sovereign',
    titleBg:'021C12',    accent:'10B981',   accentAlt:'F59E0B',
    headerBg:'052E1A',   slideBg:'F0FFF8',  cardBg:'FFFFFF',
    cardBorder:'A7F3D0', bodyText:'022C22', numBg:'059669',
    hlBg:'022C22',       hlText:'FFFFFF',   sub:'6EE7B7',
    divBg:'047857',      layout:'sovereign',
  },
  // 4. AURUM — Midnight plum, pure gold luxury
  royal: {
    name:'Aurum',
    titleBg:'1A0533',    accent:'D4AF37',   accentAlt:'A78BFA',
    headerBg:'2D0D4E',   slideBg:'F5F0FF',  cardBg:'FFFFFF',
    cardBorder:'DDD6FE', bodyText:'1E0A4A', numBg:'6D28D9',
    hlBg:'1A0533',       hlText:'FFFFFF',   sub:'E9D5FF',
    divBg:'5B21B6',      layout:'aurum',
  },
  // 5. VANTAGE — Ultra-minimal, near-black with indigo
  minimal: {
    name:'Vantage',
    titleBg:'09090B',    accent:'6366F1',   accentAlt:'10B981',
    headerBg:'18181B',   slideBg:'FFFFFF',  cardBg:'FAFAFA',
    cardBorder:'E4E4E7', bodyText:'18181B', numBg:'4338CA',
    hlBg:'09090B',       hlText:'FFFFFF',   sub:'A1A1AA',
    divBg:'3730A3',      layout:'vantage',
  },
  // 6. IGNITE — Deep crimson, high-voltage red-orange
  bold: {
    name:'Ignite',
    titleBg:'1A0000',    accent:'EF4444',   accentAlt:'FBBF24',
    headerBg:'3B0000',   slideBg:'FFF5F5',  cardBg:'FFFFFF',
    cardBorder:'FECACA', bodyText:'450A0A', numBg:'B91C1C',
    hlBg:'1A0000',       hlText:'FFFFFF',   sub:'FCA5A5',
    divBg:'DC2626',      layout:'ignite',
  },
};

// Legacy aliases
THEMES.professional = THEMES.corporate;
THEMES.creative     = THEMES.royal;
THEMES.academic     = THEMES.forest;

const TRANSITIONS = [
  { type:'fade',  dur:800 },
  { type:'push',  dur:900 },
  { type:'wipe',  dur:700 },
  { type:'zoom',  dur:850 },
  { type:'split', dur:800 },
  { type:'cover', dur:750 },
];
const tr = (i) => TRANSITIONS[i % TRANSITIONS.length];

// ══════════════════════════════════════════════════════════════════════════════
// TITLE SLIDES — unique layout per template
// ══════════════════════════════════════════════════════════════════════════════
function addTitleSlide(pres, c, t, total) {
  const s = pres.addSlide();
  s.background = { color: t.titleBg };
  s.transition  = tr(0);

  switch (t.layout) {

    case 'obsidian': {
      // Left glow panel + floating circles
      s.addShape('rect',    { x:0,   y:0, w:3.4, h:7.5, fill:{color:t.headerBg} });
      s.addShape('rect',    { x:0,   y:0, w:0.1, h:7.5, fill:{color:t.accent} });
      s.addShape('rect',    { x:3.4, y:0, w:0.04,h:7.5, fill:{color:t.accent,transparency:75} });
      // Floating geometric
      s.addShape('ellipse', { x:7.2,y:0.4,w:2.8,h:2.8, fill:{color:t.accent,transparency:92}, line:{color:t.accent,width:1.5,transparency:78} });
      s.addShape('ellipse', { x:8.4,y:4.8,w:1.4,h:1.4, fill:{color:t.accentAlt,transparency:89}, line:{color:t.accentAlt,width:1,transparency:80} });
      s.addShape('ellipse', { x:6.5,y:5.5,w:0.7,h:0.7, fill:{color:t.accentAlt,transparency:82}, line:{color:t.accentAlt,width:0.8,transparency:72} });
      // Accent dot grid (simulated)
      s.addShape('rect',    { x:3.6,y:5.0,w:3.8,h:0.06,fill:{color:t.accent} });
      s.addShape('rect',    { x:7.5,y:5.0,w:0.6,h:0.06,fill:{color:t.accentAlt} });
      // Text
      s.addText(c.title||'Presentation', { x:3.6,y:0.9,w:6.0,h:3.8, fontSize:40,bold:true,color:'FFFFFF',align:'left',valign:'middle',wrap:true,charSpacing:0.2 });
      if (c.subtitle) s.addText(c.subtitle, { x:3.6,y:5.2,w:6.0,h:1.1, fontSize:16,color:t.sub,italic:true,wrap:true });
      s.addText(t.name.toUpperCase(), { x:0.15,y:0.3,w:2.9,h:0.4, fontSize:8,bold:true,color:t.sub,charSpacing:2.5,align:'center' });
      s.addText(`${total} SLIDES`, { x:3.6,y:6.8,w:2.5,h:0.35, fontSize:9,bold:true,color:t.sub,charSpacing:2 });
      s.addShape('rect',    { x:0,y:7.38,w:'100%',h:0.12,fill:{color:t.accent} });
      break;
    }

    case 'catalyst': {
      // Diagonal energy slash
      s.addShape('rect', { x:-1,y:-1,w:8,h:10, rotate:14, fill:{color:t.headerBg}, line:{color:t.headerBg} });
      s.addShape('rect', { x:-1,y:-1,w:0.45,h:11, rotate:14, fill:{color:t.accent}, line:{color:t.accent} });
      s.addShape('rect', { x:0,y:0,w:'100%',h:0.1,fill:{color:t.accent} });
      // Small accent shapes
      s.addShape('ellipse', { x:7.6,y:5.2,w:2.8,h:2.8, fill:{color:t.accentAlt,transparency:91}, line:{color:t.accentAlt,width:1.5,transparency:80} });
      s.addShape('rect',    { x:7.9,y:1.2,w:0.8,h:0.8, rotate:45, fill:{color:t.accent,transparency:84}, line:{color:t.accent,width:1,transparency:76} });
      s.addText(c.title||'Presentation', { x:0.6,y:0.8,w:6.8,h:4.0, fontSize:42,bold:true,color:'FFFFFF',align:'left',valign:'middle',wrap:true });
      s.addShape('rect', { x:0.6,y:5.1,w:4.5,h:0.08,fill:{color:t.accent} });
      s.addShape('rect', { x:5.2,y:5.1,w:0.7,h:0.08,fill:{color:t.accentAlt} });
      if (c.subtitle) s.addText(c.subtitle, { x:0.6,y:5.3,w:7.2,h:1.1, fontSize:17,color:t.sub,italic:true,wrap:true });
      s.addText(`${total} SLIDES`, { x:0.6,y:6.8,w:2.2,h:0.35, fontSize:9,bold:true,color:t.sub,charSpacing:2 });
      s.addShape('rect',    { x:0,y:7.38,w:'100%',h:0.12,fill:{color:t.accent} });
      break;
    }

    case 'sovereign': {
      // Right emerald panel
      s.addShape('rect',    { x:6.6,y:0,w:3.4,h:7.5, fill:{color:t.headerBg} });
      s.addShape('rect',    { x:9.86,y:0,w:0.14,h:7.5, fill:{color:t.accent} });
      s.addShape('ellipse', { x:6.85,y:0.8,w:3.0,h:3.0, fill:{color:t.accent,transparency:90}, line:{color:t.accent,width:2,transparency:78} });
      s.addShape('ellipse', { x:7.6,y:4.3,w:1.6,h:1.6, fill:{color:t.accentAlt,transparency:87}, line:{color:t.accentAlt,width:1.5,transparency:78} });
      s.addShape('rect',    { x:0,y:0,w:'100%',h:0.1,fill:{color:t.accent} });
      s.addText(c.title||'Presentation', { x:0.5,y:0.9,w:5.9,h:3.8, fontSize:40,bold:true,color:'FFFFFF',align:'left',valign:'middle',wrap:true });
      s.addShape('rect', { x:0.5,y:5.0,w:4.0,h:0.08,fill:{color:t.accent} });
      s.addShape('rect', { x:4.6,y:5.0,w:0.55,h:0.08,fill:{color:t.accentAlt} });
      if (c.subtitle) s.addText(c.subtitle, { x:0.5,y:5.3,w:5.7,h:1.1, fontSize:17,color:t.sub,italic:true,wrap:true });
      s.addText(`${total} SLIDES`, { x:0.5,y:6.8,w:2.2,h:0.35, fontSize:9,bold:true,color:t.sub,charSpacing:2 });
      s.addShape('rect',    { x:0,y:7.38,w:'100%',h:0.12,fill:{color:t.accent} });
      break;
    }

    case 'aurum': {
      // Full-width top + bottom bands, centered luxury
      s.addShape('rect', { x:0,y:0,w:'100%',h:2.0,fill:{color:t.headerBg} });
      s.addShape('rect', { x:0,y:5.5,w:'100%',h:2.0,fill:{color:t.headerBg} });
      s.addShape('rect', { x:0,y:0,w:'100%',h:0.12,fill:{color:t.accent} });
      s.addShape('rect', { x:0,y:7.38,w:'100%',h:0.12,fill:{color:t.accent} });
      // Gold concentric rings
      s.addShape('ellipse', { x:3.2,y:1.9,w:3.6,h:3.6, fill:{color:t.accent,transparency:96}, line:{color:t.accent,width:2.5,transparency:84} });
      s.addShape('ellipse', { x:3.9,y:2.6,w:2.2,h:2.2, fill:{color:t.accent,transparency:97}, line:{color:t.accent,width:1,transparency:88} });
      // Diamond accents
      s.addShape('rect',    { x:4.7,y:2.0,w:0.55,h:0.55, rotate:45, fill:{color:t.accentAlt,transparency:80}, line:{color:t.accentAlt,width:1,transparency:72} });
      s.addText(c.title||'Presentation', { x:0.5,y:2.0,w:9.0,h:3.0, fontSize:38,bold:true,color:'FFFFFF',align:'center',valign:'middle',wrap:true });
      s.addShape('rect',    { x:3.2,y:5.1,w:3.6,h:0.08,fill:{color:t.accent} });
      s.addShape('rect',    { x:4.5,y:5.1,w:1.0,h:0.08,fill:{color:t.accentAlt} });
      if (c.subtitle) s.addText(c.subtitle, { x:0.5,y:5.3,w:9.0,h:1.0, fontSize:17,color:t.sub,italic:true,align:'center',wrap:true });
      s.addText(`${total} SLIDES`, { x:0,y:6.8,w:'100%',h:0.35, fontSize:9,bold:true,color:t.sub,align:'center',charSpacing:2 });
      break;
    }

    case 'vantage': {
      // Ultra-minimal lines — the content IS the design
      s.addShape('rect', { x:0,y:0,w:'100%',h:0.06,fill:{color:t.accent} });
      s.addShape('rect', { x:0,y:7.44,w:'100%',h:0.06,fill:{color:t.accent} });
      s.addShape('rect', { x:0.5,y:2.9,w:9.0,h:0.03,fill:{color:t.accent,transparency:60} });
      s.addShape('rect', { x:0.5,y:5.4,w:9.0,h:0.03,fill:{color:t.accent,transparency:60} });
      // Large monogram circle
      s.addShape('ellipse', { x:8.0,y:0.5,w:1.6,h:1.6, fill:{color:t.accent,transparency:90}, line:{color:t.accent,width:1,transparency:78} });
      s.addText(c.title||'Presentation', { x:0.5,y:0.6,w:8.0,h:2.3, fontSize:46,bold:true,color:'FFFFFF',align:'left',valign:'bottom',wrap:true,charSpacing:0.3 });
      if (c.subtitle) s.addText(c.subtitle, { x:0.5,y:3.1,w:9.0,h:1.5, fontSize:21,color:t.sub,italic:true,wrap:true });
      s.addText(`${total} SLIDES`, { x:0.5,y:5.6,w:3.0,h:0.38, fontSize:9,bold:true,color:t.sub,charSpacing:3 });
      break;
    }

    case 'ignite': {
      // Dramatic full-bleed header band with angled cut
      s.addShape('rect', { x:0,y:0,w:'100%',h:4.8,fill:{color:t.headerBg} });
      s.addShape('rect', { x:0,y:0,w:'100%',h:0.12,fill:{color:t.accent} });
      s.addShape('rect', { x:-2,y:3.9,w:14,h:1.8, rotate:-5, fill:{color:t.titleBg}, line:{color:t.titleBg} });
      // Energy burst circles
      s.addShape('ellipse', { x:7.2,y:0.2,w:2.4,h:2.4, fill:{color:t.accent,transparency:88}, line:{color:t.accent,width:2,transparency:78} });
      s.addShape('ellipse', { x:8.3,y:2.6,w:1.2,h:1.2, fill:{color:t.accentAlt,transparency:84}, line:{color:t.accentAlt,width:1.5,transparency:76} });
      s.addText(c.title||'Presentation', { x:0.5,y:0.3,w:7.0,h:4.0, fontSize:42,bold:true,color:'FFFFFF',align:'left',valign:'middle',wrap:true,charSpacing:0.3 });
      s.addShape('rect', { x:0.5,y:5.2,w:5.0,h:0.1,fill:{color:t.accent} });
      s.addShape('rect', { x:5.6,y:5.2,w:0.9,h:0.1,fill:{color:t.accentAlt} });
      if (c.subtitle) s.addText(c.subtitle, { x:0.5,y:5.4,w:8.8,h:1.1, fontSize:17,color:t.sub,italic:true,wrap:true });
      s.addText(`${total} SLIDES`, { x:0.5,y:6.8,w:2.2,h:0.35, fontSize:9,bold:true,color:t.sub,charSpacing:2 });
      s.addShape('rect', { x:0,y:7.38,w:'100%',h:0.12,fill:{color:t.accent} });
      break;
    }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// CONTENT SLIDES — unique layout per template
// ══════════════════════════════════════════════════════════════════════════════
function addContentSlide(pres, slide, t, num, total) {
  const s = pres.addSlide();
  s.background = { color: t.slideBg };
  s.transition  = tr(num);

  switch (t.layout) {

    case 'obsidian': {
      // Narrow left accent bar + circle slide number
      s.addShape('rect',    { x:0,y:0,w:0.38,h:7.5,fill:{color:t.numBg} });
      s.addShape('rect',    { x:0,y:0,w:0.1,h:7.5, fill:{color:t.accent} });
      s.addShape('ellipse', { x:0.52,y:0.22,w:0.62,h:0.62, fill:{color:t.numBg}, line:{color:t.accent,width:1.5} });
      s.addText(`${num}`, { x:0.52,y:0.22,w:0.62,h:0.62, fontSize:12,bold:true,color:'FFFFFF',align:'center',valign:'middle' });
      // Header band
      s.addShape('rect', { x:0.38,y:0,w:9.62,h:1.1,fill:{color:t.headerBg} });
      s.addShape('rect', { x:0.38,y:1.1,w:9.62,h:0.05,fill:{color:t.accent,transparency:55} });
      s.addText(slide.title||'', { x:0.55,y:0.08,w:8.8,h:0.94, fontSize:22,bold:true,color:'FFFFFF',valign:'middle',wrap:true });
      // Counter
      s.addText(`${num}/${total}`, { x:8.9,y:0.3,w:0.9,h:0.38, fontSize:10,bold:true,color:t.sub,align:'right' });
      // Body card
      let y = 1.22;
      if (slide.body) {
        s.addShape('rect', { x:0.5,y,w:9.1,h:1.35, fill:{color:'FFFFFF'}, line:{color:t.cardBorder,width:0.75} });
        s.addShape('rect', { x:0.5,y,w:0.1,h:1.35, fill:{color:t.accent} });
        s.addText(slide.body, { x:0.7,y:y+0.1,w:8.8,h:1.15, fontSize:12,color:t.bodyText,valign:'middle',wrap:true,charSpacing:0.1 });
        y += 1.45;
      }
      // Bullet cards with circle badges
      const bullets = (slide.bullets||[]).slice(0,2);
      bullets.forEach((b, i) => {
        const cy = y;
        s.addShape('rect',    { x:0.5,cy+0.06,w:9.1,h:1.32, fill:{color:'E8F0FE',transparency:60} }); // shadow
        s.addShape('rect',    { x:0.5,y:cy,w:9.1,h:1.32, fill:{color:'FFFFFF'}, line:{color:t.cardBorder,width:1} });
        s.addShape('ellipse', { x:0.56,y:cy+0.38,w:0.56,h:0.56, fill:{color:t.numBg} });
        s.addText(`${i+1}`, { x:0.56,y:cy+0.38,w:0.56,h:0.56, fontSize:13,bold:true,color:'FFFFFF',align:'center',valign:'middle' });
        s.addShape('rect',    { x:1.2,y:cy,w:8.4,h:0.06, fill:{color:t.accent,transparency:65} });
        s.addText(b, { x:1.25,y:cy+0.1,w:8.2,h:1.15, fontSize:13,color:t.bodyText,valign:'middle',wrap:true });
        y += 1.42;
      });
      // Highlight
      if (slide.highlight) {
        s.addShape('rect', { x:0.5,y:y+0.05,w:9.1,h:0.8, fill:{color:t.hlBg} });
        s.addShape('rect', { x:0.5,y:y+0.05,w:0.48,h:0.8, fill:{color:t.accent} });
        s.addText('★', { x:0.5,y:y+0.05,w:0.48,h:0.8, fontSize:13,color:'FFFFFF',align:'center',valign:'middle' });
        s.addText(slide.highlight.replace(/^★\s*/,''), { x:1.05,y:y+0.14,w:8.4,h:0.62, fontSize:12.5,bold:true,color:t.hlText,valign:'middle',wrap:true });
      }
      s.addShape('rect', { x:0,y:7.38,w:'100%',h:0.12,fill:{color:t.accent} });
      break;
    }

    case 'catalyst': {
      // Diagonal-cut header
      s.addShape('rect', { x:0,y:0,w:'100%',h:1.2,fill:{color:t.headerBg} });
      s.addShape('rect', { x:0,y:0,w:'100%',h:0.08,fill:{color:t.accent} });
      s.addShape('rect', { x:-1,y:0.9,w:12,h:0.55, rotate:-2.5, fill:{color:t.slideBg}, line:{color:t.slideBg} });
      s.addShape('rect', { x:0,y:1.08,w:6.5,h:0.06,fill:{color:t.accent} });
      s.addShape('rect', { x:6.5,y:1.08,w:1.2,h:0.06,fill:{color:t.accentAlt} });
      s.addText(slide.title||'', { x:0.3,y:0.08,w:8.6,h:0.95, fontSize:22,bold:true,color:'FFFFFF',valign:'middle',wrap:true });
      s.addText(`${num}/${total}`, { x:8.8,y:0.3,w:0.9,h:0.38, fontSize:10,bold:true,color:t.sub,align:'right' });

      let y = 1.28;
      if (slide.body) {
        // Card with top-left corner accent triangle (simulated)
        s.addShape('rect', { x:0.3,y,w:9.4,h:1.38, fill:{color:'FFFFFF'}, line:{color:t.cardBorder,width:0.75} });
        s.addShape('rect', { x:0.3,y,w:0.28,h:1.38, fill:{color:t.accent,transparency:30} });
        s.addShape('rect', { x:0.3,y,w:9.4,h:0.07, fill:{color:t.accent,transparency:45} });
        s.addText(slide.body, { x:0.7,y:y+0.12,w:8.9,h:1.15, fontSize:12,color:t.bodyText,valign:'middle',wrap:true });
        y += 1.48;
      }
      (slide.bullets||[]).slice(0,2).forEach((b,i) => {
        s.addShape('rect', { x:0.3,y:y+0.06,w:9.4,h:1.32, fill:{color:'FED7AA',transparency:72} });
        s.addShape('rect', { x:0.3,y,w:9.4,h:1.32, fill:{color:'FFFFFF'}, line:{color:t.cardBorder,width:1} });
        s.addShape('rect', { x:0.3,y,w:0.55,h:1.32, fill:{color:t.numBg} });
        s.addText(`${i+1}`, { x:0.3,y,w:0.55,h:1.32, fontSize:18,bold:true,color:'FFFFFF',align:'center',valign:'middle' });
        s.addShape('rect', { x:0.85,y,w:8.85,h:0.06, fill:{color:t.accent,transparency:60} });
        s.addText(b, { x:0.92,y:y+0.1,w:8.6,h:1.15, fontSize:13,color:t.bodyText,valign:'middle',wrap:true });
        y += 1.42;
      });
      if (slide.highlight) {
        s.addShape('rect', { x:0.3,y:y+0.04,w:9.4,h:0.8, fill:{color:t.hlBg} });
        s.addShape('rect', { x:0.3,y:y+0.04,w:0.55,h:0.8, fill:{color:t.accent} });
        s.addText('★', { x:0.3,y:y+0.04,w:0.55,h:0.8, fontSize:14,color:'FFFFFF',align:'center',valign:'middle' });
        s.addText(slide.highlight.replace(/^★\s*/,''), { x:0.92,y:y+0.14,w:8.7,h:0.62, fontSize:12.5,bold:true,color:t.hlText,valign:'middle',wrap:true });
      }
      s.addShape('rect', { x:0,y:7.38,w:'100%',h:0.12,fill:{color:t.accent} });
      break;
    }

    case 'sovereign': {
      // Right mini-panel showing progress; main content in 7.3" left zone
      const panelX = 7.45;
      s.addShape('rect', { x:panelX,y:0,w:2.55,h:7.5, fill:{color:t.headerBg} });
      s.addShape('rect', { x:9.86,y:0,w:0.14,h:7.5, fill:{color:t.accent} });
      // Step dots in right panel
      for (let d=0;d<total-1;d++) {
        const dotY = 1.5 + d*0.35;
        if (dotY > 6.8) break;
        const active = (d === num-2);
        s.addShape('ellipse', { x:panelX+1.05,y:dotY,w:0.24,h:0.24,
          fill:{ color: active ? t.accent : t.accentAlt, transparency: active ? 0 : 75 },
          line:{ color: active ? t.accent : t.accentAlt, width:1, transparency: active ? 0 : 60 }
        });
      }
      s.addText(`${num}`, { x:panelX+0.8,y:0.45,w:0.9,h:0.9, fontSize:28,bold:true,color:t.accent,align:'center',valign:'middle' });
      s.addShape('rect',{ x:panelX+0.35,y:1.45,w:1.8,h:0.04,fill:{color:t.accent,transparency:55} });
      // Header
      s.addShape('rect', { x:0,y:0,w:panelX,h:1.1,fill:{color:t.headerBg} });
      s.addShape('rect', { x:0,y:0,w:panelX,h:0.08,fill:{color:t.accent} });
      s.addShape('rect', { x:0,y:1.1,w:panelX,h:0.05,fill:{color:t.accent,transparency:60} });
      s.addText(slide.title||'', { x:0.28,y:0.08,w:7.0,h:0.94, fontSize:22,bold:true,color:'FFFFFF',valign:'middle',wrap:true });

      let y = 1.22;
      if (slide.body) {
        s.addShape('rect', { x:0.28,y,w:7.0,h:1.38, fill:{color:'FFFFFF'}, line:{color:t.cardBorder,width:0.75} });
        s.addShape('rect', { x:0.28,y,w:0.1,h:1.38, fill:{color:t.accent} });
        s.addText(slide.body, { x:0.48,y:y+0.12,w:6.7,h:1.14, fontSize:12,color:t.bodyText,valign:'middle',wrap:true });
        y += 1.48;
      }
      (slide.bullets||[]).slice(0,2).forEach((b,i) => {
        s.addShape('rect', { x:0.28,y:y+0.06,w:7.0,h:1.32, fill:{color:'A7F3D0',transparency:75} });
        s.addShape('rect', { x:0.28,y,w:7.0,h:1.32, fill:{color:'FFFFFF'}, line:{color:t.cardBorder,width:1} });
        s.addShape('ellipse', { x:0.34,y:y+0.38,w:0.56,h:0.56, fill:{color:t.numBg} });
        s.addText(`${i+1}`, { x:0.34,y:y+0.38,w:0.56,h:0.56, fontSize:13,bold:true,color:'FFFFFF',align:'center',valign:'middle' });
        s.addShape('rect', { x:1.0,y,w:6.28,h:0.06, fill:{color:t.accent,transparency:60} });
        s.addText(b, { x:1.05,y:y+0.1,w:6.12,h:1.15, fontSize:13,color:t.bodyText,valign:'middle',wrap:true });
        y += 1.42;
      });
      if (slide.highlight) {
        s.addShape('rect', { x:0.28,y:y+0.05,w:7.0,h:0.8, fill:{color:t.hlBg} });
        s.addShape('rect', { x:0.28,y:y+0.05,w:0.5,h:0.8, fill:{color:t.accentAlt} });
        s.addText('★', { x:0.28,y:y+0.05,w:0.5,h:0.8, fontSize:13,color:'FFFFFF',align:'center',valign:'middle' });
        s.addText(slide.highlight.replace(/^★\s*/,''), { x:0.85,y:y+0.14,w:6.35,h:0.62, fontSize:12.5,bold:true,color:t.hlText,valign:'middle',wrap:true });
      }
      s.addShape('rect', { x:0,y:7.38,w:'100%',h:0.12,fill:{color:t.accent} });
      break;
    }

    case 'aurum': {
      // Centered luxury — arch header, circular gold badges
      s.addShape('rect',    { x:0,y:0,w:'100%',h:1.1,fill:{color:t.headerBg} });
      s.addShape('rect',    { x:0,y:0,w:'100%',h:0.1,fill:{color:t.accent} });
      s.addShape('rect',    { x:0,y:1.1,w:'100%',h:0.06,fill:{color:t.accent,transparency:55} });
      s.addText(slide.title||'', { x:0.3,y:0.08,w:8.6,h:0.94, fontSize:22,bold:true,color:'FFFFFF',align:'center',valign:'middle',wrap:true });
      s.addText(`${num}/${total}`, { x:8.8,y:0.3,w:0.9,h:0.38, fontSize:10,bold:true,color:t.sub,align:'right' });
      // Diamond accent
      s.addShape('rect', { x:4.7,y:1.22,w:0.48,h:0.48, rotate:45, fill:{color:t.accent,transparency:80}, line:{color:t.accent,width:1,transparency:70} });

      let y = 1.3;
      if (slide.body) {
        s.addShape('rect', { x:0.3,y,w:9.4,h:1.38, fill:{color:'FFFFFF'}, line:{color:t.cardBorder,width:0.75} });
        s.addShape('rect', { x:0.3,y,w:9.4,h:0.07, fill:{color:t.accent,transparency:45} });
        s.addShape('rect', { x:0.3,y:y+1.31,w:9.4,h:0.07, fill:{color:t.accent,transparency:70} });
        s.addText(slide.body, { x:0.5,y:y+0.12,w:9.0,h:1.15, fontSize:12,color:t.bodyText,valign:'middle',wrap:true,align:'center' });
        y += 1.48;
      }
      (slide.bullets||[]).slice(0,2).forEach((b,i) => {
        s.addShape('rect',    { x:0.3,y:y+0.06,w:9.4,h:1.32, fill:{color:'EDE9FE',transparency:60} });
        s.addShape('rect',    { x:0.3,y,w:9.4,h:1.32, fill:{color:'FFFFFF'}, line:{color:t.cardBorder,width:1} });
        s.addShape('ellipse', { x:0.36,y:y+0.35,w:0.62,h:0.62, fill:{color:t.numBg} });
        s.addShape('ellipse', { x:0.33,y:y+0.32,w:0.68,h:0.68, fill:{color:'00000000',transparency:100}, line:{color:t.accent,width:2} });
        s.addText(`${i+1}`, { x:0.36,y:y+0.35,w:0.62,h:0.62, fontSize:14,bold:true,color:'FFFFFF',align:'center',valign:'middle' });
        s.addShape('rect', { x:1.1,y,w:8.6,h:0.06, fill:{color:t.accent,transparency:65} });
        s.addText(b, { x:1.15,y:y+0.1,w:8.4,h:1.15, fontSize:13,color:t.bodyText,valign:'middle',wrap:true });
        y += 1.42;
      });
      if (slide.highlight) {
        s.addShape('rect', { x:0.3,y:y+0.04,w:9.4,h:0.8, fill:{color:t.hlBg} });
        s.addShape('rect', { x:0.3,y:y+0.04,w:0.55,h:0.8, fill:{color:t.accent} });
        s.addText('★', { x:0.3,y:y+0.04,w:0.55,h:0.8, fontSize:13,color:t.hlBg,align:'center',valign:'middle' });
        s.addText(slide.highlight.replace(/^★\s*/,''), { x:0.92,y:y+0.14,w:8.7,h:0.62, fontSize:12.5,bold:true,color:t.hlText,valign:'middle',wrap:true });
      }
      s.addShape('rect', { x:0,y:7.38,w:'100%',h:0.12,fill:{color:t.accent} });
      break;
    }

    case 'vantage': {
      // Ultra-minimal: lines only, no cards, clean typography
      s.addShape('rect', { x:0,y:0,w:'100%',h:0.06,fill:{color:t.accent} });
      s.addShape('rect', { x:0,y:7.44,w:'100%',h:0.06,fill:{color:t.accent} });
      // Thin header line + title
      s.addShape('rect', { x:0,y:0.06,w:'100%',h:1.0,fill:{color:t.headerBg} });
      s.addShape('rect', { x:0,y:1.06,w:'100%',h:0.04,fill:{color:t.accent,transparency:55} });
      s.addText(slide.title||'', { x:0.5,y:0.1,w:8.8,h:0.92, fontSize:22,bold:true,color:'FFFFFF',valign:'middle',wrap:true });
      s.addText(`${num}/${total}`, { x:8.8,y:0.3,w:0.9,h:0.38, fontSize:10,bold:true,color:t.sub,align:'right' });
      // Accent dot
      s.addShape('ellipse', { x:0.36,y:0.38,w:0.28,h:0.28, fill:{color:t.accent} });

      let y = 1.2;
      if (slide.body) {
        s.addShape('rect', { x:0.5,y:y+0.04,w:0.06,h:1.3, fill:{color:t.accent} });
        s.addText(slide.body, { x:0.7,y,w:9.0,h:1.38, fontSize:12.5,color:t.bodyText,valign:'top',wrap:true });
        s.addShape('rect', { x:0.5,y:y+1.45,w:9.2,h:0.03, fill:{color:t.cardBorder} });
        y += 1.58;
      }
      (slide.bullets||[]).slice(0,2).forEach((b,i) => {
        s.addText(`0${i+1}`, { x:0.45,y:y+0.1,w:0.65,h:1.25, fontSize:22,bold:true,color:t.accent,align:'center',valign:'middle' });
        s.addShape('rect', { x:1.15,y:y+0.02,w:0.04,h:1.28, fill:{color:t.cardBorder} });
        s.addText(b, { x:1.28,y:y+0.04,w:8.4,h:1.28, fontSize:13,color:t.bodyText,valign:'middle',wrap:true });
        s.addShape('rect', { x:0.5,y:y+1.38,w:9.2,h:0.03, fill:{color:t.cardBorder} });
        y += 1.5;
      });
      if (slide.highlight) {
        s.addShape('rect', { x:0.5,y:y+0.06,w:9.2,h:0.75, fill:{color:t.hlBg} });
        s.addShape('rect', { x:0.5,y:y+0.06,w:0.5,h:0.75, fill:{color:t.accent} });
        s.addText('★', { x:0.5,y:y+0.06,w:0.5,h:0.75, fontSize:13,color:'FFFFFF',align:'center',valign:'middle' });
        s.addText(slide.highlight.replace(/^★\s*/,''), { x:1.08,y:y+0.15,w:8.5,h:0.57, fontSize:12.5,bold:true,color:t.hlText,valign:'middle',wrap:true });
      }
      break;
    }

    case 'ignite': {
      // Dramatic bold header with angled cut, intense cards
      s.addShape('rect', { x:0,y:0,w:'100%',h:1.25,fill:{color:t.headerBg} });
      s.addShape('rect', { x:0,y:0,w:0.55,h:1.25, fill:{color:t.accent} });
      s.addShape('rect', { x:0,y:0,w:'100%',h:0.08, fill:{color:t.accent} });
      s.addShape('rect', { x:-1,y:1.0,w:13,h:0.55, rotate:-2, fill:{color:t.slideBg}, line:{color:t.slideBg} });
      s.addText(slide.title||'', { x:0.72,y:0.08,w:8.7,h:1.08, fontSize:23,bold:true,color:'FFFFFF',valign:'middle',wrap:true });
      s.addText(`${num}/${total}`, { x:8.8,y:0.32,w:0.9,h:0.36, fontSize:10,bold:true,color:t.sub,align:'right' });

      let y = 1.38;
      if (slide.body) {
        s.addShape('rect', { x:0.3,y:y+0.06,w:9.4,h:1.32, fill:{color:'FECACA',transparency:75} });
        s.addShape('rect', { x:0.3,y,w:9.4,h:1.32, fill:{color:'FFFFFF'}, line:{color:t.cardBorder,width:0.75} });
        s.addShape('rect', { x:0.3,y,w:0.14,h:1.32, fill:{color:t.accent} });
        s.addText(slide.body, { x:0.54,y:y+0.12,w:9.1,h:1.1, fontSize:12,color:t.bodyText,valign:'middle',wrap:true });
        y += 1.48;
      }
      (slide.bullets||[]).slice(0,2).forEach((b,i) => {
        s.addShape('rect', { x:0.3,y:y+0.06,w:9.4,h:1.32, fill:{color:'FEE2E2',transparency:72} });
        s.addShape('rect', { x:0.3,y,w:9.4,h:1.32, fill:{color:'FFFFFF'}, line:{color:t.cardBorder,width:1} });
        s.addShape('rect', { x:0.3,y,w:0.58,h:1.32, fill:{color:t.numBg} });
        s.addText(`${i+1}`, { x:0.3,y,w:0.58,h:1.32, fontSize:20,bold:true,color:'FFFFFF',align:'center',valign:'middle' });
        s.addShape('rect', { x:0.88,y,w:8.82,h:0.07, fill:{color:t.accent,transparency:55} });
        s.addText(b, { x:0.96,y:y+0.12,w:8.6,h:1.1, fontSize:13,color:t.bodyText,valign:'middle',wrap:true });
        y += 1.42;
      });
      if (slide.highlight) {
        s.addShape('rect', { x:0.3,y:y+0.04,w:9.4,h:0.8, fill:{color:t.hlBg} });
        s.addShape('rect', { x:0.3,y:y+0.04,w:0.58,h:0.8, fill:{color:t.accent} });
        s.addText('★', { x:0.3,y:y+0.04,w:0.58,h:0.8, fontSize:14,color:'FFFFFF',align:'center',valign:'middle' });
        s.addText(slide.highlight.replace(/^★\s*/,''), { x:0.96,y:y+0.14,w:8.65,h:0.62, fontSize:12.5,bold:true,color:t.hlText,valign:'middle',wrap:true });
      }
      s.addShape('rect', { x:0,y:7.38,w:'100%',h:0.12,fill:{color:t.accent} });
      break;
    }
  }

  if (slide.notes) s.addNotes(slide.notes);
}

// ══════════════════════════════════════════════════════════════════════════════
// STAT SLIDE — dramatic single metric, shared across templates
// ══════════════════════════════════════════════════════════════════════════════
function addStatSlide(pres, slide, t, num, total) {
  const s = pres.addSlide();
  s.background = { color: t.titleBg||t.headerBg };
  s.transition  = tr(num);

  // Background depth
  s.addShape('ellipse', { x:-1.5,y:-1.5,w:5.5,h:5.5, fill:{color:t.headerBg,transparency:70}, line:{color:t.accent,width:2,transparency:68} });
  s.addShape('ellipse', { x:7.0, y:3.8, w:4.5,h:4.5, fill:{color:t.headerBg,transparency:74}, line:{color:t.accentAlt,width:1.5,transparency:72} });
  s.addShape('ellipse', { x:8.2, y:0.2, w:2.0,h:2.0, fill:{color:t.accent,transparency:86}, line:{color:t.accent,width:1.5,transparency:78} });
  s.addShape('rect',    { x:0,y:0,w:'100%',h:0.1,fill:{color:t.accent} });
  s.addShape('rect',    { x:0,y:7.4,w:'100%',h:0.1,fill:{color:t.accent} });

  s.addText((slide.title||'KEY METRIC').toUpperCase(), { x:0.5,y:0.25,w:9,h:0.55, fontSize:12,bold:true,color:t.sub,align:'center',charSpacing:4.0 });

  const n = slide.number||'0';
  const fs = n.length<=4?118:n.length<=6?86:62;
  s.addText(n, { x:0.5,y:0.85,w:9,h:3.8, fontSize:fs,bold:true,color:t.accent,align:'center',valign:'middle' });

  s.addShape('rect', { x:2.2,y:4.92,w:5.6,h:0.07, fill:{color:t.accent} });
  s.addShape('rect', { x:4.0,y:4.92,w:2.0,h:0.07, fill:{color:t.accentAlt} });

  s.addText(slide.numberLabel||'', { x:0.5,y:5.08,w:9,h:1.1, fontSize:18,color:'FFFFFF',align:'center',wrap:true,italic:true });
  if (slide.context) s.addText(slide.context, { x:1.0,y:6.25,w:8.0,h:0.75, fontSize:12.5,color:t.sub,align:'center',wrap:true });
  s.addText(`${num}/${total}`, { x:8.8,y:6.95,w:0.9,h:0.3, fontSize:10,color:t.sub,align:'right' });
  if (slide.notes) s.addNotes(slide.notes);
}

// ══════════════════════════════════════════════════════════════════════════════
// QUOTE SLIDE
// ══════════════════════════════════════════════════════════════════════════════
function addQuoteSlide(pres, slide, t, num, total) {
  const s = pres.addSlide();
  s.background = { color: t.titleBg||t.headerBg };
  s.transition  = tr(num);

  s.addShape('rect', { x:7.2,y:0,w:2.8,h:7.5, fill:{color:t.headerBg,transparency:55} });
  s.addShape('rect', { x:-2,y:5.0,w:16,h:1.0, rotate:-5, fill:{color:t.accent,transparency:88} });
  s.addShape('rect', { x:0,y:0,w:'100%',h:0.1,fill:{color:t.accent} });
  s.addShape('rect', { x:0,y:7.4,w:'100%',h:0.1,fill:{color:t.accent} });

  // Giant quote marks
  s.addText('“', { x:0.1,y:-0.5,w:3.0,h:2.6, fontSize:190,bold:true,color:t.accent,align:'left',transparency:84 });
  s.addText('”', { x:7.0,y:4.2, w:2.8,h:2.8, fontSize:130,bold:true,color:t.accentAlt,align:'right',transparency:88 });

  s.addShape('rect', { x:0,y:0.1,w:0.18,h:7.3,fill:{color:t.accent} });

  s.addText(slide.quote||slide.title||'', {
    x:0.55,y:1.0,w:8.8,h:4.2,
    fontSize:23,color:'FFFFFF',align:'left',valign:'middle',
    wrap:true,italic:true,charSpacing:0.3,
  });

  if (slide.source) {
    s.addShape('rect', { x:0.55,y:5.55,w:2.0,h:0.07,fill:{color:t.accent} });
    s.addText(`— ${slide.source}`, { x:0.55,y:5.72,w:8.8,h:0.55, fontSize:12.5,color:t.sub,italic:true,wrap:true });
  }

  s.addText(`${num}/${total}`, { x:8.8,y:6.95,w:0.9,h:0.3, fontSize:10,color:t.sub,align:'right' });
  if (slide.notes) s.addNotes(slide.notes);
}

// ══════════════════════════════════════════════════════════════════════════════
// DIVIDER SLIDE
// ══════════════════════════════════════════════════════════════════════════════
function addDividerSlide(pres, slide, t, num, total) {
  const s = pres.addSlide();
  s.background = { color: t.accent };
  s.transition  = tr(num);

  s.addShape('ellipse', { x:-1.5,y:-1.5,w:6.0,h:6.0, fill:{color:'FFFFFF',transparency:94}, line:{color:'FFFFFF',width:2,transparency:88} });
  s.addShape('ellipse', { x:7.2, y:3.8, w:4.2,h:4.2, fill:{color:'FFFFFF',transparency:96}, line:{color:'FFFFFF',width:1.5,transparency:90} });
  s.addShape('rect',    { x:-2,y:3.2,w:16,h:1.8, rotate:-4, fill:{color:t.titleBg||t.headerBg,transparency:75} });
  s.addShape('rect',    { x:0,y:0,w:'100%',h:0.1,fill:{color:'FFFFFF',transparency:60} });

  s.addText(`SECTION ${num}`, { x:0.5,y:0.52,w:9,h:0.42, fontSize:10,bold:true,color:'FFFFFF',align:'center',charSpacing:5.0,transparency:35 });
  s.addText(slide.message||slide.title||'', { x:0.5,y:1.6,w:9.0,h:3.2, fontSize:44,bold:true,color:'FFFFFF',align:'center',valign:'middle',wrap:true });

  s.addShape('rect', { x:3.0,y:5.15,w:4.0,h:0.07,fill:{color:'FFFFFF',transparency:52} });
  s.addShape('rect', { x:4.3,y:5.15,w:1.4,h:0.07,fill:{color:t.accentAlt||'FFFFFF',transparency:42} });

  if (slide.subtitle) s.addText(slide.subtitle, { x:0.5,y:5.35,w:9.0,h:0.85, fontSize:17,color:'FFFFFF',align:'center',wrap:true,transparency:22,italic:true });
  s.addText(`${num}/${total}`, { x:8.8,y:6.95,w:0.9,h:0.3, fontSize:10,color:'FFFFFF',align:'right',transparency:40 });
  s.addShape('rect', { x:0,y:7.4,w:'100%',h:0.1,fill:{color:'FFFFFF',transparency:60} });
  if (slide.notes) s.addNotes(slide.notes);
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN ENTRY
// ══════════════════════════════════════════════════════════════════════════════
async function createPresentation(content, style) {
  const t = THEMES[style] || THEMES.corporate;
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';
  const slides = content.slides || [];
  const total  = slides.length + 1;

  addTitleSlide(pres, content, t, total);

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const num   = i + 2;
    switch ((slide.type||'content').toLowerCase()) {
      case 'stat':    addStatSlide(pres, slide, t, num, total);    break;
      case 'quote':   addQuoteSlide(pres, slide, t, num, total);   break;
      case 'divider': addDividerSlide(pres, slide, t, num, total); break;
      default:        addContentSlide(pres, slide, t, num, total);
    }
  }

  return pres.write({ outputType: 'nodebuffer' });
}

// ══════════════════════════════════════════════════════════════════════════════
// DOCUMENT
// ══════════════════════════════════════════════════════════════════════════════
async function createDocument(content, docType) {
  const accentHex = '1A3A8F';
  const children = [
    new Paragraph({ children:[new TextRun({text:content.title||'Document',bold:true,size:56,color:accentHex})], spacing:{after:240} }),
    new Paragraph({ border:{bottom:{style:BorderStyle.SINGLE,size:8,color:accentHex}}, spacing:{after:480} }),
  ];
  for (const section of (content.sections||[])) {
    children.push(new Paragraph({ children:[new TextRun({text:section.heading||'',bold:true,size:34,color:accentHex})], heading:HeadingLevel.HEADING_1, spacing:{before:400,after:160} }));
    for (const para of (section.content||'').split(/\n\n+/).filter(Boolean)) {
      children.push(new Paragraph({ children:[new TextRun({text:para.trim(),size:24,color:'1E293B'})], spacing:{after:220}, alignment:AlignmentType.JUSTIFIED }));
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
