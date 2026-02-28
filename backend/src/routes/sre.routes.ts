import { Router } from 'express';
import { triggerDeploy } from '../controllers/sre.controller';

const router = Router();

// POST /api/sre/deploy/:missionId
router.post('/deploy/:missionId', triggerDeploy);

export default router;
