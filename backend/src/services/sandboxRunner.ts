import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { SREAgent } from '../agents/sre/SREAgent';

export class SandboxRunner {
    private activeProcesses: Map<string, ChildProcess> = new Map();
    private sreAgent: SREAgent;
    private sandboxesDir: string;

    constructor() {
        this.sreAgent = new SREAgent();
        this.sandboxesDir = path.join(process.cwd(), 'sandboxes');
    }

    /**
     * Executes the main entry point of the generated project sandbox.
     * Monitors stdout and stderr. Alerts SRE Agent if the process crashes.
     */
    public async run(missionId: string, entryFile: string = 'index.js'): Promise<void> {
        return new Promise((resolve, reject) => {
            const projectDir = path.join(this.sandboxesDir, missionId);
            const entryPath = path.join(projectDir, entryFile);

            console.log(`[SandboxRunner] Attempting to start sandbox for mission ${missionId} at ${entryPath}`);

            if (!fs.existsSync(entryPath)) {
                console.error(`[SandboxRunner] Entry file not found: ${entryPath}`);
                return reject(new Error(`Entry file not found: ${entryPath}`));
            }

            // Kill any existing process for this mission
            this.stop(missionId);

            console.log(`[SandboxRunner] Spawning Node process for ${missionId}...`);
            const child = spawn('node', [entryFile], {
                cwd: projectDir,
                stdio: ['ignore', 'pipe', 'pipe'] // Ignore stdin, pipe stdout/stderr
            });

            let errorOutput = '';

            child.stdout.on('data', (data) => {
                const msg = data.toString();
                console.log(`[Sandbox][${missionId}][STDOUT] ${msg.trim()}`);
            });

            child.stderr.on('data', (data) => {
                const msg = data.toString();
                console.error(`[Sandbox][${missionId}][STDERR] ${msg.trim()}`);
                errorOutput += msg;
            });

            child.on('error', (err) => {
                console.error(`[SandboxRunner] Failed to spawn child process for ${missionId}:`, err);
                reject(err);
            });

            child.on('exit', (code, signal) => {
                this.activeProcesses.delete(missionId);
                console.log(`[SandboxRunner] Process for ${missionId} exited with code ${code} and signal ${signal}`);

                // If non-zero exit code or stderr exists, we assume a crash occurred
                if (code !== 0 && errorOutput.length > 0) {
                    console.log(`[SandboxRunner] Detected crash for mission ${missionId}. Triggering SRE Agent...`);
                    // Offload to SRE self-healing
                    this.sreAgent.monitorAndHeal(missionId, errorOutput).catch(err => {
                        console.error(`[SandboxRunner] SRE Agent failed to heal ${missionId}:`, err);
                    });
                } else if (code === 0) {
                    resolve();
                }
            });

            this.activeProcesses.set(missionId, child);
        });
    }

    /**
     * Forcefully stops a running sandbox process.
     */
    public stop(missionId: string): void {
        const child = this.activeProcesses.get(missionId);
        if (child) {
            console.log(`[SandboxRunner] Stopping running sandbox process for ${missionId}...`);
            child.kill('SIGKILL');
            this.activeProcesses.delete(missionId);
        }
    }
}
