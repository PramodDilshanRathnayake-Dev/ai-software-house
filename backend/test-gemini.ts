import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        console.log("Checking models...");
        // The SDK might not have listModels, but let's try to generate with a known working model
        const response = await client.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: 'say hello',
        });
        console.log("Response with gemini-1.5-flash:", response.text);
    } catch (e) {
        console.error("Error with gemini-1.5-flash:", e);
    }

    try {
        const response2 = await client.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: 'say hello',
        });
        console.log("Response with gemini-2.0-flash:", response2.text);
    } catch (e) {
        console.error("Error with gemini-2.0-flash:", e);
    }
}

listModels();
