import ClassicTemplate from './ClassicTemplate';
import ModernTemplate from './ModernTemplate';
import ElegantTemplate from './ElegantTemplate';
import TechTemplate from './TechTemplate';

// Resume Data Interface
export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedIn?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    honors?: string;
    relevantCourses?: string[];
  }>;
  skills: Array<{
    category: string;
    items: string[];
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    github?: string;
    startDate: string;
    endDate: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  languages: Array<{
    name: string;
    proficiency: 'Native' | 'Fluent' | 'Intermediate' | 'Basic';
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
  }>;
}

// Template Registry
export const templates = {
  classic: { 
    name: 'Classic', 
    component: ClassicTemplate,
    description: 'Traditional and professional layout',
    category: 'Professional',
    preview: '/templates/classic-preview.png'
  },
  modern: { 
    name: 'Modern', 
    component: ModernTemplate,
    description: 'Clean and contemporary design',
    category: 'Creative',
    preview: '/templates/modern-preview.png'
  },
  elegant: { 
    name: 'Elegant', 
    component: ElegantTemplate,
    description: 'Sophisticated and minimalist',
    category: 'Executive',
    preview: '/templates/elegant-preview.png'
  },
  tech: { 
    name: 'Tech', 
    component: TechTemplate,
    description: 'Perfect for technical roles',
    category: 'Technical',
    preview: '/templates/tech-preview.png'
  },
} as const;

export type TemplateKey = keyof typeof templates;

// Template component props
export interface TemplateProps {
  data: ResumeData;
}

// Helper function to get template by key
export const getTemplate = (key: TemplateKey) => {
  return templates[key];
};

// Helper function to get all template keys
export const getTemplateKeys = (): TemplateKey[] => {
  return Object.keys(templates) as TemplateKey[];
};

// Helper function to render template
export const renderTemplate = (key: TemplateKey, data: ResumeData) => {
  const template = templates[key];
  const TemplateComponent = template.component;
  return <TemplateComponent data={data} />;
};

// Export individual templates
export {
  ClassicTemplate,
  ModernTemplate,
  ElegantTemplate,
  TechTemplate
}; 