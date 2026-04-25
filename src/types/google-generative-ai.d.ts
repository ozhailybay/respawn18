declare module '@google/generative-ai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: {
      model: string;
      temperature?: number;
      messages?: Array<{
        role: string;
        content: string;
      }>;
      safetySettings?: Array<{
        category: string;
        threshold: string;
      }>;
      generationConfig?: {
        temperature?: number;
        topP?: number;
        topK?: number;
        maxOutputTokens?: number;
      };
    }): GenerativeModel;
  }

  export interface GenerativeModel {
    generateContent(prompt: string): Promise<{
      response: {
        text(): string;
      };
    }>;
  }

  export enum HarmCategory {
    HARM_CATEGORY_HARASSMENT = 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_HATE_SPEECH = 'HARM_CATEGORY_HATE_SPEECH',
    HARM_CATEGORY_SEXUALLY_EXPLICIT = 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HARM_CATEGORY_DANGEROUS_CONTENT = 'HARM_CATEGORY_DANGEROUS_CONTENT'
  }

  export enum HarmBlockThreshold {
    BLOCK_LOW_AND_ABOVE = 'BLOCK_LOW_AND_ABOVE',
    BLOCK_MEDIUM_AND_ABOVE = 'BLOCK_MEDIUM_AND_ABOVE',
    BLOCK_HIGH_AND_ABOVE = 'BLOCK_HIGH_AND_ABOVE',
    BLOCK_NONE = 'BLOCK_NONE'
  }
} 