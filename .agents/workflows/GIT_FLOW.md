# Git Flow & CI/CD Workflow Documentation

This document describes the branching model and CI/CD automation established for the AI Software House project.

## 1. Branching Strategy

Following the [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/) (Git Flow).

### Main Branches
- **`master`** (or `main`): The production-ready branch. Only production releases are merged here.
- **`staging`**: The main integration branch for features. This reflects the latest delivered development changes for the next release.

### Supporting Branches
- **`feature/*`**: Used for developing new features.
    - **Branch from**: `staging`
    - **Merge back into**: `staging`
    - **Naming convention**: `feature/your-feature-name`

## 2. CI/CD Workflow

The project uses GitHub Actions to automate validation and deployment.

### A. Feature Validation (PR to `staging`)
- **Trigger**: Opening or updating a Pull Request from a `feature/*` branch to `staging`.
- **Workflow**: `feature-validation.yml`
- **Steps**:
    1. Checkout code.
    2. Install dependencies (Backend & Frontend).
    3. Run Linting.
    4. Run Unit Tests.
    5. Build the applications.
- **Goal**: Ensure that no breaking changes are merged into the staging environment.

### B. Staging Deployment (Push to `staging`)
- **Trigger**: When a feature is merged into `staging`.
- **Workflow**: `staging-deployment.yml`
- **Steps**:
    1. Build assets.
    2. Deploy to the Staging server (AWS).
- **Goal**: Provide a live environment for final testing and QA.

### C. Production Release (Push to `master`)
- **Trigger**: When `staging` is merged into `master` for a release.
- **Workflow**: `production-release.yml`
- **Steps**:
    1. Final Production Build.
    2. Deploy to Production server.
- **Goal**: Automate the release process once high confidence is achieved in staging.

## 3. How to use

1. **Start a feature**:
   ```bash
   git checkout staging
   git pull origin staging
   git checkout -b feature/new-logic
   ```
2. **Commit changes**:
   ```bash
   git add .
   git commit -m "Add new logic"
   ```
3. **Open a Pull Request**:
   - Push to origin: `git push origin feature/new-logic`
   - Open PR on GitHub: `feature/new-logic` → `staging`.
4. **Merge**:
   - Once CI passes and review is done, merge to `staging`.
5. **Release**:
   - When ready for production, open PR: `staging` → `master`.
