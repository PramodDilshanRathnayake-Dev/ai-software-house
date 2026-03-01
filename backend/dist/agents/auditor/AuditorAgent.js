"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditorAgent = void 0;
const gemini_1 = require("../../services/gemini");
const MissionContext_1 = __importDefault(require("../../models/MissionContext"));
const socket_1 = require("../../services/socket");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class AuditorAgent {
    sandboxesDir = path.join(process.cwd(), 'sandboxes');
    /**
     * Executes QA review on all 'REVIEW' tasks.
     */
    async runAudit(missionId) {
        const mission = await MissionContext_1.default.findOne({ projectId: missionId });
        if (!mission)
            throw new Error(`Mission ${missionId} not found`);
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
    async auditTask(mission, task, sandboxDir) {
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
            await MissionContext_1.default.findOneAndUpdate({ projectId: mission.projectId, 'backlog.id': task.id }, { $set: { 'backlog.$.status': 'TODO' } });
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
        const client = (0, gemini_1.getGeminiClient)();
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
                model: 'gemini-flash-latest',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: responseSchema,
                }
            });
            const resultText = response.text || '{}';
            const result = JSON.parse(resultText);
            console.log(`[Auditor] Task ${task.id} Audit Result: Passed=${result.passed}. Feedback: ${result.feedback}`);
            const nextStatus = result.passed ? 'DONE' : 'TODO';
            // Update task status based on audit result
            await MissionContext_1.default.findOneAndUpdate({ projectId: mission.projectId, 'backlog.id': task.id }, { $set: { 'backlog.$.status': nextStatus } });
            const io = (0, socket_1.getSocket)();
            if (io) {
                io.to(mission.projectId).emit('task_updated', {
                    taskId: task.id,
                    status: nextStatus
                });
            }
        }
        catch (error) {
            console.error(`[Auditor] Failed to audit task ${task.id}:`, error);
        }
    }
    /**
     * Recursively get all files in a directory
     */
    getAllFiles(dirPath, arrayOfFiles = []) {
        if (!fs.existsSync(dirPath))
            return arrayOfFiles;
        const files = fs.readdirSync(dirPath);
        files.forEach((file) => {
            const fullPath = path.join(dirPath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
            }
            else {
                arrayOfFiles.push(fullPath);
            }
        });
        return arrayOfFiles;
    }
}
exports.AuditorAgent = AuditorAgent;
