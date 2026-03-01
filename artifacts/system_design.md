# Antigravity AI Software House - System Design

## 1. Overview
The Antigravity AI Software House is an autonomous, multi-agent system designed to mirror a real-world Agile software development company. It leverages Google ADK and Gemini 3 Pro to handle end-to-end software product lifecycles.

## 2. Core Agents
The system consists of four primary agents that collaborate to design, build, test, and deploy software:

### 2.1 The Strategist (PM/Architect Agent)
- **Role:** Handles client intake, requirement gathering, and high-level architecture.
- **Responsibilities:** 
  - Generates Product Requirement Documents (PRDs).
  - Maintains a JSON-based Scrum Backlog.
  - Initializes the 'Mission Context' for new projects.

### 2.2 The Builder (Dev Agent)
- **Role:** Executes code development.
- **Responsibilities:**
  - Autonomous coding based on Scrum Backlog tasks.
  - Automated linting and formatting.
  - Writing and executing unit tests within Antigravity sandboxes.

### 2.3 The Auditor (QA Agent)
- **Role:** Quality Assurance and Verification.
- **Responsibilities:**
  - Uses the Antigravity Browser Agent to perform UI/UX verification.
  - Records 'Proof of Work' videos using the Antigravity browser tools.
  - Validates outputs against the initial PRDs.

### 2.4 The SRE (Ops Agent)
- **Role:** Infrastructure, Deployment, and Monitoring.
- **Responsibilities:**
  - Handles CI/CD pipelines to Google Cloud Run.
  - Monitors post-production health and logs.
  - Automates rollbacks and scaling based on metrics.

## 3. Communication: Shared 'Mission Context'
The agents communicate and synchronize their state through a shared **Mission Context**. This is a centralized state object (stored in a database like MongoDB) that maintains the pulse of the project.

### Mission Context Schema Highlights:
```typescript
interface MissionContext {
  projectId: string;
  prd: string; // Markdown or structured JSON
  backlog: ScrumTask[];
  currentSprint: string;
  status: 'INTAKE' | 'DEVELOPMENT' | 'AUDIT' | 'DEPLOYMENT';
  artifacts: {
    codeRepositoryUrl: string;
    proofOfWorkVideos: string[];
    logs: string[];
  };
  sharedState: Record<string, any>;
}
```
*Following Google's best practices, the Mission Context acts as the single source of truth, avoiding direct peer-to-peer message coupling between agents and instead using a blackboard pattern.*

## 4. Technology Stack
- **Database:** MongoDB (MERN Stack)
- **Backend:** Node.js with Express (Agentic backend, Mission Context API)
- **Frontend:** React with Vite (Founder Dashboard / UI/UX using Google Material / "Google Nanobanance" concepts)
- **AI Models:** Gemini 3 Pro via Google ADK
- **Deployment:** Google Cloud Run
