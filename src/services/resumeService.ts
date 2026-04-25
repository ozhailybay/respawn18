import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { sanitizeHTML } from '../utils/security';

// Types for resume service
interface ResumeAnalysisRequest {
  resumeContent: string;
  userData: {
    role: string;
    skills: string[];
    education: string[];
    experience: string[];
    interests: string[];
  };
}

interface ResumeAnalysisResult {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
  enhancedContent: string;
  sectionScores: {
    personalInfo: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
    projects: number;
  };
  keywordDensity: { [key: string]: number };
  industryFit: number;
  readabilityScore: number;
  atsCompatibility: number;
}

interface ResumeGenerationRequest {
  profileData: any;
  templateStyle: string;
}

interface ResumeGenerationResult {
  html: string;
}

// Cloud function references
const analyzeResumeFunction = httpsCallable(functions, 'analyzeResume');
const generateResumeContentFunction = httpsCallable(functions, 'generateResumeContent');

export const resumeService = {
  /**
   * Analyze a resume using AI
   */
  async analyzeResume(request: ResumeAnalysisRequest): Promise<ResumeAnalysisResult> {
    try {
      const result = await analyzeResumeFunction(request);
      return result.data as ResumeAnalysisResult;
    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw new Error('Failed to analyze resume. Please try again.');
    }
  },

  /**
   * Generate resume content using AI
   */
  async generateResumeContent(request: ResumeGenerationRequest): Promise<ResumeGenerationResult> {
    try {
      const result = await generateResumeContentFunction(request);
      return result.data as ResumeGenerationResult;
    } catch (error) {
      console.error('Error generating resume:', error);
      throw new Error('Failed to generate resume. Please try again.');
    }
  },

  /**
   * Convert resume data to HTML using selected template
   */
  renderResumeTemplate(templateKey: string, resumeData: any): string {
    // This would be used with our React templates
    // For now, return a basic HTML structure
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${resumeData.personalInfo?.fullName || 'Resume'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .name { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .contact { font-size: 14px; color: #666; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 18px; font-weight: bold; border-bottom: 2px solid #333; margin-bottom: 15px; }
          .experience-item { margin-bottom: 15px; }
          .job-title { font-weight: bold; }
          .company { color: #666; }
          .skills { display: flex; flex-wrap: wrap; gap: 10px; }
          .skill { background: #f0f0f0; padding: 5px 10px; border-radius: 5px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="name">${resumeData.personalInfo?.fullName || 'Your Name'}</div>
          <div class="contact">
            ${resumeData.personalInfo?.email || 'email@example.com'} | 
            ${resumeData.personalInfo?.phone || '+1 (555) 123-4567'} | 
            ${resumeData.personalInfo?.location || 'City, Country'}
          </div>
        </div>
        
        ${resumeData.summary ? `
          <div class="section">
            <div class="section-title">Professional Summary</div>
            <p>${resumeData.summary}</p>
          </div>
        ` : ''}
        
        ${resumeData.experience?.length ? `
          <div class="section">
            <div class="section-title">Experience</div>
            ${resumeData.experience.map((exp: any) => `
              <div class="experience-item">
                <div class="job-title">${exp.title}</div>
                <div class="company">${exp.company} | ${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}</div>
                <p>${exp.description}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${resumeData.education?.length ? `
          <div class="section">
            <div class="section-title">Education</div>
            ${resumeData.education.map((edu: any) => `
              <div class="experience-item">
                <div class="job-title">${edu.degree}</div>
                <div class="company">${edu.institution} | ${edu.startDate} - ${edu.endDate}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${resumeData.skills?.length ? `
          <div class="section">
            <div class="section-title">Skills</div>
            ${resumeData.skills.map((skillCat: any) => `
              <div style="margin-bottom: 10px;">
                <strong>${skillCat.category}:</strong>
                <div class="skills">
                  ${skillCat.items.map((skill: string) => `<span class="skill">${skill}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </body>
      </html>
    `;
  },

  /**
   * Export resume to PDF (client-side)
   */
  async exportToPDF(html: string, filename: string = 'resume.pdf'): Promise<void> {
    // This would use html2pdf.js or similar library
    const element = document.createElement('div');
    element.innerHTML = sanitizeHTML(html);
    element.style.padding = '20px';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.lineHeight = '1.6';
    element.style.color = '#333';

    // Dynamic import of html2pdf
    const html2pdf = (await import('html2pdf.js')).default;
    
    const opt = {
      margin: 0.5,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    return html2pdf().from(element).set(opt).save();
  },

  /**
   * Validate resume data completeness
   */
  validateResumeData(resumeData: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!resumeData.personalInfo?.fullName) {
      errors.push('Full name is required');
    }

    if (!resumeData.personalInfo?.email) {
      errors.push('Email is required');
    }

    if (!resumeData.personalInfo?.phone) {
      errors.push('Phone number is required');
    }

    if (!resumeData.summary) {
      errors.push('Professional summary is recommended');
    }

    if (!resumeData.experience?.length) {
      errors.push('At least one work experience entry is recommended');
    }

    if (!resumeData.education?.length) {
      errors.push('At least one education entry is recommended');
    }

    if (!resumeData.skills?.length) {
      errors.push('Skills section is recommended');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Get resume completeness score
   */
  getCompletenessScore(resumeData: any): number {
    let score = 0;
    const maxScore = 100;

    // Personal info (30 points)
    if (resumeData.personalInfo?.fullName) score += 10;
    if (resumeData.personalInfo?.email) score += 10;
    if (resumeData.personalInfo?.phone) score += 5;
    if (resumeData.personalInfo?.location) score += 5;

    // Summary (15 points)
    if (resumeData.summary && resumeData.summary.length > 50) score += 15;

    // Experience (25 points)
    if (resumeData.experience?.length > 0) score += 15;
    if (resumeData.experience?.length > 1) score += 5;
    if (resumeData.experience?.some((exp: any) => exp.achievements?.length > 0)) score += 5;

    // Education (15 points)
    if (resumeData.education?.length > 0) score += 15;

    // Skills (10 points)
    if (resumeData.skills?.length > 0) score += 10;

    // Additional sections (5 points)
    if (resumeData.projects?.length > 0) score += 2;
    if (resumeData.certifications?.length > 0) score += 2;
    if (resumeData.languages?.length > 0) score += 1;

    return Math.min(score, maxScore);
  }
};

export type { ResumeAnalysisRequest, ResumeAnalysisResult, ResumeGenerationRequest, ResumeGenerationResult }; 