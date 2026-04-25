import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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

export const analyzeResume = onCall(
  { cors: true },
  async (request): Promise<ResumeAnalysisResult> => {
    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { resumeContent, userData } = request.data as ResumeAnalysisRequest;

    if (!resumeContent) {
      throw new HttpsError('invalid-argument', 'Resume content is required');
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        You are an expert resume reviewer with 15+ years of experience in recruitment and HR.
        
        Analyze the following resume for a ${userData.role} position, considering their background:
        - Skills: ${userData.skills.join(', ')}
        - Education: ${userData.education.join(', ')}
        - Experience: ${userData.experience.join(', ')}
        - Interests: ${userData.interests.join(', ')}
        
        RESUME CONTENT:
        ${resumeContent}
        
        Provide a comprehensive analysis with the following structure:
        
        1. OVERALL SCORE (0-100): Based on completeness, relevance, and presentation
        
        2. SECTION SCORES (0-100 each):
        - Personal Information completeness and professionalism
        - Summary/Objective clarity and impact
        - Experience relevance and achievement focus
        - Education appropriateness and details
        - Skills alignment with role requirements
        - Projects/Portfolio quality and relevance
        
        3. STRENGTHS (3-5 bullet points): What stands out positively
        
        4. IMPROVEMENTS (3-5 bullet points): Specific areas for enhancement
        
        5. DETAILED FEEDBACK (paragraph): Comprehensive analysis of the resume
        
        6. ENHANCED CONTENT SUGGESTIONS: Specific rewrites for weak sections
        
        7. KEYWORD ANALYSIS: Important keywords for the role and their frequency
        
        8. INDUSTRY FIT SCORE (0-100): How well the resume fits the target industry
        
        9. READABILITY SCORE (0-100): How easy it is to scan and read
        
        10. ATS COMPATIBILITY (0-100): How well it would perform in applicant tracking systems
        
        Format your response as a JSON object with these exact keys:
        {
          "overallScore": number,
          "sectionScores": {
            "personalInfo": number,
            "summary": number,
            "experience": number,
            "education": number,
            "skills": number,
            "projects": number
          },
          "strengths": string[],
          "improvements": string[],
          "detailedFeedback": string,
          "enhancedContent": string,
          "keywordDensity": {[keyword: string]: number},
          "industryFit": number,
          "readabilityScore": number,
          "atsCompatibility": number
        }
        
        Focus on actionable feedback that will help improve the resume's effectiveness.
        Be specific and constructive in your recommendations.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      let analysisResult: ResumeAnalysisResult;
      try {
        // Clean the response text to extract JSON
        const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        analysisResult = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        
        // Fallback analysis if parsing fails
        analysisResult = {
          overallScore: 75,
          strengths: [
            'Resume contains relevant professional information',
            'Shows career progression and experience',
            'Includes important contact details'
          ],
          improvements: [
            'Consider adding more quantifiable achievements',
            'Optimize keywords for your target role',
            'Enhance the professional summary section'
          ],
          detailedFeedback: 'Your resume shows good professional experience and relevant skills. To improve it further, focus on quantifying your achievements with specific numbers and metrics. Consider tailoring the content more specifically to your target role and industry.',
          enhancedContent: 'Focus on adding measurable results to your experience descriptions, such as "Increased sales by 25%" or "Managed a team of 10 developers".',
          sectionScores: {
            personalInfo: 80,
            summary: 70,
            experience: 75,
            education: 80,
            skills: 75,
            projects: 70
          },
          keywordDensity: {
            'leadership': 2,
            'management': 3,
            'development': 4,
            'analysis': 2
          },
          industryFit: 75,
          readabilityScore: 80,
          atsCompatibility: 75
        };
      }

      // Save the analysis to Firestore for future reference
      try {
        await db.collection('resumeAnalyses').add({
          userId: request.auth.uid,
          analysisResult,
          resumeLength: resumeContent.length,
          analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
          userRole: userData.role
        });
      } catch (saveError) {
        console.error('Failed to save analysis to Firestore:', saveError);
        // Continue without throwing - analysis still works
      }

      return analysisResult;

    } catch (error) {
      console.error('Error analyzing resume:', error);
      throw new HttpsError('internal', 'Failed to analyze resume');
    }
  }
);

export const generateResumeContent = onCall(
  { cors: true },
  async (request) => {
    // Check authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { profileData, templateStyle } = request.data;

    if (!profileData) {
      throw new HttpsError('invalid-argument', 'Profile data is required');
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        Create a professional HTML resume using the ${templateStyle} template style.
        
        PROFILE DATA:
        Name: ${profileData.personalInfo?.fullName || 'Not provided'}
        Email: ${profileData.personalInfo?.email || 'Not provided'}
        Phone: ${profileData.personalInfo?.phone || 'Not provided'}
        Location: ${profileData.personalInfo?.location || 'Not provided'}
        LinkedIn: ${profileData.personalInfo?.linkedIn || 'Not provided'}
        GitHub: ${profileData.personalInfo?.github || 'Not provided'}
        Portfolio: ${profileData.personalInfo?.portfolio || 'Not provided'}
        
        Summary: ${profileData.summary || 'Not provided'}
        
        Experience:
        ${profileData.experience?.map((exp: any) => 
          `- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}): ${exp.description}`
        ).join('\n') || 'Not provided'}
        
        Education:
        ${profileData.education?.map((edu: any) => 
          `- ${edu.degree} from ${edu.institution} (${edu.startDate} - ${edu.endDate})`
        ).join('\n') || 'Not provided'}
        
        Skills:
        ${profileData.skills?.map((skillCat: any) => 
          `${skillCat.category}: ${skillCat.items.join(', ')}`
        ).join('\n') || 'Not provided'}
        
        Projects:
        ${profileData.projects?.map((project: any) => 
          `- ${project.name}: ${project.description} (Technologies: ${project.technologies.join(', ')})`
        ).join('\n') || 'Not provided'}
        
        Languages:
        ${profileData.languages?.map((lang: any) => `${lang.name} - ${lang.proficiency}`).join(', ') || 'Not provided'}
        
        Certifications:
        ${profileData.certifications?.map((cert: any) => 
          `- ${cert.name} from ${cert.issuer} (${cert.date})`
        ).join('\n') || 'Not provided'}
        
        Generate a complete HTML resume that:
        1. Uses modern HTML5 structure with semantic elements
        2. Includes inline CSS styles for professional appearance
        3. Is optimized for both screen viewing and printing
        4. Follows the ${templateStyle} design aesthetic
        5. Is ATS-friendly with proper structure and keywords
        6. Includes all provided information in a well-organized format
        
        Return only the complete HTML document ready for use.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const html = response.text();

      // Clean up the HTML response
      const cleanedHtml = html
        .replace(/```html\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      return { html: cleanedHtml };

    } catch (error) {
      console.error('Error generating resume:', error);
      throw new HttpsError('internal', 'Failed to generate resume');
    }
  }
); 