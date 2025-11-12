import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { renderToString, renderToPDF, Project } from './generator';

const upload = multer();
const app = express();
app.use(cors());
app.use(express.json()); // Add JSON body parser

// New JSON API endpoint
app.post('/api/generate', upload.single('photo'), async (req, res) => {
  try {
    let name: string;
    let summary: string;
    let skills: string;
    let projects: Project[];
    let lang: string;
    let photoBuffer: Buffer | undefined;

    // Check if request is JSON or multipart/form-data
    if (req.is('application/json')) {
      // JSON request
      const body = req.body;
      name = body.name || '';
      summary = body.summary || '';
      skills = body.skills || '';
      projects = body.projects || [];
      lang = body.lang || 'en';
      
      // For JSON, photo should be base64 encoded
      if (body.photo) {
        photoBuffer = Buffer.from(body.photo, 'base64');
      }
    } else {
      // Multipart/form-data request
      name = (req.body.name || '').toString();
      summary = (req.body.summary || '').toString();
      skills = (req.body.skills || '').toString();
      
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
    const html = await renderToString({ 
      name, 
      photo: '', 
      summary, 
      skills, 
      projects, 
      lang, 
      photoBuffer 
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
    let summary: string;
    let skills: string;
    let projects: Project[];
    let lang: string;
    let photoBuffer: Buffer | undefined;

    // Check if request is JSON or multipart/form-data
    if (req.is('application/json')) {
      const body = req.body;
      name = body.name || '';
      summary = body.summary || '';
      skills = body.skills || '';
      projects = body.projects || [];
      lang = body.lang || 'en';
      
      if (body.photo) {
        photoBuffer = Buffer.from(body.photo, 'base64');
      }
    } else {
      name = (req.body.name || '').toString();
      summary = (req.body.summary || '').toString();
      skills = (req.body.skills || '').toString();
      
      try {
        projects = JSON.parse(req.body.projects || '[]');
      } catch {
        projects = [];
      }
      
      lang = (req.body.lang || 'en').toString();
      photoBuffer = req.file?.buffer;
    }

    const html = await renderToString({ 
      name, 
      photo: '', 
      summary, 
      skills, 
      projects, 
      lang, 
      photoBuffer 
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
