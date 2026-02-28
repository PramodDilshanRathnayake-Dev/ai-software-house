import { Router } from 'express';
import { addComment, refineBacklog } from '../controllers/scrum.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Add comment to a specific task
router.post('/:missionId/tasks/:taskId/comment', authenticate, addComment);

// Dynamically generate new tasks via AI
router.post('/:missionId/refine-backlog', authenticate, refineBacklog);

export default router;
