import fs from 'fs-extra';
import mustache from 'mustache';
import puppeteer, { Browser } from 'puppeteer';
import path from 'path';
import { CVInput, DetailedProject, Locale, Template } from './types';
import { ImageService, DateFormatter, LocalizationService } from './util';
import createReport from 'docx-templates/lib/main';

class TemplateService {
    private mustacheTemplate: string | null = null;
    private docxTemplate: Buffer | null = null;
    private stylesheet: string | null = null;
    private readonly templateDir: string;

    constructor(templateDir: string = path.join(__dirname, '..', 'template')) {
        this.templateDir = templateDir;
    }

    async loadTemplate(type: 'mustache' | 'docx' = 'mustache'): Promise<Template> {
        let templatePath: string;
        if (type === 'mustache') {
            if (this.mustacheTemplate === null) {
                templatePath = path.join(this.templateDir, 'cv.mustache');
                this.mustacheTemplate = await fs.readFile(templatePath, 'utf8');
            }
            return { mustache: this.mustacheTemplate, docx: undefined };
        } else if (type === 'docx') {
            if (this.docxTemplate === null) {
                templatePath = path.join(this.templateDir, 'cv_new.docx');
                this.docxTemplate = await fs.readFile(templatePath);
            }
            return { mustache: undefined, docx: this.docxTemplate };
        }
        throw new Error(`Unsupported template type: ${type}`);
    }

    async loadStylesheet(): Promise<string> {
        if (this.stylesheet === null) {
            const stylePath = path.join(this.templateDir, 'style.css');
            this.stylesheet = await fs.readFile(stylePath, 'utf8');
        }
        return this.stylesheet;
    }
}

class ProjectNormalizer {
    static normalize(projects: DetailedProject[]): any[] {
        return (projects || []).map(project => this.normalizeProject(project));
    }

    private static normalizeProject(project: DetailedProject): any {
        const achievements = project.achievements && project.achievements.length > 0
            ? project.achievements
            : [];

        return {
            ...project,
            duration: DateFormatter.computeDuration(project.from, project.to),
            achievements,
            hasAchievements: achievements.length > 0,
            hasCoreBusinessTopics: (project.coreBusinessTopics?.length ?? 0) > 0,
            hasProjectMethods: (project.projectMethods?.length ?? 0) > 0,
            hasTools: (project.tools?.length ?? 0) > 0
        };
    }
}


class BrowserService {
    private static readonly PUPPETEER_CONFIG = {
        headless: true as const,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],
        timeout: 30000
    };

    private static readonly TIMEOUTS = {
        launch: 30000,
        pageOperation: 20000,
        contentLoad: 15000,
        pdf: 20000
    };

    private browser: Browser | null = null;

    private async ensureBrowser(): Promise<Browser> {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                ...BrowserService.PUPPETEER_CONFIG,
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
            });
        }
        return this.browser;
    }

    async generatePDF(html: string): Promise<Buffer> {
        let browser;
        try {
            browser = await this.ensureBrowser();
            const page = await browser.newPage();

            page.setDefaultTimeout(BrowserService.TIMEOUTS.pageOperation);
            await page.setContent(html, {
                waitUntil: 'networkidle0',
                timeout: BrowserService.TIMEOUTS.contentLoad
            });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
                timeout: BrowserService.TIMEOUTS.pdf
            });

            await this.close();
            return Buffer.from(pdfBuffer);
        } catch (error) {
            console.error('Error generating PDF:', error);
            await this.close();
            throw error;
        }
    }

    async close(): Promise<void> {
        if (this.browser) {
            try {
                await this.browser.close();
                this.browser = null;
            } catch (error) {
                console.error('Error closing browser:', error);
            }
        }
    }
}

class TemplateContextBuilder {
    private readonly input: Omit<CVInput, 'out'>;
    private readonly locale: Locale;

    constructor(input: Omit<CVInput, 'out'>, locale: Locale) {
        this.input = input;
        this.locale = locale;
    }

    build(stylesheet: string): any {
        return {
            name: this.input.name,
            title: this.input.title,
            summary: this.input.summary,
            photo: ImageService.toDataUrl(this.input.photo),
            photoRaw: this.input.photo,
            style: stylesheet,

            education: this.input.education,
            methods: this.input.methods,
            languages: this.input.languages,
            expertise: this.input.expertise,
            industryKnowHow: this.input.industryKnowHow,
            itSkills: this.input.itSkills,
            itTools: this.input.itTools,
            projects: ProjectNormalizer.normalize(this.input.projects),

            hasEducation: this.hasContent(this.input.education),
            hasMethods: this.hasContent(this.input.methods),
            hasLanguages: this.hasContent(this.input.languages),
            hasExpertise: this.hasContent(this.input.expertise),
            hasIndustryKnowHow: this.hasContent(this.input.industryKnowHow),
            hasItSkills: this.hasContent(this.input.itSkills),
            hasItTools: this.hasContent(this.input.itTools),

            ...this.locale
        };
    }

    private hasContent(array?: string[]): boolean {
        return (array?.length ?? 0) > 0;
    }
}

export class CVGenerator {
    private readonly templateService: TemplateService;
    private readonly browserService: BrowserService;

    constructor(templateDir?: string) {
        this.templateService = new TemplateService(templateDir);
        this.browserService = new BrowserService();
    }

    async generateHTML(input: Omit<CVInput, 'out'>): Promise<string> {
        const template: Template = await this.templateService.loadTemplate();
        const stylesheet = await this.templateService.loadStylesheet();
        const locale = LocalizationService.getLocale(input.lang);

        const contextBuilder = new TemplateContextBuilder(input, locale);
        const context = contextBuilder.build(stylesheet);

        return mustache.render(template.mustache!, context);
    }

    async generatePDF(input: Omit<CVInput, 'out'>): Promise<Buffer> {
        const html = await this.generateHTML(input);
        return await this.browserService.generatePDF(html);
    }

    async generateDocx(input: Omit<CVInput, 'out'>): Promise<Buffer> {
        const template: Template = await this.templateService.loadTemplate('docx');
        const locale = LocalizationService.getLocale(input.lang);
        const contextBuilder = new TemplateContextBuilder(input, locale);
        const context = contextBuilder.build('');

        const buffer: Uint8Array = await createReport({
            template: template.docx!,
            data: context,
            additionalJsContext: {
                injectPhoto: (photoBuffer: Buffer) => {
                    let extension: string = ImageService.detectMimeType(photoBuffer) == 'image/jpeg' ? '.jpeg' : '.png';
                    return { width: 5, height: 5, data: photoBuffer, extension: extension };    
                }
            }
        });

        return Buffer.from(buffer);
    }

    async close(): Promise<void> {
        await this.browserService.close();
    }
}
