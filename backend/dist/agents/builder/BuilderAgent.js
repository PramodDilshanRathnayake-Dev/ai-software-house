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
exports.BuilderAgent = void 0;
const gemini_1 = require("../../services/gemini");
const MissionContext_1 = __importDefault(require("../../models/MissionContext"));
const socket_1 = require("../../services/socket");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class BuilderAgent {
    sandboxesDir = path.join(process.cwd(), 'sandboxes');
    constructor() {
        // Ensure the root sandboxes directory exists
        if (!fs.existsSync(this.sandboxesDir)) {
            fs.mkdirSync(this.sandboxesDir, { recursive: true });
        }
    }
    /**
     * Executes all 'TODO' tasks assigned to 'BUILDER' for a given mission.
     */
    async startSprint(missionId) {
        const mission = await MissionContext_1.default.findOne({ projectId: missionId });
        if (!mission)
            throw new Error(`Mission ${missionId} not found`);
        const builderTasks = mission.backlog.filter((t) => t.assignee === 'BUILDER' && t.status === 'TODO');
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
        // Process each task sequentially
        for (const task of builderTasks) {
            await this.executeTask(mission, task, missionSandbox);
        }
    }
    async executeTask(mission, task, sandboxDir) {
        console.log(`[Builder] Executing Task: [${task.id}] ${task.title}`);
        // 1. Mark task as IN_PROGRESS
        await MissionContext_1.default.findOneAndUpdate({ projectId: mission.projectId, 'backlog.id': task.id }, { $set: { 'backlog.$.status': 'IN_PROGRESS' } });
        const io = (0, socket_1.getSocket)();
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
        const client = (0, gemini_1.getGeminiClient)();
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
            const result = JSON.parse(resultText);
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
                    await MissionContext_1.default.findOneAndUpdate({ projectId: mission.projectId, 'backlog.id': task.id }, { $set: { 'backlog.$.subtasks': updatedSubtasks } });
                }
                // Update task status to REVIEW
                await MissionContext_1.default.findOneAndUpdate({ projectId: mission.projectId, 'backlog.id': task.id }, { $set: { 'backlog.$.status': 'REVIEW' } });
                if (io) {
                    io.to(mission.projectId).emit('task_updated', {
                        taskId: task.id,
                        status: 'REVIEW'
                    });
                }
            }
            else {
                throw new Error('Gemini did not return filePath or codeContent');
            }
        }
        catch (error) {
            console.error(`[Builder] Failed to execute task ${task.id}:`, error);
            // Optional: Revert task back to TODO or create a BLOCKED status
        }
    }
    /**
     * Triggered by the SRE Agent when a crash occurs.
     * Analyzes the stack trace and generates a hotfix for the codebase.
     */
    async handleHotfix(missionId, stackTrace) {
        console.log(`[Builder] Analyzing crash report for mission ${missionId}...`);
        const mission = await MissionContext_1.default.findOne({ projectId: missionId });
        if (!mission)
            throw new Error(`Mission ${missionId} not found`);
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
        const client = (0, gemini_1.getGeminiClient)();
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
            const result = JSON.parse(resultText);
            if (result.filePath && result.codeContent) {
                const absoluteFilePath = path.join(missionSandbox, result.filePath);
                const fileDir = path.dirname(absoluteFilePath);
                if (!fs.existsSync(fileDir)) {
                    fs.mkdirSync(fileDir, { recursive: true });
                }
                fs.writeFileSync(absoluteFilePath, result.codeContent, 'utf-8');
                console.log(`[Builder] Applied Hotfix to ${absoluteFilePath}`);
            }
            else {
                throw new Error('Gemini did not return filePath or codeContent for the hotfix.');
            }
        }
        catch (error) {
            console.error(`[Builder] Failed to generate hotfix for mission ${missionId}:`, error);
        }
    }
}
exports.BuilderAgent = BuilderAgent;
