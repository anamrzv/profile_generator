import { Command } from 'commander';
import path from 'path';
import fs from 'fs-extra';
import { generateCV, Project } from './generator';

const program = new Command();

program
  .requiredOption('-n, --name <string>', 'Full name')
  .requiredOption('-p, --photo <path>', 'Path to photo file (jpg/png)')
  .requiredOption('-s, --summary <string>', 'Summary text')
  .requiredOption('-k, --skills <string>', 'IT skills')
  .requiredOption('-j, --projects <path>', 'Path to JSON file with projects array')
  .option('-o, --out <path>', 'Output file path', './out/cv.pdf')
  .option('-l, --lang <code>', 'Language code: en or de', 'en')
  .option('-f, --format <format>', 'Output format: pdf or html', 'pdf')
  .parse(process.argv);

const opts = program.opts();

const name = opts.name as string;
const photo = path.resolve(process.cwd(), opts.photo as string);
const summary = opts.summary as string;
const skills = opts.skills as string;
const projectsPath = path.resolve(process.cwd(), opts.projects as string);
const out = path.resolve(process.cwd(), opts.out as string);
const lang = (opts.lang as string) || 'en';
const format = (opts.format as 'pdf' | 'html') || 'pdf';

(async () => {
  try {
    // Read projects from JSON file
    const projectsContent = await fs.readFile(projectsPath, 'utf8');
    const projects: Project[] = JSON.parse(projectsContent);

    await generateCV({ name, photo, summary, skills, projects, out, lang, format });
    console.log('CV generated at', out);
  } catch (err: any) {
    console.error('Failed to generate CV:', err.message ?? err);
    process.exit(1);
  }
})();
