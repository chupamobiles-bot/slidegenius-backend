const { execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const TEMP_DIR = path.join(__dirname, '..', 'temp');
const OFFICECLI = process.env.OFFICECLI_PATH || 'officecli';

// Style themes
const THEMES = {
  professional: {
    bg: '1A1A2E',
    titleColor: 'FFFFFF',
    bulletColor: 'B0C4DE',
    accentColor: '4FC3F7',
    titleSize: 36,
    bulletSize: 20,
  },
  creative: {
    bg: '2D1B69',
    titleColor: 'FFFFFF',
    bulletColor: 'E0D7FF',
    accentColor: 'FF6B9D',
    titleSize: 38,
    bulletSize: 20,
  },
  minimal: {
    bg: 'FFFFFF',
    titleColor: '1F2937',
    bulletColor: '4B5563',
    accentColor: '3B82F6',
    titleSize: 36,
    bulletSize: 20,
  },
  academic: {
    bg: '0F2044',
    titleColor: 'FFFFFF',
    bulletColor: 'CBD5E1',
    accentColor: 'FCD34D',
    titleSize: 34,
    bulletSize: 19,
  },
};

function run(cmd) {
  return execSync(cmd, { stdio: 'pipe' }).toString();
}

async function createPresentation(content, style) {
  const theme = THEMES[style] || THEMES.professional;
  const fileId = uuidv4();
  const filePath = path.join(TEMP_DIR, `${fileId}.pptx`);

  // Create blank presentation
  run(`${OFFICECLI} create "${filePath}"`);

  content.slides.forEach((slide, idx) => {
    const slideNum = idx + 1;
    const isFirst = idx === 0;

    // Add slide with background
    run(`${OFFICECLI} add "${filePath}" / --type slide --prop background=${theme.bg}`);

    // Title
    const titleY = isFirst ? '5cm' : '1.5cm';
    const titleSize = isFirst ? theme.titleSize + 4 : theme.titleSize;
    run(`${OFFICECLI} add "${filePath}" '/slide[${slideNum}]' --type shape \
      --prop text="${escapeShell(slide.title)}" \
      --prop x=1cm --prop y=${titleY} --prop w=23cm --prop h=2.5cm \
      --prop size=${titleSize} --prop bold=true \
      --prop color=${theme.titleColor} --prop align=center`);

    // Accent line (decorative)
    run(`${OFFICECLI} add "${filePath}" '/slide[${slideNum}]' --type shape \
      --prop x=4cm --prop y=${isFirst ? '8cm' : '4.2cm'} --prop w=17cm --prop h=0.08cm \
      --prop fill=${theme.accentColor}`);

    if (isFirst && content.subtitle) {
      // Subtitle on first slide
      run(`${OFFICECLI} add "${filePath}" '/slide[${slideNum}]' --type shape \
        --prop text="${escapeShell(content.subtitle)}" \
        --prop x=2cm --prop y=8.8cm --prop w=21cm --prop h=1.2cm \
        --prop size=20 --prop color=${theme.bulletColor} --prop align=center`);
    } else {
      // Bullet points
      slide.bullets.forEach((bullet, bIdx) => {
        const bulletY = 4.8 + bIdx * 1.4;
        run(`${OFFICECLI} add "${filePath}" '/slide[${slideNum}]' --type shape \
          --prop text="▸  ${escapeShell(bullet)}" \
          --prop x=2cm --prop y=${bulletY}cm --prop w=21cm --prop h=1.2cm \
          --prop size=${theme.bulletSize} --prop color=${theme.bulletColor}`);
      });
    }

    // Slide number (bottom right, skip first slide)
    if (!isFirst) {
      run(`${OFFICECLI} add "${filePath}" '/slide[${slideNum}]' --type shape \
        --prop text="${slideNum}" \
        --prop x=23cm --prop y=17.5cm --prop w=1.5cm --prop h=0.6cm \
        --prop size=12 --prop color=${theme.accentColor} --prop align=right`);
    }

    // Speaker notes
    if (slide.notes) {
      run(`${OFFICECLI} add "${filePath}" '/slide[${slideNum}]' --type notes \
        --prop text="${escapeShell(slide.notes)}"`);
    }
  });

  return filePath;
}

async function createDocument(content, docType) {
  const fileId = uuidv4();
  const filePath = path.join(TEMP_DIR, `${fileId}.docx`);

  run(`${OFFICECLI} create "${filePath}"`);

  // Document title
  run(`${OFFICECLI} add "${filePath}" /body --type paragraph \
    --prop text="${escapeShell(content.title)}" \
    --prop style=Title --prop align=center`);

  run(`${OFFICECLI} add "${filePath}" /body --type paragraph --prop text=""`);

  // Sections
  content.sections.forEach(section => {
    // Section heading
    run(`${OFFICECLI} add "${filePath}" /body --type paragraph \
      --prop text="${escapeShell(section.heading)}" --prop style=Heading1`);

    // Section content - split into sentences for paragraph breaks
    const paras = section.content.split('\n').filter(p => p.trim());
    paras.forEach(para => {
      run(`${OFFICECLI} add "${filePath}" /body --type paragraph \
        --prop text="${escapeShell(para)}"`);
    });

    run(`${OFFICECLI} add "${filePath}" /body --type paragraph --prop text=""`);
  });

  return filePath;
}

function escapeShell(str) {
  return (str || '').replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

module.exports = { createPresentation, createDocument };
