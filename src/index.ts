import { Command } from 'commander';
import path from 'path';
import { generateCV } from './generator';

const program = new Command();

program
  .requiredOption('-n, --name <string>', 'Full name')
  .requiredOption('-p, --photo <path>', 'Path to photo file (jpg/png)')
  .requiredOption('-i, --intro <string>', 'Intro text')
  .requiredOption('-m, --main <string>', 'Main CV text')
  .option('-o, --out <path>', 'Output HTML path', './out/cv.html')
  .option('-l, --lang <code>', 'Language code: en or de', 'en')
  .parse(process.argv);

const opts = program.opts();

const name = opts.name as string;
const photo = path.resolve(process.cwd(), opts.photo as string);
const intro = opts.intro as string;
const main = opts.main as string;
const out = path.resolve(process.cwd(), opts.out as string);
const lang = (opts.lang as string) || 'en';

generateCV({ name, photo, intro, main, out, lang })
  .then(() => console.log('CV generated at', out))
  .catch(err => {
    console.error('Failed to generate CV:', err.message ?? err);
    process.exit(1);
  });
