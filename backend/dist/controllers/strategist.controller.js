"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMissionStatus = exports.handleClientIntake = void 0;
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
