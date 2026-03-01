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

export const reportCrash = async (req: Request, res: Response) => {
    try {
        const { missionId, stackTrace } = req.body;

        if (!missionId || !stackTrace) {
            return res.status(400).json({ error: 'missionId and stackTrace are required' });
        }

        // Trigger asynchronously to avoid blocking the request
        sre.monitorAndHeal(missionId, stackTrace).catch((err: any) => {
            console.error(`[SRE Controller] Error during self-healing for ${missionId}:`, err);
        });

        res.status(202).json({
            message: 'Crash report received. SRE Agent is initiating self-healing loop.',
            status: 'HEALING'
        });

    } catch (error: any) {
        console.error('Error in reportCrash:', error);
        res.status(500).json({ error: 'Internal server error while reporting crash', details: error.message });
    }
};

export const startSandbox = async (req: Request, res: Response) => {
    try {
        const { missionId } = req.params;
        if (!missionId) {
            return res.status(400).json({ error: 'missionId is required' });
        }

        const { SandboxRunner } = await import('../services/sandboxRunner');
        const runner = new SandboxRunner();

        // Start asynchronously
        runner.run(missionId).catch(err => {
            console.error(`[SandboxRunner Controller] Error:`, err);
        });

        res.status(202).json({
            message: `Sandbox execution started for mission ${missionId}`,
            status: 'EXECUTING'
        });

    } catch (error: any) {
        res.status(500).json({ error: 'Failed to start sandbox', details: error.message });
    }
};
