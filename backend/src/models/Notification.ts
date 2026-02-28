import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    missionId?: string; // Optional if it's a system-wide notification
    message: string;
    type: 'ACTION_REQUIRED' | 'INFO' | 'ERROR' | 'SUCCESS';
    sender: 'STRATEGIST' | 'BUILDER' | 'AUDITOR' | 'SRE' | 'SYSTEM';
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        missionId: {
            type: String,
            required: false,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['ACTION_REQUIRED', 'INFO', 'ERROR', 'SUCCESS'],
            default: 'INFO',
        },
        sender: {
            type: String,
            enum: ['STRATEGIST', 'BUILDER', 'AUDITOR', 'SRE', 'SYSTEM'],
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
