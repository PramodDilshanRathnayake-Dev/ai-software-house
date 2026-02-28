import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import { initSocket } from './services/socket';
import passport from 'passport';
import session from 'express-session';
import { configurePassport } from './config/passport';

import strategistRoutes from './routes/strategist.routes';
import builderRoutes from './routes/builder.routes';
import auditorRoutes from './routes/auditor.routes';
import sreRoutes from './routes/sre.routes';
import authRoutes from './routes/auth.routes';
import scrumRoutes from './routes/scrum.routes';
import notificationRoutes from './routes/notification.routes';

dotenv.config();

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'], // Frontend port
        methods: ['GET', 'POST']
    }
});
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Session is required for Passport OAuth strategies
app.use(session({
    secret: process.env.JWT_SECRET || 'antigravity_secret_fallback',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// Passport session serializers (required even if we primarily use JWTs for our own API)
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id: string, done) => {
    try {
        const User = require('./models/User').default;
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/strategist', strategistRoutes);
app.use('/api/builder', builderRoutes);
app.use('/api/auditor', auditorRoutes);
app.use('/api/sre', sreRoutes);
app.use('/api/scrum', scrumRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        message: 'Antigravity AI Software House Backend Running',
        agents: ['strategist', 'builder', 'auditor', 'sre']
    });
});

// Expose io for controllers to emit events
app.set('io', io);

// Socket.io connection logging
io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Allow users to subscribe to mission-specific updates
    socket.on('join_mission', (missionId: string) => {
        socket.join(missionId);
        console.log(`[Socket.io] Client ${socket.id} joined mission room: ${missionId}`);
    });

    socket.on('disconnect', () => {
        console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
});

initSocket(io);

const startServer = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-software-house';
        console.log(`[database]: Connecting to ${mongoUri}...`);
        await mongoose.connect(mongoUri);
        console.log(`[database]: Connected to MongoDB successfully.`);

        server.listen(port, () => {
            console.log(`[server]: Socket.io + Express Server is running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server', error);
        process.exit(1);
    }
};

startServer();
