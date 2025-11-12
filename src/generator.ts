import fs from 'fs-extra';
import mustache from 'mustache';
import puppeteer from 'puppeteer';

export type Project = {
  name: string;
  description: string;
};

export type CVInput = {
  name: string;
  photo: string; // absolute path
  summary: string;
  skills: string;
  projects: Project[];
  out: string; // absolute path
  lang?: string; // 'en' | 'de'
  format?: 'pdf' | 'html'; // default: 'pdf'
};

export async function generateCV(input: CVInput): Promise<void> {
  await fs.ensureDir(require('path').dirname(input.out));

  const template = await fs.readFile(require('path').join(__dirname, '..', 'template', 'cv.mustache'), 'utf8');
  const css = await fs.readFile(require('path').join(__dirname, '..', 'template', 'style.css'), 'utf8');

  // Copy photo into same folder as output (as photo.ext)
  const outDir = require('path').dirname(input.out);
  const photoName = 'photo' + require('path').extname(input.photo);
  const destPhoto = require('path').join(outDir, photoName);
  await fs.copyFile(input.photo, destPhoto);

  const lang = (input.lang || 'en').toLowerCase();
  const locales: Record<string, any> = {
    en: {
      summaryTitle: 'Summary',
      skillsTitle: 'IT Skills',
      projectsTitle: 'Projects'
    },
    de: {
      summaryTitle: 'Zusammenfassung',
      skillsTitle: 'IT-Kenntnisse',
      projectsTitle: 'Projekte'
    }
  };

  const loc = locales[lang] || locales.en;

  const rendered = mustache.render(template, {
    name: input.name,
    summary: input.summary,
    skills: input.skills,
    projects: input.projects,
    photo: photoName,
    style: css,
    summaryTitle: loc.summaryTitle,
    skillsTitle: loc.skillsTitle,
    projectsTitle: loc.projectsTitle
  });

  const format = input.format || 'pdf';

  if (format === 'pdf') {
    // Generate PDF using puppeteer
    const htmlPath = input.out.replace(/\.pdf$/i, '.html');
    await fs.writeFile(htmlPath, rendered, 'utf8');

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: input.out,
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });
    await browser.close();

    // Optionally remove the temporary HTML file
    await fs.remove(htmlPath);
  } else {
    // Generate HTML
    await fs.writeFile(input.out, rendered, 'utf8');
  }
}

// Render to string without writing files. If photoBuffer is provided, it will be embedded as data URL.
export async function renderToString(input: Omit<CVInput, 'out'> & { photoBuffer?: Buffer }): Promise<string> {
  const template = await fs.readFile(require('path').join(__dirname, '..', 'template', 'cv.mustache'), 'utf8');
  const css = await fs.readFile(require('path').join(__dirname, '..', 'template', 'style.css'), 'utf8');

  const lang = (input.lang || 'en').toLowerCase();
  const locales: Record<string, any> = {
    en: { 
      summaryTitle: 'Summary', 
      skillsTitle: 'IT Skills',
      projectsTitle: 'Projects'
    },
    de: { 
      summaryTitle: 'Zusammenfassung', 
      skillsTitle: 'IT-Kenntnisse',
      projectsTitle: 'Projekte'
    }
  };
  const loc = locales[lang] || locales.en;

  let photoRef = '';
  if (input.photoBuffer) {
    // default PNG data URL
    const b64 = input.photoBuffer.toString('base64');
    photoRef = `data:image/png;base64,${b64}`;
  } else {
    // treat input.photo as path — try to read and convert to data URL
    try {
      const data = await fs.readFile(input.photo);
      const ext = require('path').extname(input.photo).slice(1) || 'png';
      photoRef = `data:image/${ext};base64,${data.toString('base64')}`;
    } catch (e) {
      // fallback to empty
      photoRef = '';
    }
  }

  const rendered = mustache.render(template, {
    name: input.name,
    summary: input.summary,
    skills: input.skills,
    projects: input.projects,
    photo: photoRef,
    style: css,
    summaryTitle: loc.summaryTitle,
    skillsTitle: loc.skillsTitle,
    projectsTitle: loc.projectsTitle
  });

  return rendered;
}

// Generate PDF from HTML string
export async function renderToPDF(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
  });
  await browser.close();
  return Buffer.from(pdfBuffer);
}
