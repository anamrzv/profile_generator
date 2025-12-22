import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { renderToString, renderToPDF, DetailedProject } from './generator';

const upload = multer();
const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for binary photo data
app.use(express.urlencoded({ limit: '50mb' }));

// New JSON API endpoint
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

    // Check if request is JSON or multipart/form-data
    if (req.is('application/json')) {
      // JSON request
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
      
      // Normalize projects - handle stringified JSON in arrays (e.g., from n8n)
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
      
      // For JSON, photo should be base64 encoded
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
      
      // Parse projects from JSON string
      try {
        projects = JSON.parse(req.body.projects || '[]');
      } catch {
        projects = [];
      }
      
      lang = (req.body.lang || 'en').toString();
      photoBuffer = req.file?.buffer;
    }

    // Generate HTML
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

    // Generate PDF by default
    const pdfBuffer = await renderToPDF(html);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="cv_${name.replace(/\s+/g, '_')}.pdf"`);
    res.send(pdfBuffer);
  } catch (err: any) {
    console.error('Error generating CV:', err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

// Optional: Endpoint to generate HTML instead of PDF
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

    // Check if request is JSON or multipart/form-data
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
      
      // Normalize projects - handle stringified JSON in arrays (e.g., from n8n)
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
    }

    // Generate HTML
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
