import { Router } from 'express';
import { triggerBuilderSprint } from '../controllers/builder.controller';

const router = Router();

// POST /api/builder/start/:missionId
router.post('/start/:missionId', triggerBuilderSprint);

export default router;
