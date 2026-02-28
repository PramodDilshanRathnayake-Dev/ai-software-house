"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerAuditor = void 0;
const AuditorAgent_1 = require("../agents/auditor/AuditorAgent");
const auditor = new AuditorAgent_1.AuditorAgent();
const triggerAuditor = async (req, res) => {
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
    }
    catch (error) {
        console.error('[Auditor Controller Error]', error);
        res.status(500).json({ error: 'Failed to trigger auditor run', details: error.message });
    }
};
exports.triggerAuditor = triggerAuditor;
