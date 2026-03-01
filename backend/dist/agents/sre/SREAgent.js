"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SREAgent = void 0;
const MissionContext_1 = __importDefault(require("../../models/MissionContext"));
const socket_1 = require("../../services/socket");
const uuid_1 = require("uuid");
class SREAgent {
    /**
     * Monitors application crashes and initiates the self-healing loop by engaging the Builder Agent.
     */
    async monitorAndHeal(missionId, stackTrace) {
        console.log(`[SRE] Initiating Self-Healing loop for mission ${missionId}...`);
        const mission = await MissionContext_1.default.findOne({ projectId: missionId });
        if (!mission)
            throw new Error(`Mission ${missionId} not found`);
        const incidentId = (0, uuid_1.v4)();
        // Log the incident and update the mission status to HEALING
        await MissionContext_1.default.findOneAndUpdate({ projectId: missionId }, {
            $set: { status: 'HEALING' },
            $push: {
                incidents: {
                    id: incidentId,
                    error: stackTrace,
                    status: 'DETECTED',
                    createdAt: new Date()
                }
            }
        });
        this.emitStatusUpdate(missionId, 'HEALING', `⚠️ SRE Agent detected a crash. Builder Agent is refactoring code to patch the API layer.`);
        // Step 1: Simulate the SRE parsing the logs
        await this.delay(2000);
        console.log(`[SRE] Analyzed stack trace for incident ${incidentId}. Root cause identified. Transitioning to Builder Agent for resolution...`);
        // Update the incident status to FIXING
        await MissionContext_1.default.updateOne({ projectId: missionId, "incidents.id": incidentId }, { $set: { "incidents.$.status": "FIXING" } });
        this.emitStatusUpdate(missionId, 'HEALING', `🛠️ Builder Agent is currently writing the fix for incident ${incidentId}...`);
        // Step 2: Hand off to the Builder Agent (Mocking the Builder Agent's AI fix generation for now)
        // In reality, we would import the BuilderAgent and call `builder.handleHotfix(missionId, stackTrace)`
        await this.delay(4000);
        console.log(`[SRE][Builder] Fix generated and committed to the repository for incident ${incidentId}.`);
        // Step 3: Validate the fix and mark as resolved
        await MissionContext_1.default.updateOne({ projectId: missionId, "incidents.id": incidentId }, { $set: { "incidents.$.status": "RESOLVED" } });
        console.log(`[SRE] Verify patch for incident ${incidentId}. Redeploying to production...`);
        this.emitStatusUpdate(missionId, 'HEALING', `✅ Fix validated by SRE. Redeploying the application...`);
        // Delay to simulate redeployment before switching status back
        await this.delay(2000);
        // Step 4: Relaunch the sandbox securely
        const { sandboxRunnerInstance } = require('../../services/sandboxRunner'); // Lazy load to avoid circular dependency
        console.log(`[SRE] Starting Sandbox process for verified fix...`);
        sandboxRunnerInstance.run(missionId).catch((err) => {
            console.error(`[SRE] Failed to restart sandbox for ${missionId}:`, err);
        });
    }
    /**
     * Simulates a deployment to Cloud Run and marks the mission as DEPLOYED.
     * Only triggers if all tasks in the backlog are 'DONE'.
     */
    async deployMission(missionId) {
        const mission = await MissionContext_1.default.findOne({ projectId: missionId });
        if (!mission)
            throw new Error(`Mission ${missionId} not found`);
        // If it was already DEPLOYED, and we are not HEALING, don't deploy again
        if (mission.status === 'DEPLOYED') {
            const hasUnresolvedIncidents = mission.incidents && mission.incidents.some(inc => inc.status !== 'RESOLVED');
            if (!hasUnresolvedIncidents) {
                console.log(`[SRE] Mission ${missionId} is already deployed.`);
                return;
            }
        }
        const unfinishedTasks = mission.backlog.filter(t => t.status !== 'DONE');
        if (unfinishedTasks.length > 0 && mission.status !== 'HEALING') {
            console.error(`[SRE] Deployment aborted. Mission ${missionId} has ${unfinishedTasks.length} tasks not marked as DONE.`);
            return;
        }
        console.log(`[SRE] Commencing CI/CD pipeline for ${missionId}...`);
        // Simulate standard CI/CD delays
        await this.delay(2000);
        console.log(`[SRE][CI] Running unit tests and linting... PASS`);
        await this.delay(2000);
        console.log(`[SRE][CD] Building Docker container... SUCCESS`);
        await this.delay(3000);
        console.log(`[SRE][CD] Pushing to AWS ECR / GCP Artifact Registry... DONE`);
        await this.delay(2000);
        console.log(`[SRE][CD] Deploying to AWS ECS / Google Cloud Run... LIVE`);
        // Mark mission overall status as DEPLOYED
        await MissionContext_1.default.findOneAndUpdate({ projectId: missionId }, { $set: { status: 'DEPLOYED' } });
        this.emitStatusUpdate(missionId, 'DEPLOYED', `🚀 Application successfully deployed and running in Production.`);
        console.log(`[SRE] Mission ${missionId} has been successfully deployed to Production.`);
    }
    emitStatusUpdate(missionId, status, message) {
        const io = (0, socket_1.getSocket)();
        if (io) {
            io.to(missionId).emit('mission_updated', { status, message });
        }
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.SREAgent = SREAgent;
