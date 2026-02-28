"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SREAgent = void 0;
const MissionContext_1 = __importDefault(require("../../models/MissionContext"));
const socket_1 = require("../../services/socket");
class SREAgent {
    /**
     * Simulates a deployment to Cloud Run and marks the mission as DEPLOYED.
     * Only triggers if all tasks in the backlog are 'DONE'.
     */
    async deployMission(missionId) {
        const mission = await MissionContext_1.default.findOne({ projectId: missionId });
        if (!mission)
            throw new Error(`Mission ${missionId} not found`);
        if (mission.status === 'DEPLOYED') {
            console.log(`[SRE] Mission ${missionId} is already deployed.`);
            return;
        }
        const unfinishedTasks = mission.backlog.filter(t => t.status !== 'DONE');
        if (unfinishedTasks.length > 0) {
            console.error(`[SRE] Deployment aborted. Mission ${missionId} has ${unfinishedTasks.length} tasks not marked as DONE.`);
            return;
        }
        console.log(`[SRE] All tasks for Mission ${missionId} are DONE. Commencing CI/CD pipeline...`);
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
        const io = (0, socket_1.getSocket)();
        if (io) {
            io.to(missionId).emit('mission_updated', {
                status: 'DEPLOYED'
            });
        }
        console.log(`[SRE] Mission ${missionId} has been successfully deployed to Production.`);
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.SREAgent = SREAgent;
