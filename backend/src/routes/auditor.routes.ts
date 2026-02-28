import { Router } from 'express';
import { triggerAuditor } from '../controllers/auditor.controller';

const router = Router();

// POST /api/auditor/start/:missionId
router.post('/start/:missionId', triggerAuditor);

export default router;
