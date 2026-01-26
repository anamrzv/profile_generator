import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { CVGenerator } from './generator';
import { Parser } from './util';

const upload = multer();
const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb' }));

app.post('/api/generate', upload.single('photo'), async (req, res) => {
  const generator = new CVGenerator();
  try {
    const payload = Parser.parseCVPayload(req);

    const pdfBuffer = await generator.generatePDF({
      name: payload.name,
      title: payload.title,
      photo: payload.photo,
      summary: payload.summary,
      itSkills: payload.itSkills,
      education: payload.education,
      methods: payload.methods,
      languages: payload.languages,
      expertise: payload.expertise,
      industryKnowHow: payload.industryKnowHow,
      itTools: payload.itTools,
      projects: payload.projects,
      lang: payload.lang
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="cv_${payload.name.replace(/\s+/g, '_')}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('Error generating CV:', err);
    res.status(500).json({ error: err.message || String(err) });
  } finally {
    await generator.close();
  }
});

app.post('/api/generate/html', upload.single('photo'), async (req, res) => {
  const generator = new CVGenerator();
  try {
    const payload = Parser.parseCVPayload(req);

    const html = await generator.generateHTML({
      name: payload.name,
      title: payload.title,
      photo: payload.photo,
      summary: payload.summary,
      education: payload.education,
      methods: payload.methods,
      languages: payload.languages,
      expertise: payload.expertise,
      industryKnowHow: payload.industryKnowHow,
      itSkills: payload.itSkills,
      itTools: payload.itTools,
      projects: payload.projects,
      lang: payload.lang
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err: any) {
    console.error('Error generating CV HTML:', err);
    res.status(500).json({ error: err.message || String(err) });
  } finally {
    await generator.close();
  }
});

app.post('/api/generate/docx', upload.single('photo'), async (req, res) => {
  const generator = new CVGenerator();
  try {
    const payload = Parser.parseCVPayload(req);

    const docxBuffer = await generator.generateDocx({
      name: payload.name,
      title: payload.title,
      photo: payload.photo,
      summary: payload.summary,
      education: payload.education,
      methods: payload.methods,
      languages: payload.languages,
      expertise: payload.expertise,
      industryKnowHow: payload.industryKnowHow,
      itSkills: payload.itSkills,
      itTools: payload.itTools,
      projects: payload.projects,
      lang: payload.lang
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="cv_${payload.name.replace(/\s+/g, '_')}.docx"`);
    res.send(docxBuffer);
  } catch (err: any) {
    console.error('Error generating CV DOCX:', err);
    res.status(500).json({ error: err.message || String(err) });
  } finally {
    await generator.close();
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
