# AI Software House - MVP Feature List

This document outlines the Minimum Viable Product (MVP) features for the AI Software House platform, categorized by their current status based on recent development iterations.

## ✅ Completed Items

### 1. Project Foundation & Architecture
- [x] Initial scaffold of MERN stack / Next.js frontend.
- [x] Definition of multi-agent roles and communication protocols.
- [x] Initial UI theming (Dark/Light mode scaffold).

### 2. Multi-Agent System Core
- [x] **Strategist Agent**: Backend logic and integration for scoping, requirement gathering, and planning.
- [x] **Builder Agent (Dev)**: Backend logic, API endpoints, and frontend integration for executing tasks.

### 3. User Interface
- [x] **Main Intake Page**: UI for initial project/task submission and interaction with the Strategist.
- [x] **Scrum/Kanban Board (V1)**: Basic UI for tracking tasks, sprints, and agent progress.

### 4. DevOps, QA & Infrastructure
- [x] Local Docker containerization strategy.
- [x] CI/CD Automation Workflow structure (Feature branches -> Staging -> Master).
- [x] Initial UI/UX QA testing workflow.

---

## ⏳ Pending / In-Progress Items

### 1. User Authentication & Profiles
- [ ] Implement secure user Sign-up and Sign-in functionality.
- [ ] Add Profile management section to the header navigation.
- [ ] Session management and basic access control.

### 2. Enhanced Scrum Board & Jira-like Features
- [ ] **Agent-Managed States**: Scrum board states (To Do, In Progress, Done) should be managed autonomously by the agents, moving away from manual drag-and-drop to avoid confusion.
- [ ] **Comprehensive Task Cards**: Scrum board items must include Story Points, Progress tracking, and Subtasks.
- [ ] **Interactive Artifacts**: Make Kanban items clickable to view associated artifacts, plans, and code diffs.
- [ ] **Manual Comments (Revisit)**: Option for clients/users to put manual comments on tickets as a "revisit" or feedback mechanism.
- [ ] **Dynamic Backlog**: Enable new requirement discussions with the Strategist to be seamlessly added to the backlog during active sprints.

### 3. Client-Agent Communication
- [ ] **Notification Panel & Inbox**: Implement a dedicated inbox/notification center for the team to communicate with the client regarding required details (e.g., requesting API keys, AWS configurations, environment variables).

### 4. Agent Perspective Views (Main Navigations)
- [ ] **Dev Agent Perspective**: Add a view showing the GIT branch tree (following the feature-branching model used in this project).
- [ ] **QA Agent Perspective**: Add a dynamic Mind Map view based on requirements, displaying test status for each mind map item.
- [ ] **Ops Agent Perspective**: Add a Container Monitoring dashboard for infrastructure visibility.

### 5. UI/UX Polish
- [ ] Fix broken Light Theme styling and ensure smooth theme switching.
- [ ] General responsiveness and mobile-friendly tweaks for the internal dashboard.

### 6. Deployment & Cloud Infrastructure
- [ ] Execute AWS Deployment Strategy for Staging environment.
- [ ] Execute AWS Deployment Strategy for Production environment.
- [ ] Finalize CI/CD pipeline actions (GitHub Actions/CodePipeline) for automated testing and deployment.

### 7. System Interactivity (Optional MVP / Fast Follow)
- [ ] Real-time WebSocket server for live agent typing/progress updates on the frontend.

## 🚀 Client-Centric Product Enhancements (Platform V2)
*Strategic pivot from a "Development Tool" to a "Managed IT Outcomes Product".*

### 1. Critical Missing Features
- [ ] **Persistent State**: Supabase/PostgreSQL backend for chat history, code snippets, and session state.
- [ ] **Sandbox Execution (Live Preview)**: WebContainer API or E2B integration for live browser-based app previews.

### 2. Trust & Transparency ("Audit Trail")
- [ ] **Verifiable Proof of Work**: Links to Requirement (PM Agent), Test Plan (QA Agent), and Loom-style UI test proofs (Browser Agent).
- [ ] **Cost & Token Transparency**: "Burn Rate" dashboard showing Gemini API vs Human Dev cost comparisons.
- [ ] **Error Handling & "Self-Healing" Transparency**: Gracefully show bugs being actively resolved (e.g., "Refactoring code to fix API issue") instead of console errors.

### 3. Client Control & Export
- [ ] **"Human-in-the-Loop" Gatekeeping**: Review policies pausing for client sign-off before expensive tasks (e.g., Database Migrations).
- [ ] **Export & Deployment Pipeline**: One-click "Push to Repo", Zip Export, and Vercel/Netlify deployment hooks.
- [ ] **Contextual Documentation**: Auto-generating README.md and "How to run" guides upon feature completion.

### 4. Premium Client Experience
- [ ] **"Architect" Discovery Flow**: Structured intake form (Tech stack, App type, Target Audience) rather than a blank chat.
- [ ] **Visual Progress Tracking**: Real-time Gantt/Kanban view showing the AI's internal task list and current progress.
- [ ] **Agent Identity & Role Clarity**: Distinct UI avatars (Architect vs QA vs SRE vs Builder) for trust-building.

### 5. Immediate Next Focus: Orchestration & Self-Healing
- [ ] **SRE/Ops Agent ("Self-Healing Production Monitoring")**: Implement autonomous loop where SRE monitors project health, detects crashes, feeds stack traces to the Builder, and transparently patches/redeploys without user intervention.
