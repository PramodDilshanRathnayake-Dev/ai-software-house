import { Request, Response } from 'express';
import { StrategistAgent } from '../agents/strategist/StrategistAgent';
import MissionContext from '../models/MissionContext';
import { v4 as uuidv4 } from 'uuid';

const strategist = new StrategistAgent();

export const handleClientIntake = async (req: Request, res: Response) => {
    try {
        const { clientRequest, projectName } = req.body;

        if (!clientRequest || !projectName) {
            return res.status(400).json({ error: 'Missing clientRequest or projectName in body' });
        }

        // 1. Generate PRD
        console.log(`[Strategist] Generating PRD for: ${projectName}`);
        const prd = await strategist.generatePRD(clientRequest);

        // 2. Generate Backlog
        console.log(`[Strategist] Generating Scrum Backlog...`);
        const backlog = await strategist.generateBacklog(prd);

        // 3. Create and Save MissionContext
        const newMission = new MissionContext({
            projectId: uuidv4(),
            prd,
            backlog,
            status: 'INTAKE',
            sharedState: {
                projectName,
                originalRequest: clientRequest
            }
        });

        await newMission.save();
        console.log(`[Strategist] Successfully created MissionContext ${newMission.projectId}`);

        res.status(201).json({
            message: 'Intake processed successfully',
            missionId: newMission.projectId,
            prd,
            backlog,
        });
    } catch (error: any) {
        console.error('[Strategist Controller Error]', error);
        res.status(500).json({ error: 'Failed to process intake request', details: error.message });
    }
};

export const getMissionStatus = async (req: Request, res: Response) => {
    try {
        const missions = await MissionContext.find().sort({ createdAt: -1 }).limit(10);
        res.json(missions);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch missions' });
    }
};
