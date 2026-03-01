import mongoose, { Schema, Document } from 'mongoose';

export interface ScrumTask {
    id: string;
    title: string;
    description: string;
    status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    assignee?: 'STRATEGIST' | 'BUILDER' | 'AUDITOR' | 'SRE';
    storyPoints?: number;
    subtasks?: { title: string; done: boolean }[];
    comments?: { author: string; text: string; createdAt: Date }[];
}

export interface IMissionContext extends Document {
    clientId: string;
    projectId: string;
    prd: string;
    backlog: ScrumTask[];
    currentSprint: string;
    sprintStatus: 'NOT_STARTED' | 'ACTIVE' | 'COMPLETED';
    status: 'INTAKE' | 'DEVELOPMENT' | 'AUDIT' | 'DEPLOYMENT' | 'DEPLOYED' | 'HEALING';
    artifacts: {
        codeRepositoryUrl: string;
        proofOfWorkVideos: string[];
        logs: string[];
    };
    incidents?: { id: string; error: string; status: 'DETECTED' | 'FIXING' | 'RESOLVED'; createdAt: Date }[];
    sharedState: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const ScrumTaskSchema = new Schema<ScrumTask>({
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'], default: 'TODO' },
    assignee: { type: String, enum: ['STRATEGIST', 'BUILDER', 'AUDITOR', 'SRE'] },
    storyPoints: { type: Number, default: 0 },
    subtasks: { type: [{ title: String, done: Boolean }], default: [] },
    comments: { type: [{ author: String, text: String, createdAt: { type: Date, default: Date.now } }], default: [] },
});

const MissionContextSchema = new Schema<IMissionContext>({
    clientId: { type: String, default: 'guest-client' },
    projectId: { type: String, required: true, unique: true },
    prd: { type: String, default: '' },
    backlog: { type: [ScrumTaskSchema], default: [] },
    currentSprint: { type: String, default: 'Sprint 1' },
    sprintStatus: { type: String, enum: ['NOT_STARTED', 'ACTIVE', 'COMPLETED'], default: 'NOT_STARTED' },
    status: { type: String, enum: ['INTAKE', 'DEVELOPMENT', 'AUDIT', 'DEPLOYMENT', 'DEPLOYED', 'HEALING'], default: 'INTAKE' },
    artifacts: {
        codeRepositoryUrl: { type: String, default: '' },
        proofOfWorkVideos: { type: [String], default: [] },
        logs: { type: [String], default: [] },
    },
    incidents: { type: [{ id: String, error: String, status: { type: String, enum: ['DETECTED', 'FIXING', 'RESOLVED'] }, createdAt: { type: Date, default: Date.now } }], default: [] },
    sharedState: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default mongoose.model<IMissionContext>('MissionContext', MissionContextSchema);
