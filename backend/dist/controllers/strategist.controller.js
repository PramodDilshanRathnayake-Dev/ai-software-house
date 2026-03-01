"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMidSprintDiscussion = exports.getMissionStatus = exports.handleClientIntake = void 0;
const StrategistAgent_1 = require("../agents/strategist/StrategistAgent");
const MissionContext_1 = __importDefault(require("../models/MissionContext"));
const uuid_1 = require("uuid");
const strategist = new StrategistAgent_1.StrategistAgent();
const handleClientIntake = async (req, res) => {
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
        const newMission = new MissionContext_1.default({
            projectId: (0, uuid_1.v4)(),
            prd,
            backlog,
            status: 'AWAITING_ARCH_APPROVAL', // Start in approval gate state for CEO Review
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
    }
    catch (error) {
        console.error('[Strategist Controller Error]', error);
        res.status(500).json({ error: 'Failed to process intake request', details: error.message });
    }
};
exports.handleClientIntake = handleClientIntake;
const getMissionStatus = async (req, res) => {
    try {
        const missions = await MissionContext_1.default.find().sort({ createdAt: -1 }).limit(10);
        res.json(missions);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch missions' });
    }
};
exports.getMissionStatus = getMissionStatus;
const handleMidSprintDiscussion = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Missing prompt in request body' });
        }
        const mission = await MissionContext_1.default.findOne({ projectId });
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
    }
    catch (error) {
        console.error('[Strategist Controller Error]', error);
        res.status(500).json({ error: 'Failed to process discussion', details: error.message });
    }
};
exports.handleMidSprintDiscussion = handleMidSprintDiscussion;
