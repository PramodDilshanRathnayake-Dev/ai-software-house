import mongoose, { Schema, Document } from 'mongoose';

export interface ScrumTask {
    id: string;
    title: string;
    description: string;
    status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    assignee?: 'STRATEGIST' | 'BUILDER' | 'AUDITOR' | 'SRE';
}

export interface IMissionContext extends Document {
    projectId: string;
    prd: string;
    backlog: ScrumTask[];
    currentSprint: string;
    status: 'INTAKE' | 'DEVELOPMENT' | 'AUDIT' | 'DEPLOYMENT' | 'DEPLOYED';
    artifacts: {
        codeRepositoryUrl: string;
        proofOfWorkVideos: string[];
        logs: string[];
    };
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
});

const MissionContextSchema = new Schema<IMissionContext>({
    projectId: { type: String, required: true, unique: true },
    prd: { type: String, default: '' },
    backlog: { type: [ScrumTaskSchema], default: [] },
    currentSprint: { type: String, default: 'Sprint 1' },
    status: { type: String, enum: ['INTAKE', 'DEVELOPMENT', 'AUDIT', 'DEPLOYMENT', 'DEPLOYED'], default: 'INTAKE' },
    artifacts: {
        codeRepositoryUrl: { type: String, default: '' },
        proofOfWorkVideos: { type: [String], default: [] },
        logs: { type: [String], default: [] },
    },
    sharedState: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export default mongoose.model<IMissionContext>('MissionContext', MissionContextSchema);
