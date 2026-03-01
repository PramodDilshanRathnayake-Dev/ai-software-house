# Antigravity AI Software House - Action Plan (MVP Phase 2)

This document outlines the detailed action plan for implementing the remaining core MVP features. This plan is divided into four main pillars, focused on enhancing the platform's autonomy and user experience.

---

## 🔐 Pillar 1: User Authentication & Profiles
**Goal:** Transition from basic login to a robust user environment with session persistence and profile control.

### Tasks:
- [ ] **Frontend Session Persistence:** Implement `checkAuth` logic in `AuthContext` to verify JWT on page load/refresh.
- [ ] **Protected Routes:** Create a Higher-Order Component (HOC) or middleware for Next.js to protect dashboard routes from unauthenticated users.
- [ ] **Profile Navigation:** Add a "Profile" dropdown in the main `Navbar` with "Log Out" and "Settings" options.
- [ ] **User Role UI:** Display user roles (Founder/Agent) clearly in the UI and restrict certain actions (e.g., only "Founders" can refine the backlog).

---

## 📊 Pillar 2: Enhanced Scrum Board & Agent Autonomy
**Goal:** Make the Scrum Board feel "alive" by allowing agents to manage state and providing richer task context.

### Tasks:
- [ ] **Agent-Managed Transitions:** Implement backend logic allowing agents (Builder, Auditor, SRE) to move tasks between `TODO`, `IN_PROGRESS`, and `DONE` based on their internal progress.
- [ ] **interactive Task Cards:** Enhance the `ScrumBoard` UI to make cards clickable, opening a detailed modal/drawer.
- [ ] **Artifact Integration:** Link task cards to specific artifacts (e.g., a "Create API" task links to the PRD section and the generated code).
- [ ] **Story Point Visualization:** Add visual indicators (chips/badges) for Story Points and assignee avatars on cards.

---

## 📨 Pillar 3: Client-Agent Communication (Notification Center)
**Goal:** Establish a bi-directional communication channel between the AI team and the human Founder.

### Tasks:
- [ ] **Notification Center UI:** Build a slide-out panel or dedicated inbox page in the frontend.
- [ ] **Socket.io Real-time Push:** Implement real-time notifications so the user sees agent requests (e.g., "SRE needs AWS Keys") instantly without refresh.
- [ ] **Message Schema:** Create a formal `Message` or `Inquiry` model in the backend to track agent-to-client queries.
- [ ] **Client Response Loop:** Allow the Founder to reply to agent inquiries directly from the notification center, updating the agent's context.

---

## 👁 Pillar 4: Agent Perspective Views
**Goal:** Provide specialized dashboards that reveal the "inner workings" of each agent type.

### Tasks:
- [ ] **Dev Perspective (Git Tree):** A visual representation of the Git branching model, showing current features branches and merge status.
- [ ] **QA Perspective (Mind Map):** A dynamic mind map generated from the PRD, highlighting which requirements have passed/failed Auditor checks.
- [ ] **Ops Perspective (Cloud Monitor):** A simplified dashboard showing container health, deployment logs, and system metrics.

---

## 🗓 Schedule & Commitment
We commit to tackling these pillars sequentially, starting with **Pillar 1** to ensure a secure foundation before expanding features.
