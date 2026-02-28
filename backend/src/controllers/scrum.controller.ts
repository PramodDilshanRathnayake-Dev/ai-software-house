import { Request, Response } from 'express';
import MissionContext, { ScrumTask } from '../models/MissionContext';
import { getGeminiClient } from '../services/gemini';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const addComment = async (req: AuthRequest, res: Response) => {
    try {
        const { missionId, taskId } = req.params;
        const { text } = req.body;

        if (!text) return res.status(400).json({ error: 'Comment text is required' });

        // Use req.user if available, otherwise fallback to "Client"
        const author = req.user ? req.user.email : 'Client / User';

        const mission = await MissionContext.findOne({ projectId: missionId });
        if (!mission) return res.status(404).json({ error: 'Mission not found' });

        const taskIndex = mission.backlog.findIndex((t) => t.id === taskId);
        if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

        // Add comment
        if (!mission.backlog[taskIndex].comments) {
            mission.backlog[taskIndex].comments = [];
        }
        mission.backlog[taskIndex].comments!.push({
            author,
            text,
            createdAt: new Date()
        });

        await mission.save();

        res.json({ message: 'Comment added successfully', task: mission.backlog[taskIndex] });
    } catch (error: any) {
        console.error('[Add Comment Error]', error);
        res.status(500).json({ error: 'Failed to add comment', details: error.message });
    }
};

export const refineBacklog = async (req: AuthRequest, res: Response) => {
    try {
        const { missionId } = req.params;
        const { additionalRequirements } = req.body;

        if (!additionalRequirements) {
            return res.status(400).json({ error: 'additionalRequirements string is required.' });
        }

        const mission = await MissionContext.findOne({ projectId: missionId });
        if (!mission) return res.status(404).json({ error: 'Mission not found' });

        const prompt = `
You are 'The Strategist', an expert Technical PM Agent.
The client has provided additional requirements or scope changes to the active project.
Update the backlog by creating NEW tasks to satisfy these requirements. Do not output existing tasks.
Base your context on the original PRD and the new requirements.

Original PRD:
"${mission.prd}"

Additional Requirements from Client:
"${additionalRequirements}"

Generate a JSON array of NEW Scrum Tasks according to the provided schema. Assign the correct agent (STRATEGIST, BUILDER, AUDITOR, SRE). Include estimated storyPoints.
    `;

        const client = getGeminiClient();

        const taskSchema = {
            type: 'ARRAY',
            description: 'List of new Scrum Backlog Tasks',
            items: {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING', description: 'Task title, e.g. "Create new API endpoint"' },
                    description: { type: 'STRING', description: 'Detailed user story and acceptance criteria' },
                    assignee: { type: 'STRING', description: 'Must be one of: STRATEGIST, BUILDER, AUDITOR, SRE' },
                    storyPoints: { type: 'INTEGER', description: 'Fibonacci story point estimate e.g. 1, 2, 3, 5, 8' }
                },
                required: ['title', 'description', 'assignee', 'storyPoints']
            }
        };

        const aiResponse = await client.models.generateContent({
            model: 'gemini-flash-latest',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: taskSchema,
            }
        });

        const newTasks = JSON.parse(aiResponse.text || '[]') as any[];

        // Add UUIDs, starting status, and subtasks
        const formattedTasks: ScrumTask[] = newTasks.map(t => ({
            id: `TASK-${uuidv4().split('-')[0].toUpperCase()}`,
            title: t.title,
            description: t.description,
            status: 'TODO' as 'TODO',
            assignee: t.assignee,
            storyPoints: t.storyPoints || 0,
            subtasks: [],
            comments: []
        }));

        // Append to existing backlog
        mission.backlog.push(...formattedTasks);
        await mission.save();

        res.json({
            message: 'Backlog successfully refined',
            addedTasks: formattedTasks
        });

    } catch (error: any) {
        console.error('[Refine Backlog Error]', error);
        res.status(500).json({ error: 'Failed to refine backlog', details: error.message });
    }
};
