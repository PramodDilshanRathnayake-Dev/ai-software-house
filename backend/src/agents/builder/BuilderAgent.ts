import { generateContent, getGeminiClient } from '../../services/gemini';
import MissionContext, { ScrumTask, IMissionContext } from '../../models/MissionContext';
import { getSocket } from '../../services/socket';
import * as fs from 'fs';
import * as path from 'path';

export class BuilderAgent {
    private readonly sandboxesDir = path.join(process.cwd(), 'sandboxes');

    constructor() {
        // Ensure the root sandboxes directory exists
        if (!fs.existsSync(this.sandboxesDir)) {
            fs.mkdirSync(this.sandboxesDir, { recursive: true });
        }
    }

    /**
     * Executes all 'TODO' tasks assigned to 'BUILDER' for a given mission.
     */
    async startSprint(missionId: string): Promise<void> {
        const mission = await MissionContext.findOne({ projectId: missionId });
        if (!mission) throw new Error(`Mission ${missionId} not found`);

        const builderTasks = mission.backlog.filter(
            (t) => t.assignee === 'BUILDER' && t.status === 'TODO'
        );

        if (builderTasks.length === 0) {
            console.log(`[Builder] No TODO tasks found for mission ${missionId}`);
            return;
        }

        console.log(`[Builder] Starting sprint for ${missionId}. Found ${builderTasks.length} tasks.`);

        // Create mission-specific sandbox directory
        const missionSandbox = path.join(this.sandboxesDir, missionId);
        if (!fs.existsSync(missionSandbox)) {
            fs.mkdirSync(missionSandbox, { recursive: true });
        }

        // Check if there are specific UI tasks or if this is the first sprint post-architecture
        const isInitialUiPhase = builderTasks.some(t => t.title.toLowerCase().includes('ui') || t.title.toLowerCase().includes('frontend') || t.description.toLowerCase().includes('interface'));

        // Process each task sequentially
        for (const task of builderTasks) {
            await this.executeTask(mission, task, missionSandbox);
        }

        // If this was a UI focused sprint (or just the first sprint), pause for CEO UI Review
        if (isInitialUiPhase) {
            console.log(`[Builder] UI Phase complete. Pausing for CEO UI Approval...`);
            await MissionContext.findOneAndUpdate(
                { projectId: mission.projectId },
                { $set: { status: 'AWAITING_UI_APPROVAL' } }
            );

            const io = getSocket();
            if (io) {
                io.to(mission.projectId).emit('mission_updated', {
                    status: 'AWAITING_UI_APPROVAL'
                });
            }
        }
    }

