import { Locale, DetailedProject } from './types';
import express from 'express';

export class ImageService {
    private static readonly JPEG_MAGIC_BYTES = [0xFF, 0xD8, 0xFF];
    private static readonly PNG_MAGIC_BYTES = [0x89, 0x50, 0x4E, 0x47];
    private static readonly DEFAULT_MIME_TYPE = 'image/png';

    static detectMimeType(buffer: Buffer): string {
        if (buffer.length < 4) {
            return this.DEFAULT_MIME_TYPE;
        }
        
        if (buffer[0] === this.JPEG_MAGIC_BYTES[0] && 
            buffer[1] === this.JPEG_MAGIC_BYTES[1] && 
            buffer[2] === this.JPEG_MAGIC_BYTES[2]) {
            return 'image/jpeg';
        }
        
        if (buffer[0] === this.PNG_MAGIC_BYTES[0] && 
            buffer[1] === this.PNG_MAGIC_BYTES[1] && 
            buffer[2] === this.PNG_MAGIC_BYTES[2] && 
            buffer[3] === this.PNG_MAGIC_BYTES[3]) {
            return 'image/png';
        }
        
        return this.DEFAULT_MIME_TYPE;
    }

    static toDataUrl(photoBuffer: Buffer): string {
        const base64 = photoBuffer.toString('base64');
        const mimeType = this.detectMimeType(photoBuffer);
        return `data:${mimeType};base64,${base64}`;
    }
}


export class DateFormatter {
    static formatMonthYear(isoDate?: string | null): string | undefined {
        if (!isoDate) return undefined;
        
        const date = new Date(isoDate);
        if (isNaN(date.getTime())) return undefined;
        
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${month}/${year}`;
    }

    static computeDuration(from?: string, to?: string | null): string | undefined {
        const fromFormatted = this.formatMonthYear(from);
        if (!fromFormatted) return undefined;
        
        const toFormatted = this.formatMonthYear(to) || 'ongoing';
        return `${fromFormatted} - ${toFormatted}`;
    }
}


export class LocalizationService {
    private static readonly LOCALES: Record<string, Locale> = {
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

    static getLocale(lang?: string): Locale {
        const normalizedLang = (lang || 'en').toLowerCase();
        return this.LOCALES[normalizedLang] || this.LOCALES.en;
    }
}

export class Parser {
    static safeJsonParse<T>(json: string | undefined): T | undefined {
      if (!json) return undefined;
      try {
        return JSON.parse(json);
      } catch {
        return undefined;
      }
    }
    
    static parseCVPayload(req: express.Request): {
      name: string;
      title: string;
      summary: string;
      education: string[];
      methods: string[];
      languages: string[];
      expertise: string[];
      industryKnowHow: string[];
      itSkills: string[];
      itTools: string[];
      projects: DetailedProject[];
      photo: Buffer;
      lang?: string;
    } {
      const body = req.body;
    
      // If multipart was sent, handle JSON strings, else use as object
      const education = typeof body.education === 'string'
        ? this.safeJsonParse<string[]>(body.education)
        : body.education;
    
      const methods = typeof body.methods === 'string'
        ? this.safeJsonParse<string[]>(body.methods)
        : body.methods;
    
      const languages = typeof body.languages === 'string'
        ? this.safeJsonParse<string[]>(body.languages)
        : body.languages;
    
      const expertise = typeof body.expertise === 'string'
        ? this.safeJsonParse<string[]>(body.expertise)
        : body.expertise;
    
      const industryKnowHow = typeof body.industryKnowHow === 'string'
        ? this.safeJsonParse<string[]>(body.industryKnowHow)
        : body.industryKnowHow;
    
      const itSkills = typeof body.itSkills === 'string'
        ? this.safeJsonParse<string[]>(body.itSkills)
        : body.itSkills;
    
      const itTools = typeof body.itTools === 'string'
        ? this.safeJsonParse<string[]>(body.itTools)
        : body.itTools;
    
      let projects: DetailedProject[] = [];
      if (body.projects) {
        projects = typeof body.projects === 'string'
          ? this.safeJsonParse<DetailedProject[]>(body.projects)
          : body.projects;
      }
    
      let photo: Buffer;
      if (req.file) {
        // Photo uploaded as multipart form-data file
        photo = req.file.buffer;
      } else if (body.photo) {
        // Photo provided as base64 string in JSON body
        const photoData = typeof body.photo === 'string' ? body.photo : body.photo.toString();        
        if (!photoData || photoData.length === 0) {
          throw new Error('Photo is missing or invalid');
        }
        try {
          photo = Buffer.from(photoData, 'base64');
          if (photo.length === 0) {
            throw new Error('Photo buffer is empty');
          }
        } catch (err) {
          throw new Error('Invalid base64 photo format');
        }
      } else {
        throw new Error('Photo is missing or invalid');
      }
    
      return {
        name: body.name.toString(),
        title: body.title.toString(),
        summary: body.summary.toString(),
        education,
        methods,
        languages,
        expertise,
        industryKnowHow,
        itSkills,
        itTools,
        projects,
        photo,
        lang: (body.lang || 'en').toString()
      };
    }
}