import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { renderToString } from './generator';

const upload = multer();
const app = express();
app.use(cors());

// Accept multipart/form-data with fields: name, position, intro, main and file 'photo'
app.post('/api/generate', upload.single('photo'), async (req, res) => {
  try {
    const name = (req.body.name || '').toString();
    const position = (req.body.position || '').toString();
    const intro = (req.body.intro || '').toString();
    const main = (req.body.main || '').toString();
    const lang = (req.body.lang || 'en').toString();

    const photoBuffer = req.file?.buffer;

    // combine position into intro if provided
    const combinedIntro = position ? `${position} — ${intro}` : intro;

    const html = await renderToString({ name, photo: '', intro: combinedIntro, main, lang, photoBuffer });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err: any) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