    private async executeTask(mission: IMissionContext, task: ScrumTask, sandboxDir: string): Promise<void> {
        console.log(`[Builder] Executing Task: [${task.id}] ${task.title}`);

        // 1. Mark task as IN_PROGRESS
        await MissionContext.findOneAndUpdate(
            { projectId: mission.projectId, 'backlog.id': task.id },
            { $set: { 'backlog.$.status': 'IN_PROGRESS' } }
        );

        const io = getSocket();
        if (io) {
            io.to(mission.projectId).emit('task_updated', {
                taskId: task.id,
                status: 'IN_PROGRESS'
            });
        }

        const prompt = `
You are 'The Builder', an expert Software Engineer Dev Agent.
Your current task is to write code based on the provided Product Requirement Document (PRD) and the specific Jira/Scrum Task Description.
You must output ONLY valid code for the file requested. Do not include markdown code block backticks (e.g. \`\`\`) in the 'codeContent' field, just raw string text.

Task ID: ${task.id}
Task Title: ${task.title}
Task Description: ${task.description}

Overall PRD:
"${mission.prd}"

Decide what the most appropriate single source code file (e.g. 'src/App.js', 'server.js', 'index.css') should be to satisfy this task. Provide both the relative file path and the full code contents.
    `;

        const client = getGeminiClient();

        const responseSchema = {
            type: 'OBJECT',
            description: 'Generated Source Code',
            properties: {
                filePath: { type: 'STRING', description: 'Relative path to the file, e.g., src/components/Button.tsx' },
                codeContent: { type: 'STRING', description: 'Raw source code contents without markdown formatting.' }
            },
            required: ['filePath', 'codeContent']
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

            const resultText = response.text || '{}';
            const result = JSON.parse(resultText) as { filePath: string; codeContent: string };

            if (result.filePath && result.codeContent) {
                // Construct absolute path and ensure directory structure exists
                const absoluteFilePath = path.join(sandboxDir, result.filePath);
                const fileDir = path.dirname(absoluteFilePath);

                if (!fs.existsSync(fileDir)) {
                    fs.mkdirSync(fileDir, { recursive: true });
                }

                // Write the generated code to the sandbox
                fs.writeFileSync(absoluteFilePath, result.codeContent, 'utf-8');
                console.log(`[Builder] Wrote code to ${absoluteFilePath}`);

                // Check off all subtasks
                if (task.subtasks) {
                    const updatedSubtasks = task.subtasks.map(st => ({ ...st, done: true }));
                    await MissionContext.findOneAndUpdate(
                        { projectId: mission.projectId, 'backlog.id': task.id },
                        { $set: { 'backlog.$.subtasks': updatedSubtasks } }
                    );
                }

                // Update task status to REVIEW
                await MissionContext.findOneAndUpdate(
                    { projectId: mission.projectId, 'backlog.id': task.id },
                    { $set: { 'backlog.$.status': 'REVIEW' } }
                );

                if (io) {
                    io.to(mission.projectId).emit('task_updated', {
                        taskId: task.id,
                        status: 'REVIEW'
                    });
                }
            } else {
                throw new Error('Gemini did not return filePath or codeContent');
            }

        } catch (error) {
            console.error(`[Builder] Failed to execute task ${task.id}:`, error);
            // Optional: Revert task back to TODO or create a BLOCKED status
        }
    }

    /**
     * Triggered by the SRE Agent when a crash occurs.
     * Analyzes the stack trace and generates a hotfix for the codebase.
     */
    async handleHotfix(missionId: string, stackTrace: string): Promise<void> {
        console.log(`[Builder] Analyzing crash report for mission ${missionId}...`);

        const mission = await MissionContext.findOne({ projectId: missionId });
        if (!mission) throw new Error(`Mission ${missionId} not found`);

        const missionSandbox = path.join(this.sandboxesDir, missionId);

        const prompt = `
You are 'The Builder', an expert Software Engineer Dev Agent.
The SRE/Ops Agent has detected a critical crash in the production environment for the current project.

Crash Report / Stack Trace:
"""
${stackTrace}
"""

Project Context (PRD):
"${mission.prd}"

Analyze the stack trace and the likely root cause. Provide the relative file path and the complete fixed code content to resolve this bug. 
Do not include markdown code block backticks (e.g. \`\`\`) in the 'codeContent' field, just raw string text.
        `;

        const client = getGeminiClient();

        const responseSchema = {
            type: 'OBJECT',
            description: 'Generated Hotfix Source Code',
            properties: {
                filePath: { type: 'STRING', description: 'Relative path to the file to fix, e.g., src/api/routes.ts' },
                codeContent: { type: 'STRING', description: 'Raw repaired source code contents without markdown formatting.' }
            },
            required: ['filePath', 'codeContent']
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

            const resultText = response.text || '{}';
            const result = JSON.parse(resultText) as { filePath: string; codeContent: string };

            if (result.filePath && result.codeContent) {
                const absoluteFilePath = path.join(missionSandbox, result.filePath);
                const fileDir = path.dirname(absoluteFilePath);

                if (!fs.existsSync(fileDir)) {
                    fs.mkdirSync(fileDir, { recursive: true });
                }

                fs.writeFileSync(absoluteFilePath, result.codeContent, 'utf-8');
                console.log(`[Builder] Applied Hotfix to ${absoluteFilePath}`);

            } else {
                throw new Error('Gemini did not return filePath or codeContent for the hotfix.');
            }

        } catch (error) {
            console.error(`[Builder] Failed to generate hotfix for mission ${missionId}:`, error);
        }
    }
}
