import fs from 'fs-extra';
import mustache from 'mustache';

export type CVInput = {
  name: string;
  photo: string; // absolute path
  intro: string;
  main: string;
  out: string; // absolute path
  lang?: string; // 'en' | 'de'
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
      detailsTitle: 'Experience & Skills'
    },
    de: {
      summaryTitle: 'Zusammenfassung',
      detailsTitle: 'Berufserfahrung & Fähigkeiten'
    }
  };

  const loc = locales[lang] || locales.en;

  const rendered = mustache.render(template, {
    name: input.name,
    intro: input.intro,
    main: input.main,
    photo: photoName,
    style: css,
    summaryTitle: loc.summaryTitle,
    detailsTitle: loc.detailsTitle
  });

  await fs.writeFile(input.out, rendered, 'utf8');
}

// Render to string without writing files. If photoBuffer is provided, it will be embedded as data URL.
export async function renderToString(input: Omit<CVInput, 'out'> & { photoBuffer?: Buffer }): Promise<string> {
  const template = await fs.readFile(require('path').join(__dirname, '..', 'template', 'cv.mustache'), 'utf8');
  const css = await fs.readFile(require('path').join(__dirname, '..', 'template', 'style.css'), 'utf8');

  const lang = (input.lang || 'en').toLowerCase();
  const locales: Record<string, any> = {
    en: { summaryTitle: 'Summary', detailsTitle: 'Experience & Skills' },
    de: { summaryTitle: 'Zusammenfassung', detailsTitle: 'Berufserfahrung & Fähigkeiten' }
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
    intro: input.intro,
    main: input.main,
    photo: photoRef,
    style: css,
    summaryTitle: loc.summaryTitle,
    detailsTitle: loc.detailsTitle
  });

  return rendered;
}
