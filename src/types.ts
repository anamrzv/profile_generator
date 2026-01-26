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
    photo: Buffer;
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
    out: string;
    lang?: string;
    format?: 'pdf' | 'html';
};

export type Locale = {
    summaryTitle: string;
    educationTitle: string;
    methodsTitle: string;
    languagesTitle: string;
    expertiseTitle: string;
    industryKnowHowTitle: string;
    itSkillsTitle: string;
    itToolsTitle: string;
    projectsTitle: string;
    industryTitle: string;
    durationTitle: string;
    roleTitle: string;
    coreBusinessTopicsTitle: string;
    toolsTitle: string;
    achievementsTitle: string;
};

export type Template = {
    mustache: string | undefined;
    docx: Buffer | undefined;
}