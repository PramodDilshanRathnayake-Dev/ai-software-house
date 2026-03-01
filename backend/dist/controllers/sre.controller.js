"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSandbox = exports.reportCrash = exports.triggerDeploy = void 0;
const SREAgent_1 = require("../agents/sre/SREAgent");
const sre = new SREAgent_1.SREAgent();
const triggerDeploy = async (req, res) => {
    try {
        const { missionId } = req.params;
        if (!missionId) {
            return res.status(400).json({ error: 'Missing missionId parameter' });
        }
        // Trigger asynchronously off-thread
        sre.deployMission(missionId).catch(err => {
            console.error(`[SRE Deploy Error] for mission ${missionId}:`, err);
        });
        res.status(202).json({
            message: 'SRE Deployment pipeline has been triggered successfully.',
            missionId,
            status: 'PROCESSING'
        });
    }
    catch (error) {
        console.error('[SRE Controller Error]', error);
        res.status(500).json({ error: 'Failed to trigger SRE deployment', details: error.message });
    }
};
exports.triggerDeploy = triggerDeploy;
const reportCrash = async (req, res) => {
    try {
        const { missionId, stackTrace } = req.body;
        if (!missionId || !stackTrace) {
            return res.status(400).json({ error: 'missionId and stackTrace are required' });
        }
        // Trigger asynchronously to avoid blocking the request
        sre.monitorAndHeal(missionId, stackTrace).catch((err) => {
            console.error(`[SRE Controller] Error during self-healing for ${missionId}:`, err);
        });
        res.status(202).json({
            message: 'Crash report received. SRE Agent is initiating self-healing loop.',
            status: 'HEALING'
        });
    }
    catch (error) {
        console.error('Error in reportCrash:', error);
        res.status(500).json({ error: 'Internal server error while reporting crash', details: error.message });
    }
};
exports.reportCrash = reportCrash;
const startSandbox = async (req, res) => {
    try {
        const { missionId } = req.params;
        if (!missionId) {
            return res.status(400).json({ error: 'missionId is required' });
        }
        const { SandboxRunner } = await Promise.resolve().then(() => __importStar(require('../services/sandboxRunner')));
        const runner = new SandboxRunner();
        // Start asynchronously
        runner.run(missionId).catch(err => {
            console.error(`[SandboxRunner Controller] Error:`, err);
        });
        res.status(202).json({
            message: `Sandbox execution started for mission ${missionId}`,
            status: 'EXECUTING'
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to start sandbox', details: error.message });
    }
};
exports.startSandbox = startSandbox;
