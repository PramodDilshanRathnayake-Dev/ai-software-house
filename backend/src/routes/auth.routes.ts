import { Router } from 'express';
import { register, login, getProfile, googleCallback } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import passport from 'passport';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getProfile);

// Google SSO Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login?error=sso_failed' }), googleCallback);

export default router;
