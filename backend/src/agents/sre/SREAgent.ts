import MissionContext from '../../models/MissionContext';

export class SREAgent {
    /**
     * Simulates a deployment to Cloud Run and marks the mission as DEPLOYED.
     * Only triggers if all tasks in the backlog are 'DONE'.
     */
    async deployMission(missionId: string): Promise<void> {
        const mission = await MissionContext.findOne({ projectId: missionId });
        if (!mission) throw new Error(`Mission ${missionId} not found`);

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
        await MissionContext.findOneAndUpdate(
            { projectId: missionId },
            { $set: { status: 'DEPLOYED' } }
        );

        console.log(`[SRE] Mission ${missionId} has been successfully deployed to Production.`);
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
