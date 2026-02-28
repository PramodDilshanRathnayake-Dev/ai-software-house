import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

import strategistRoutes from './routes/strategist.routes';
import builderRoutes from './routes/builder.routes';
import auditorRoutes from './routes/auditor.routes';
import sreRoutes from './routes/sre.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/strategist', strategistRoutes);
app.use('/api/builder', builderRoutes);
app.use('/api/auditor', auditorRoutes);
app.use('/api/sre', sreRoutes);

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
    res.json({
        status: 'ok',
        message: 'Antigravity AI Software House Backend Running',
        agents: ['strategist', 'builder', 'auditor', 'sre']
    });
});

const startServer = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-software-house';
        console.log(`[database]: Connecting to ${mongoUri}...`);
        await mongoose.connect(mongoUri);
        console.log(`[database]: Connected to MongoDB successfully.`);

        app.listen(port, () => {
            console.log(`[server]: Server is running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server', error);
        process.exit(1);
    }
};

startServer();
