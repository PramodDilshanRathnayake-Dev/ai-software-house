# Antigravity AI Software House

Antigravity AI Software House is an autonomous, multi-agent system designed to mirror a real-world Agile software development company. It leverages Google ADK and Gemini 3 Pro to handle end-to-end software product lifecycles, from requirement gathering to deployment.

## 🚀 Overview

The system consists of specialized AI agents that collaborate to design, build, test, and deploy software. It uses a shared **Mission Context** as the single source of truth for project state and communication.

## 🤖 Core Agents

| Agent | Role | Responsibilities |
| :--- | :--- | :--- |
| **The Strategist** | PM / Architect | Requirement gathering, PRD generation, Backlog management. |
| **The Builder** | Developer | Autonomous coding, API development, Unit testing. |
| **The Auditor** | QA Engineer | UI/UX verification, Proof of Work recording, PRD validation. |
| **The SRE** | Ops Engineer | CI/CD pipelines, Infrastructure monitoring, Deployment. |

## 🛠 Technology Stack

- **Frontend:** Next.js 16, React 19, Material UI (MUI), Framer Motion, Tailwind CSS.
- **Backend:** Node.js, Express, Socket.io, Passport.js (Google SSO).
- **Database:** MongoDB (Mongoose).
- **AI:** Gemini 3 Pro via Google ADK.
- **DevOps:** Docker, GitHub Actions, AWS (Staging/Production).

## ✨ Key Features

- **Autonomous Workflows:** Agents manage tasks and move items through the Scrum board.
- **Mission Context:** Centralized state management for multi-agent synchronization.
- **Google SSO:** Secure authentication for users and administrators.
- **Real-time Updates:** Socket.io integration for live agent progress and notifications.
- **Proof of Work:** Automated video recordings of UI testing by the Auditor agent.

## 🛠 Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v20+)
- MongoDB (Local or Atlas)
- Google OAuth Credentials (for SSO)
- Gemini API Key

### Local Development with Docker

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/PramodDilshanRathnayake-Dev/ai-software-house.git
    cd ai-software-house
    ```

2.  **Configure Environment Variables:**
    Create `.env` files in both `backend` and `frontend` directories based on the provided examples.

3.  **Run with Docker Compose:**
    ```bash
    docker-compose up --build
    ```
    The frontend will be available at `http://localhost:3001` and the backend at `http://localhost:3000`.

## 🔄 Git Workflow

This project strictly follows the **Git Flow** branching model:

- **`master`**: Production-ready code.
- **`staging`**: Main integration branch for features.
- **`feature/*`**: Individual feature development (branched from `staging`).

Refer to [.agents/workflows/GIT_FLOW.md](.agents/workflows/GIT_FLOW.md) for detailed instructions.

## 📝 License

This project is licensed under the MIT License.
