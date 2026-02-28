import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_for_local_dev_only';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        const user = new User({ email, password, name, role });
        await user.save();

        // Generate token
        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: '7d',
        });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: user._id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error: any) {
        console.error('[Register Error]', error);
        res.status(500).json({ error: 'Server error during registration', details: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, {
            expiresIn: '7d',
        });

        res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error: any) {
        console.error('[Login Error]', error);
        res.status(500).json({ error: 'Server error during login', details: error.message });
    }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        console.error('[Profile Error]', error);
        res.status(500).json({ error: 'Server error retrieving profile', details: error.message });
    }
};

export const googleCallback = (req: Request, res: Response) => {
    try {
        const user = req.user as any;
        if (!user) {
            return res.redirect('http://localhost:3000/login?error=sso_failed');
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Redirect back to frontend with the token in URL query params
        res.redirect(`http://localhost:3000/login?token=${token}&user=${encodeURIComponent(JSON.stringify({ id: user._id, email: user.email, name: user.name, role: user.role }))}`);
    } catch (error) {
        console.error('[Google SSO Error]', error);
        res.redirect('http://localhost:3000/login?error=sso_failed');
    }
};
