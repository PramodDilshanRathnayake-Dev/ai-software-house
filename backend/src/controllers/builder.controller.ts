import { Request, Response } from 'express';
import { BuilderAgent } from '../agents/builder/BuilderAgent';

const builder = new BuilderAgent();

export const triggerBuilderSprint = async (req: Request, res: Response) => {
    try {
        const { missionId } = req.params;

        if (!missionId) {
            return res.status(400).json({ error: 'Missing missionId parameter' });
        }

        // Trigger asynchronously so we don't block the request if Gemini takes a long time
        // In a real production system, this would be placed onto a job queue (like BullMQ)
        builder.startSprint(missionId).catch(err => {
            console.error(`[Builder Sprint Error] for mission ${missionId}:`, err);
        });

        res.status(202).json({
            message: 'Builder Sprint has been queued/started successfully.',
            missionId,
            status: 'PROCESSING'
        });
    } catch (error: any) {
        console.error('[Builder Controller Error]', error);
        res.status(500).json({ error: 'Failed to trigger builder sprint', details: error.message });
    }
};
