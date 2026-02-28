import { getGeminiClient } from '../../services/gemini';
import MissionContext, { ScrumTask, IMissionContext } from '../../models/MissionContext';
import { getSocket } from '../../services/socket';
import * as fs from 'fs';
import * as path from 'path';

export class AuditorAgent {
    private readonly sandboxesDir = path.join(process.cwd(), 'sandboxes');

    /**
     * Executes QA review on all 'REVIEW' tasks.
     */
    async runAudit(missionId: string): Promise<void> {
        const mission = await MissionContext.findOne({ projectId: missionId });
        if (!mission) throw new Error(`Mission ${missionId} not found`);

        const reviewTasks = mission.backlog.filter((t) => t.status === 'REVIEW');

        if (reviewTasks.length === 0) {
            console.log(`[Auditor] No tasks in REVIEW status for mission ${missionId}`);
            return;
        }

        console.log(`[Auditor] Starting audit for ${missionId}. Found ${reviewTasks.length} tasks to review.`);

        const missionSandbox = path.join(this.sandboxesDir, missionId);

        // Process each task sequentially
        for (const task of reviewTasks) {
            await this.auditTask(mission, task, missionSandbox);
        }
    }

    private async auditTask(mission: IMissionContext, task: ScrumTask, sandboxDir: string): Promise<void> {
        console.log(`[Auditor] Auditing Task: [${task.id}] ${task.title}`);

        // Since we don't have a direct database link between Task ID -> Target File written,
        // the Auditor will read ALL files in the sandbox to get context.
        const sandboxFiles = this.getAllFiles(sandboxDir);
        let allCodeContext = '';

        for (const file of sandboxFiles) {
            const relativePath = path.relative(sandboxDir, file);
            const content = fs.readFileSync(file, 'utf-8');
            allCodeContext += `\n--- FILE: ${relativePath} ---\n${content}\n`;
        }

        if (!allCodeContext) {
            console.warn(`[Auditor] No code found in sandbox for mission ${mission.projectId}. Marking task back to TODO.`);
            await MissionContext.findOneAndUpdate(
                { projectId: mission.projectId, 'backlog.id': task.id },
                { $set: { 'backlog.$.status': 'TODO' } }
            );
            return;
        }

        const prompt = `
You are 'The Auditor', an expert QA Engineering AI Agent.
Your job is to review the code currently present in the sandbox against the original Task Description and PRD.

Task ID: ${task.id}
Task Title: ${task.title}
Task Requirements: ${task.description}

PRD Context:
"${mission.prd}"

CURRENT SANDBOX CODE:
${allCodeContext}

Does the codebase successfully complete the requirements of Task ${task.id}?
Return a JSON object with two fields:
- "passed": boolean (true if it meets requirements, false otherwise)
- "feedback": string (Constructive feedback if it failed, or a positive approval message)
    `;

        const client = getGeminiClient();

        const responseSchema = {
            type: 'OBJECT',
            description: 'Audit Result',
            properties: {
                passed: { type: 'BOOLEAN', description: 'True if code meets task requirements' },
                feedback: { type: 'STRING', description: 'Review feedback' }
            },
            required: ['passed', 'feedback']
        };

        try {
            const response = await client.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema,
                }
            });

            const resultText = response.text || '{}';
            const result = JSON.parse(resultText) as { passed: boolean; feedback: string };

            console.log(`[Auditor] Task ${task.id} Audit Result: Passed=${result.passed}. Feedback: ${result.feedback}`);

            const nextStatus = result.passed ? 'DONE' : 'TODO';

            // Update task status based on audit result
            await MissionContext.findOneAndUpdate(
                { projectId: mission.projectId, 'backlog.id': task.id },
                { $set: { 'backlog.$.status': nextStatus } }
            );

            const io = getSocket();
            if (io) {
                io.to(mission.projectId).emit('task_updated', {
                    taskId: task.id,
                    status: nextStatus
                });
            }

        } catch (error) {
            console.error(`[Auditor] Failed to audit task ${task.id}:`, error);
        }
    }

    /**
     * Recursively get all files in a directory
     */
    private getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
        if (!fs.existsSync(dirPath)) return arrayOfFiles;

        const files = fs.readdirSync(dirPath);

        files.forEach((file) => {
            const fullPath = path.join(dirPath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
            } else {
                arrayOfFiles.push(fullPath);
            }
        });

        return arrayOfFiles;
    }
}
