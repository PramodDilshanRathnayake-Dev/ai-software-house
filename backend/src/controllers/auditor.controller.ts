import { Request, Response } from 'express';
import { AuditorAgent } from '../agents/auditor/AuditorAgent';

const auditor = new AuditorAgent();

export const triggerAuditor = async (req: Request, res: Response) => {
    try {
        const { missionId } = req.params;

        if (!missionId) {
            return res.status(400).json({ error: 'Missing missionId parameter' });
        }

        // Trigger asynchronously so we don't block the request if Gemini takes a long time
        auditor.runAudit(missionId).catch(err => {
            console.error(`[Auditor Error] for mission ${missionId}:`, err);
        });

        res.status(202).json({
            message: 'Auditor review has been queued/started successfully.',
            missionId,
            status: 'PROCESSING'
        });
    } catch (error: any) {
        console.error('[Auditor Controller Error]', error);
        res.status(500).json({ error: 'Failed to trigger auditor run', details: error.message });
    }
};
