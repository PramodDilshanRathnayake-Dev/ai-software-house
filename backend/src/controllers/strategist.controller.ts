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

export const handleMidSprintDiscussion = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Missing prompt in request body' });
        }

        const mission = await MissionContext.findOne({ projectId });
        if (!mission) {
            return res.status(404).json({ error: 'Mission not found' });
        }

        console.log(`[Strategist] Processing mid-sprint request for ${projectId}: ${prompt}`);

        // Use strategist to generate a backlog for the isolated prompt
        const newTasks = await strategist.generateBacklog(`Context: The user has an ongoing project and needs to add a new requirement mid-sprint. Requirement: ${prompt}`);

        // Append generated tasks to the backlog
        mission.backlog.push(...newTasks);
        await mission.save();

        console.log(`[Strategist] Appended ${newTasks.length} new tasks to backlog.`);

        res.status(200).json({
            message: 'Successfully added new requirements to backlog',
            newTasks,
            mission
        });
    } catch (error: any) {
        console.error('[Strategist Controller Error]', error);
        res.status(500).json({ error: 'Failed to process discussion', details: error.message });
    }
};
