import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { renderToString, renderToPDF, DetailedProject } from './generator';

const upload = multer();
const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' })); 
app.use(express.urlencoded({ limit: '100mb' }));

app.post('/api/generate', upload.single('photo'), async (req, res) => {
  try {
    let name: string;
    let title: string | undefined;
    let summary: string;
    let itSkills: string[] | undefined;
    let itTools: string[] | undefined;
    let education: string[] | undefined;
    let methods: string[] | undefined;
    let languages: string[] | undefined;
    let expertise: string[] | undefined;
    let industryKnowHow: string[] | undefined;
    let projects: DetailedProject[];
    let lang: string;
    let photoBuffer: Buffer | undefined;

    if (req.is('application/json')) {
      const body = req.body;
      name = body.name || '';
      title = body.title;
      summary = body.summary || '';
      education = body.education;
      methods = body.methods;
      languages = body.languages;
      expertise = body.expertise;
      industryKnowHow = body.industryKnowHow;
      itSkills = body.itSkills;
      itTools = body.itTools;
      
      let rawProjects = body.projects || [];
      if (Array.isArray(rawProjects) && rawProjects.length > 0 && typeof rawProjects[0] === 'string') {
        // If first element is a string, parse each element
        projects = rawProjects.map(p => {
          try {
            return typeof p === 'string' ? JSON.parse(p) : p;
          } catch {
            return null;
          }
        }).filter(p => p !== null);
      } else {
        projects = rawProjects;
      }
      
      lang = body.lang || 'en';
      
      if (body.photo) {
        photoBuffer = Buffer.from(body.photo, 'base64');
      }
    } else {
      // Multipart/form-data request
      name = (req.body.name || '').toString();
      title = req.body.title ? (req.body.title || '').toString() : undefined;
      summary = (req.body.summary || '').toString();
      education = req.body.education ? JSON.parse(req.body.education) : undefined;
      methods = req.body.methods ? JSON.parse(req.body.methods) : undefined;
      languages = req.body.languages ? JSON.parse(req.body.languages) : undefined;
      expertise = req.body.expertise ? JSON.parse(req.body.expertise) : undefined;
      industryKnowHow = req.body.industryKnowHow ? JSON.parse(req.body.industryKnowHow) : undefined;
      itSkills = req.body.itSkills ? JSON.parse(req.body.itSkills) : undefined;
      itTools = req.body.itTools ? JSON.parse(req.body.itTools) : undefined;
      
      try {
        projects = JSON.parse(req.body.projects || '[]');
      } catch {
        projects = [];
      }
      
      lang = (req.body.lang || 'en').toString();
      photoBuffer = req.file?.buffer;

      // Fallback: allow base64 photo sent as text field in multipart requests
      if (!photoBuffer && req.body.photo) {
        const raw = req.body.photo.toString();
        const base64 = raw.includes('base64,') ? raw.split('base64,')[1] : raw;
        try {
          photoBuffer = Buffer.from(base64, 'base64');
        } catch {
          photoBuffer = undefined;
        }
      }
    }

    if (!photoBuffer) {
      res.status(400).json({ error: 'Photo is required' });
      return;
    }

    const html = await renderToString({ 
      name, 
      title,
      photo: photoBuffer, 
      summary, 
      itSkills,
      education,
      methods,
      languages,
      expertise,
      industryKnowHow,
      itTools,
      projects,
      lang
    });

    const pdfBuffer = await renderToPDF(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="cv_${name.replace(/\s+/g, '_')}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('Error generating CV:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.post('/api/generate/html', upload.single('photo'), async (req, res) => {
  try {
    let name: string;
    let title: string | undefined;
    let summary: string;
    let itSkills: string[] | undefined;
    let itTools: string[] | undefined;
    let education: string[] | undefined;
    let methods: string[] | undefined;
    let languages: string[] | undefined;
    let expertise: string[] | undefined;
    let industryKnowHow: string[] | undefined;
    let projects: DetailedProject[];
    let lang: string;
    let photoBuffer: Buffer | undefined;

    if (req.is('application/json')) {
      const body = req.body;
      name = body.name || '';
      title = body.title;
      summary = body.summary || '';
      education = body.education;
      methods = body.methods;
      languages = body.languages;
      expertise = body.expertise;
      industryKnowHow = body.industryKnowHow;
      itSkills = body.itSkills;
      itTools = body.itTools;
      
      let rawProjects = body.projects || [];
      if (Array.isArray(rawProjects) && rawProjects.length > 0 && typeof rawProjects[0] === 'string') {
        projects = rawProjects.map(p => {
          try {
            return typeof p === 'string' ? JSON.parse(p) : p;
          } catch {
            return null;
          }
        }).filter(p => p !== null);
      } else {
        projects = rawProjects;
      }
      
      lang = body.lang || 'en';
      
      if (body.photo) {
        photoBuffer = Buffer.from(body.photo, 'base64');
      }
    } else {
      const body = req.body;
      name = (body.name || '').toString();
      title = body.title ? (body.title || '').toString() : undefined;
      summary = (body.summary || '').toString();
      education = body.education ? JSON.parse(body.education) : undefined;
      methods = body.methods ? JSON.parse(body.methods) : undefined;
      languages = body.languages ? JSON.parse(body.languages) : undefined;
      expertise = body.expertise ? JSON.parse(body.expertise) : undefined;
      industryKnowHow = body.industryKnowHow ? JSON.parse(body.industryKnowHow) : undefined;
      itSkills = body.itSkills ? JSON.parse(body.itSkills) : undefined;
      itTools = body.itTools ? JSON.parse(body.itTools) : undefined;
      
      try {
        projects = JSON.parse(body.projects || '[]');
      } catch {
        projects = [];
      }
      
      lang = (body.lang || 'en').toString();

      photoBuffer = req.file?.buffer;

      if (!photoBuffer && body.photo) {
        const raw = body.photo.toString();
        const base64 = raw.includes('base64,') ? raw.split('base64,')[1] : raw;
        try {
          photoBuffer = Buffer.from(base64, 'base64');
        } catch {
          photoBuffer = undefined;
        }
      }
    }

    if (!photoBuffer) {
      res.status(400).json({ error: 'Photo is required' });
      return;
    }

    const html = await renderToString({ 
      name, 
      title,
      photo: photoBuffer, 
      summary, 
      education,
      methods,
      languages,
      expertise,
      industryKnowHow,
      itSkills,
      itTools,
      projects,
      lang
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err: any) {
    console.error('Error generating CV:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
