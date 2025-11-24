import fs from 'fs-extra';
import mustache from 'mustache';
import puppeteer from 'puppeteer';

export type DetailedProject = {
    timeRange?: string; // e.g. "12/2024 – Present"
    name: string;
    industry?: string;
    duration?: string; // e.g. "Ongoing", "6 months"
    role?: string;
    coreBusinessTopics?: string[];
    projectMethods?: string[]; // methods used in the project (to avoid collision with global methods)
    tools?: string[]; // technology/tools list
    achievements?: string[]; // bullet points
};

export type CVInput = {
    name: string;
    photo: string; // absolute path
    summary?: string;
    education?: string[];
    methods?: string[];
    languages?: string[];
    expertise?: string[];
    industryKnowHow?: string[];
    itSkills?: string[]; // technical skills tags
    itTools?: string[]; // tools tags
    projects: DetailedProject[];
    out: string; // absolute path
    lang?: string; // 'en' | 'de'
    format?: 'pdf' | 'html'; // default: 'pdf'
};

// Render to string without writing files. If photoBuffer is provided, it will be embedded as data URL.
export async function renderToString(input: Omit<CVInput, 'out'> & { photoBuffer?: Buffer }): Promise<string> {
    const template = await fs.readFile(require('path').join(__dirname, '..', 'template', 'cv.mustache'), 'utf8');
    const css = await fs.readFile(require('path').join(__dirname, '..', 'template', 'style.css'), 'utf8');

    const lang = (input.lang || 'en').toLowerCase();
    const locales: Record<string, any> = {
        en: {
            summaryTitle: 'Summary',
            educationTitle: 'Education',
            methodsTitle: 'Methods',
            languagesTitle: 'Languages',
            expertiseTitle: 'Areas of Expertise',
            industryKnowHowTitle: 'Industry Know-How',
            itSkillsTitle: 'IT Skills',
            itToolsTitle: 'IT Tools',
            projectsTitle: 'Projects',
            industryTitle: 'Industry',
            durationTitle: 'Duration',
            roleTitle: 'Role',
            coreBusinessTopicsTitle: 'Core Business Topics',
            toolsTitle: 'Technology/Tools',
            achievementsTitle: 'Achievements'
        },
        de: {
            summaryTitle: 'Zusammenfassung',
            educationTitle: 'Ausbildung',
            methodsTitle: 'Methoden',
            languagesTitle: 'Sprachen',
            expertiseTitle: 'Expertise',
            industryKnowHowTitle: 'Branchen-Know-how',
            itSkillsTitle: 'IT-Kenntnisse',
            itToolsTitle: 'IT-Werkzeuge',
            projectsTitle: 'Projekte',
            industryTitle: 'Branche',
            durationTitle: 'Dauer',
            roleTitle: 'Rolle',
            coreBusinessTopicsTitle: 'Geschäftsthemen',
            toolsTitle: 'Technologien/Werkzeuge',
            achievementsTitle: 'Erfolge'
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

    const itSkills = input.itSkills;
    const normalizedProjects = (input.projects || []).map(p => {
        const achievements = p.achievements && p.achievements.length > 0
            ? p.achievements
            : [];
        return { 
            ...p, 
            achievements,
            hasAchievements: achievements && achievements.length > 0,
            hasCoreBusinessTopics: p.coreBusinessTopics && p.coreBusinessTopics.length > 0,
            hasProjectMethods: p.projectMethods && p.projectMethods.length > 0,
            hasTools: p.tools && p.tools.length > 0
        };
    });

    const rendered = mustache.render(template, {
        name: input.name,
        summary: input.summary,
        education: input.education,
        methods: input.methods,
        languages: input.languages,
        expertise: input.expertise,
        industryKnowHow: input.industryKnowHow,
        itSkills,
        itTools: input.itTools,
        projects: normalizedProjects,
        photo: photoRef,
        style: css,
        hasEducation: input.education && input.education.length > 0,
        hasMethods: input.methods && input.methods.length > 0,
        hasLanguages: input.languages && input.languages.length > 0,
        hasExpertise: input.expertise && input.expertise.length > 0,
        hasIndustryKnowHow: input.industryKnowHow && input.industryKnowHow.length > 0,
        hasItSkills: itSkills && itSkills.length > 0,
        hasItTools: input.itTools && input.itTools.length > 0,
        summaryTitle: loc.summaryTitle,
        educationTitle: loc.educationTitle,
        methodsTitle: loc.methodsTitle,
        languagesTitle: loc.languagesTitle,
        expertiseTitle: loc.expertiseTitle,
        industryKnowHowTitle: loc.industryKnowHowTitle,
        itSkillsTitle: loc.itSkillsTitle,
        itToolsTitle: loc.itToolsTitle,
        projectsTitle: loc.projectsTitle,
        industryTitle: loc.industryTitle,
        durationTitle: loc.durationTitle,
        roleTitle: loc.roleTitle,
        coreBusinessTopicsTitle: loc.coreBusinessTopicsTitle,
        toolsTitle: loc.toolsTitle,
        achievementsTitle: loc.achievementsTitle
    });

    return rendered;
}

// Generate PDF from HTML string
export async function renderToPDF(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
        headless: true, args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    });
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
