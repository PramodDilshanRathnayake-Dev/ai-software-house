"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerDeploy = void 0;
const SREAgent_1 = require("../agents/sre/SREAgent");
const sre = new SREAgent_1.SREAgent();
const triggerDeploy = async (req, res) => {
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
    }
    catch (error) {
        console.error('[SRE Controller Error]', error);
        res.status(500).json({ error: 'Failed to trigger SRE deployment', details: error.message });
    }
};
exports.triggerDeploy = triggerDeploy;
