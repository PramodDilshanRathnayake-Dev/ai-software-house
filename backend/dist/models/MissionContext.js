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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ScrumTaskSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'], default: 'TODO' },
    assignee: { type: String, enum: ['STRATEGIST', 'BUILDER', 'AUDITOR', 'SRE'] },
    storyPoints: { type: Number, default: 0 },
    subtasks: { type: [{ title: String, done: Boolean }], default: [] },
    comments: { type: [{ author: String, text: String, createdAt: { type: Date, default: Date.now } }], default: [] },
});
const MissionContextSchema = new mongoose_1.Schema({
    clientId: { type: String, default: 'guest-client' },
    projectId: { type: String, required: true, unique: true },
    prd: { type: String, default: '' },
    backlog: { type: [ScrumTaskSchema], default: [] },
    currentSprint: { type: String, default: 'Sprint 1' },
    sprintStatus: { type: String, enum: ['NOT_STARTED', 'ACTIVE', 'COMPLETED'], default: 'NOT_STARTED' },
    status: { type: String, enum: ['INTAKE', 'PLANNING', 'AWAITING_ARCH_APPROVAL', 'AWAITING_UI_APPROVAL', 'DEVELOPMENT', 'AUDIT', 'DEPLOYMENT', 'DEPLOYED', 'HEALING'], default: 'INTAKE' },
    artifacts: {
        codeRepositoryUrl: { type: String, default: '' },
        proofOfWorkVideos: { type: [String], default: [] },
        logs: { type: [String], default: [] },
    },
    incidents: { type: [{ id: String, error: String, status: { type: String, enum: ['DETECTED', 'FIXING', 'RESOLVED'] }, createdAt: { type: Date, default: Date.now } }], default: [] },
    sharedState: { type: mongoose_1.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
exports.default = mongoose_1.default.model('MissionContext', MissionContextSchema);
