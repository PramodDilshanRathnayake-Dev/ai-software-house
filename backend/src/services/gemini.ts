import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Gemini client using the new @google/genai SDK
// We lazily initialize to handle cases where the key might be missing at startup but provided later
let ai: GoogleGenAI | null = null;

export const getGeminiClient = (): GoogleGenAI => {
    if (!ai) {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('WARN: GEMINI_API_KEY is not set in the environment variables.');
        }
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return ai;
};

export const generateContent = async (prompt: string, model: string = 'gemini-2.5-flash'): Promise<string> => {
    const client = getGeminiClient();
    try {
        const response = await client.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text || '';
    } catch (error) {
        console.error('Error generating content with Gemini:', error);
        throw error;
    }
};
