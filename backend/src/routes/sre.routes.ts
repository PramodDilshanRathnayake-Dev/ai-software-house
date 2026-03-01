import { Router } from 'express';
import { triggerDeploy, reportCrash, startSandbox, getSandboxStatus } from '../controllers/sre.controller';

const router = Router();

// POST /api/sre/deploy/:missionId
router.post('/deploy/:missionId', triggerDeploy);

// POST /api/sre/crash-report
router.post('/crash-report', reportCrash);

// POST /api/sre/sandbox/:missionId 
router.post('/sandbox/:missionId', startSandbox);

// GET /api/sre/sandbox/:missionId/status
router.get('/sandbox/:missionId/status', getSandboxStatus);

export default router;
