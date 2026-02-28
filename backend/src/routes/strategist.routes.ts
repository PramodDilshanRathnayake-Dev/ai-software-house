import { Router } from 'express';
import { handleClientIntake, getMissionStatus } from '../controllers/strategist.controller';

const router = Router();

// POST /api/strategist/intake
router.post('/intake', handleClientIntake);

// GET /api/strategist/missions
router.get('/missions', getMissionStatus);

export default router;
