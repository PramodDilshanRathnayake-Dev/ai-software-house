# AI Software House - MVP Feature List

This document outlines the Minimum Viable Product (MVP) features for the AI Software House platform, categorized by their current status based on recent development iterations.

## ✅ Completed Items

### 1. Project Foundation & Architecture
- [x] Initial scaffold of MERN stack / Next.js frontend.
- [x] Definition of multi-agent roles and communication protocols.
- [x] Initial UI theming (Dark/Light mode scaffold).

### 2. Multi-Agent System Core
- [x] **Strategist Agent**: Backend logic and integration for scoping, requirement gathering, and planning.
- [x] **Builder Agent**: Backend logic, API endpoints, and frontend integration for executing tasks.

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

### 2. Enhanced Kanban & Sprint Management
- [ ] **Interactive Artifacts**: Make Kanban items clickable to view associated artifacts, plans, and code diffs.
- [ ] **Dynamic Backlog**: Enable new requirement discussions with the Strategist to be seamlessly added to the backlog during active sprints.
- [ ] Fully cross-functional Drag-and-Drop state management for the Scrum board.

### 3. UI/UX Polish
- [ ] Fix broken Light Theme styling and ensure smooth theme switching.
- [ ] General responsiveness and mobile-friendly tweaks for the internal dashboard.

### 4. Deployment & Cloud Infrastructure
- [ ] Execute AWS Deployment Strategy for Staging environment.
- [ ] Execute AWS Deployment Strategy for Production environment.
- [ ] Finalize CI/CD pipeline actions (GitHub Actions/CodePipeline) for automated testing and deployment.

### 5. System Interactivity (Optional MVP / Fast Follow)
- [ ] Real-time WebSocket server for live agent typing/progress updates on the frontend.
