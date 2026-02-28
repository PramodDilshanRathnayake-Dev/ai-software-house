"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const strategist_routes_1 = __importDefault(require("./routes/strategist.routes"));
const builder_routes_1 = __importDefault(require("./routes/builder.routes"));
const auditor_routes_1 = __importDefault(require("./routes/auditor.routes"));
const sre_routes_1 = __importDefault(require("./routes/sre.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/strategist', strategist_routes_1.default);
app.use('/api/builder', builder_routes_1.default);
app.use('/api/auditor', auditor_routes_1.default);
app.use('/api/sre', sre_routes_1.default);
// Basic health check route
app.get('/api/health', (req, res) => {
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
        await mongoose_1.default.connect(mongoUri);
        console.log(`[database]: Connected to MongoDB successfully.`);
        app.listen(port, () => {
            console.log(`[server]: Server is running at http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error('Failed to start server', error);
        process.exit(1);
    }
};
startServer();
