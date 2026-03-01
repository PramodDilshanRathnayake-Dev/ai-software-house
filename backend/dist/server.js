"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const socket_1 = require("./services/socket");
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const passport_2 = require("./config/passport");
const strategist_routes_1 = __importDefault(require("./routes/strategist.routes"));
const builder_routes_1 = __importDefault(require("./routes/builder.routes"));
const auditor_routes_1 = __importDefault(require("./routes/auditor.routes"));
const sre_routes_1 = __importDefault(require("./routes/sre.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const scrum_routes_1 = __importDefault(require("./routes/scrum.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ['http://localhost:3000', 'http://localhost:3001'], // Frontend port
        methods: ['GET', 'POST']
    }
});
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Session is required for Passport OAuth strategies
app.use((0, express_session_1.default)({
    secret: process.env.JWT_SECRET || 'antigravity_secret_fallback',
    resave: false,
    saveUninitialized: false,
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
(0, passport_2.configurePassport)();
// Passport session serializers (required even if we primarily use JWTs for our own API)
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const User = require('./models/User').default;
        const user = await User.findById(id);
        done(null, user);
    }
    catch (err) {
        done(err, null);
    }
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/strategist', strategist_routes_1.default);
app.use('/api/builder', builder_routes_1.default);
app.use('/api/auditor', auditor_routes_1.default);
app.use('/api/sre', sre_routes_1.default);
app.use('/api/scrum', scrum_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
// Basic health check route
app.get('/api/health', (req, res) => {
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
    socket.on('join_mission', (missionId) => {
        socket.join(missionId);
        console.log(`[Socket.io] Client ${socket.id} joined mission room: ${missionId}`);
    });
    socket.on('disconnect', () => {
        console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
});
(0, socket_1.initSocket)(io);
const startServer = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-software-house';
        console.log(`[database]: Connecting to ${mongoUri}...`);
        await mongoose_1.default.connect(mongoUri);
        console.log(`[database]: Connected to MongoDB successfully.`);
        server.listen(port, () => {
            console.log(`[server]: Socket.io + Express Server is running at http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error('Failed to start server', error);
        process.exit(1);
    }
};
startServer();
