import { Router } from 'express';
import { handleClientIntake, getMissionStatus, handleMidSprintDiscussion } from '../controllers/strategist.controller';

const router = Router();

// POST /api/strategist/intake
router.post('/intake', handleClientIntake);

// GET /api/strategist/missions
router.get('/missions', getMissionStatus);

// POST /api/strategist/missions/:projectId/discuss
router.post('/missions/:projectId/discuss', handleMidSprintDiscussion);

export default router;
