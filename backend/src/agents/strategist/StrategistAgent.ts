import { generateContent, getGeminiClient } from '../../services/gemini';
import { ScrumTask } from '../../models/MissionContext';
import { Type } from '@google/genai';

export class StrategistAgent {
    /**
     * Generates a Product Requirement Document (PRD) based on a client intake prompt.
     */
    async generatePRD(clientIntake: string): Promise<string> {
        const prompt = `
You are 'The Strategist', an expert PM and Systems Architect for an agile AI Software House.
Your job is to take the following client request and write a comprehensive Product Requirements Document (PRD) in Markdown.
The PRD should include:
- Executive Summary
- Goals and Objectives
- User Roles and Personas
- Core Features (MVP)
- Non-Functional Requirements (Performance, Security)
- Out of Scope

Client Request:
"${clientIntake}"
    `;

        // Using gemini-flash-latest for stability (Avoids quota issues with Pro)
        return await generateContent(prompt, 'gemini-flash-latest');
    }

    /**
     * Generates a structured JSON array representing the Scrum backlog from a PRD.
     */
    async generateBacklog(prd: string): Promise<ScrumTask[]> {
        const prompt = `
You are 'The Strategist', an expert Agile Product Manager.
Take the following PRD and break it down into an initial Scrum Backlog for the development team.
Return exactly an array of task objects matching the requested JSON schema.
Each task should have a title, detailed description, status (TODO), and an assignee based on who should handle it (BUILDER for code/dev, AUDITOR for testing/QA, SRE for devops/infra).

PRD:
"${prd}"
    `;

        const client = getGeminiClient();

        const responseSchema = {
            type: 'ARRAY',
            description: 'List of Scrum Tasks',
            items: {
                type: 'OBJECT',
                properties: {
                    id: { type: 'STRING', description: 'Unique task identifier, e.g., TSK-001' },
                    title: { type: 'STRING', description: 'Clear, actionable title for the task' },
                    description: { type: 'STRING', description: 'Detailed description, acceptance criteria, etc.' },
                    status: { type: 'STRING', enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'], description: 'Initial status' },
                    assignee: { type: 'STRING', enum: ['STRATEGIST', 'BUILDER', 'AUDITOR', 'SRE'], description: 'Agent assigned to this task' }
                },
                required: ['id', 'title', 'description', 'status', 'assignee']
            }
        };

        try {
            const response = await client.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema,
                }
            });

            const text = response.text || '[]';
            return JSON.parse(text) as ScrumTask[];
        } catch (error) {
            console.error('Error generating Backlog with Gemini:', error);
            throw error;
        }
    }
}
