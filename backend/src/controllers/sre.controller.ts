import { Request, Response } from 'express';
import { SREAgent } from '../agents/sre/SREAgent';

const sre = new SREAgent();

export const triggerDeploy = async (req: Request, res: Response) => {
    try {
        const { missionId } = req.params;

        if (!missionId) {
            return res.status(400).json({ error: 'Missing missionId parameter' });
        }

        // Trigger asynchronously off-thread
        sre.deployMission(missionId).catch(err => {
            console.error(`[SRE Deploy Error] for mission ${missionId}:`, err);
        });

        res.status(202).json({
            message: 'SRE Deployment pipeline has been triggered successfully.',
            missionId,
            status: 'PROCESSING'
        });
    } catch (error: any) {
        console.error('[SRE Controller Error]', error);
        res.status(500).json({ error: 'Failed to trigger SRE deployment', details: error.message });
    }
};
