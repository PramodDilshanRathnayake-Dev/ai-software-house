import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as net from 'net';
import { SREAgent } from '../agents/sre/SREAgent';
import { getSocket } from './socket';

export class SandboxRunner {
    private activeProcesses: Map<string, { child: ChildProcess, port: number }> = new Map();
    private sreAgent: SREAgent;
    private sandboxesDir: string;
    private basePort: number = 5000;

    constructor() {
        this.sreAgent = new SREAgent();
        this.sandboxesDir = path.join(process.cwd(), 'sandboxes');
    }

    /**
     * Finds the next available port starting from the given port.
     */
    private async findAvailablePort(startPort: number): Promise<number> {
        return new Promise((resolve) => {
            let currentPort = startPort;
            const checkPort = () => {
                const server = net.createServer();
                server.listen(currentPort, () => {
                    server.once('close', () => resolve(currentPort));
                    server.close();
                });
                server.on('error', () => {
                    currentPort++;
                    checkPort();
                });
            };
            checkPort();
        });
    }

    private emitLog(missionId: string, level: 'info' | 'error', message: string) {
        const io = getSocket();
        if (io) {
            io.to(missionId).emit('sandbox_log', { level, message, timestamp: new Date().toISOString() });
        }
    }

    private emitStatus(missionId: string, status: string, data?: any) {
        const io = getSocket();
        if (io) {
            io.to(missionId).emit('sandbox_status', { status, ...data });
        }
    }

    /**
     * Executes the main entry point of the generated project sandbox.
     * Monitors stdout and stderr. Alerts SRE Agent if the process crashes.
     */
    public async run(missionId: string, entryFile: string = 'index.js'): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const projectDir = path.join(this.sandboxesDir, missionId);
            const entryPath = path.join(projectDir, entryFile);

            console.log(`[SandboxRunner] Attempting to start sandbox for mission ${missionId} at ${entryPath}`);
            this.emitLog(missionId, 'info', `Starting sandbox execution...`);

            if (!fs.existsSync(entryPath)) {
                this.emitLog(missionId, 'error', `Entry file not found: ${entryPath}`);
                console.error(`[SandboxRunner] Entry file not found: ${entryPath}`);
                return reject(new Error(`Entry file not found: ${entryPath}`));
            }

            // Kill any existing process for this mission
            this.stop(missionId);

            // Assign a port
            const port = await this.findAvailablePort(this.basePort);
            this.emitLog(missionId, 'info', `Assigned dynamic port: ${port}`);

            console.log(`[SandboxRunner] Spawning Node process for ${missionId} on port ${port}...`);
            this.emitStatus(missionId, 'STARTING', { port });

            const child = spawn('node', [entryFile], {
                cwd: projectDir,
                env: { ...process.env, PORT: port.toString() },
                stdio: ['ignore', 'pipe', 'pipe'] // Ignore stdin, pipe stdout/stderr
            });

            this.emitStatus(missionId, 'RUNNING', { port });

            let errorOutput = '';

            child.stdout.on('data', (data) => {
                const msg = data.toString();
                console.log(`[Sandbox][${missionId}][STDOUT] ${msg.trim()}`);
                this.emitLog(missionId, 'info', msg);
            });

            child.stderr.on('data', (data) => {
                const msg = data.toString();
                console.error(`[Sandbox][${missionId}][STDERR] ${msg.trim()}`);
                this.emitLog(missionId, 'error', msg);
                errorOutput += msg;
            });

            child.on('error', (err) => {
                console.error(`[SandboxRunner] Failed to spawn child process for ${missionId}:`, err);
                this.emitLog(missionId, 'error', `Failed to spawn process: ${err.message}`);
                this.emitStatus(missionId, 'ERROR', { error: err.message });
                reject(err);
            });

            child.on('exit', (code, signal) => {
                this.activeProcesses.delete(missionId);
                console.log(`[SandboxRunner] Process for ${missionId} exited with code ${code} and signal ${signal}`);
                this.emitLog(missionId, 'info', `Process exited with code ${code}`);
                this.emitStatus(missionId, 'STOPPED', { code, signal });

                // If non-zero exit code or stderr exists, we assume a crash occurred
                if (code !== 0 && errorOutput.length > 0) {
                    console.log(`[SandboxRunner] Detected crash for mission ${missionId}. Triggering SRE Agent...`);
                    this.emitLog(missionId, 'error', `Crash detected! Handing over to SRE Agent for auto-healing...`);

                    // Offload to SRE self-healing
                    this.sreAgent.monitorAndHeal(missionId, errorOutput).catch(err => {
                        console.error(`[SandboxRunner] SRE Agent failed to heal ${missionId}:`, err);
                    });
                } else if (code === 0) {
                    resolve();
                }
            });

            this.activeProcesses.set(missionId, { child, port });
        });
    }

    /**
     * Forcefully stops a running sandbox process.
     */
    public stop(missionId: string): void {
        const processInfo = this.activeProcesses.get(missionId);
        if (processInfo) {
            console.log(`[SandboxRunner] Stopping running sandbox process for ${missionId}...`);
            this.emitLog(missionId, 'info', `Forcefully stopping sandbox process...`);
            processInfo.child.kill('SIGKILL');
            this.activeProcesses.delete(missionId);
        }
    }

    /**
     * Retrieves the current status of the sandbox execution.
     */
    public getStatus(missionId: string): { status: string, port?: number } {
        const processInfo = this.activeProcesses.get(missionId);
        if (processInfo) {
            return { status: 'RUNNING', port: processInfo.port };
        }
        return { status: 'STOPPED' };
    }
}

export const sandboxRunnerInstance = new SandboxRunner();
