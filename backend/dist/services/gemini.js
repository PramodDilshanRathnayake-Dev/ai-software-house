"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateContent = exports.getGeminiClient = void 0;
const genai_1 = require("@google/genai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Initialize the Gemini client using the new @google/genai SDK
// We lazily initialize to handle cases where the key might be missing at startup but provided later
let ai = null;
const getGeminiClient = () => {
    if (!ai) {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('WARN: GEMINI_API_KEY is not set in the environment variables.');
        }
        ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return ai;
};
exports.getGeminiClient = getGeminiClient;
const generateContent = async (prompt, model = 'gemini-flash-latest') => {
    const client = (0, exports.getGeminiClient)();
    try {
        const response = await client.models.generateContent({
            model,
            contents: prompt,
        });
        return response.text || '';
    }
    catch (error) {
        console.error('Error generating content with Gemini:', error);
        throw error;
    }
};
exports.generateContent = generateContent;
