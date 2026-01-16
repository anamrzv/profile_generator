import fs from 'fs-extra';
import mustache from 'mustache';
import puppeteer from 'puppeteer';

export type DetailedProject = {
    from?: string;
    to?: string | null;
    name: string;
    industry?: string;
    role?: string;
    coreBusinessTopics?: string[];
    projectMethods?: string[]; 
    tools?: string[]; 
    achievements?: string[]; 
};

export type CVInput = {
    name: string;
    photo: Buffer; // JPEG or PNG)
    title?: string; 
    summary?: string;
    education?: string[];
    methods?: string[];
    languages?: string[];
    expertise?: string[];
    industryKnowHow?: string[];
    itSkills?: string[]; 
    itTools?: string[]; 
    projects: DetailedProject[];
    out: string; // absolute path
    lang?: string; // 'en' | 'de'
    format?: 'pdf' | 'html'; // default: 'pdf'
};

// Render to string without writing files. Photo is expected as binary Buffer data.
export async function renderToString(input: Omit<CVInput, 'out'>): Promise<string> {
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
            achievementsTitle: 'Achievements:'
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
            achievementsTitle: 'Erfolge:'
        }
    };
    const loc = locales[lang] || locales.en;

    let photoRef = '';
    if (input.photo) {
        // Embed binary photo as data URL (detect format from buffer magic bytes)
        const b64 = input.photo.toString('base64');
        const mimeType = detectMimeType(input.photo);
        photoRef = `data:${mimeType};base64,${b64}`;
    }

    const itSkills = input.itSkills;

    const formatMonthYear = (iso?: string | null) => {
        if (!iso) return undefined;
        const d = new Date(iso);
        if (isNaN(d.getTime())) return undefined;
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const yyyy = d.getUTCFullYear();
        return `${mm}/${yyyy}`;
    };

    const normalizedProjects = (input.projects || []).map(p => {
        const achievements = p.achievements && p.achievements.length > 0 ? p.achievements : [];

        // Compute duration display if from/to provided
        let computedDuration: string | undefined = undefined;
        const fromFmt = formatMonthYear(p.from);
        if (fromFmt) {
            const toFmt = formatMonthYear(p.to) || 'ongoing';
            computedDuration = `${fromFmt} - ${toFmt}`;
        }

        return {
            ...p,
            duration: computedDuration,
            achievements,
            hasAchievements: achievements && achievements.length > 0,
            hasCoreBusinessTopics: p.coreBusinessTopics && p.coreBusinessTopics.length > 0,
            hasProjectMethods: p.projectMethods && p.projectMethods.length > 0,
            hasTools: p.tools && p.tools.length > 0
        };
    });

    const rendered = mustache.render(template, {
        name: input.name,
        title: input.title,
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

// Detect MIME type from buffer magic bytes
function detectMimeType(buffer: Buffer): string {
    if (buffer.length < 4) {
        return 'image/png'; // default fallback
    }
    
    // Check for JPEG magic bytes (FF D8 FF)
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        return 'image/jpeg';
    }
    
    // Check for PNG magic bytes (89 50 4E 47)
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        return 'image/png';
    }
    
    // Default to PNG if unknown
    return 'image/png';
}

// Generate PDF from HTML string
export async function renderToPDF(html: string): Promise<Buffer> {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            timeout: 30000 // 30 second timeout for browser launch
        });
        
        const page = await browser.newPage();
        
        page.setDefaultTimeout(20000); 
        
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 15000 });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
            timeout: 20000 // 20 second timeout for PDF generation
        });
        
        return Buffer.from(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw error;
    } finally {
        // Always close browser
        if (browser) {
            try {
                await browser.close();
            } catch (closeError) {
                console.error('Error closing browser:', closeError);
            }
        }
    }
}
