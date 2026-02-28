# AI Agent Instructions

This repository follows a strict Git CI/CD workflow that AI assistants and coding agents MUST adhere to. 

## Branching Strategy & Workflow (Git Flow)
1. **Never commit directly to `master` (or `main`) or `staging`** unless performing an explicit merge operations that require it.
2. **Develop features in new branches**. When asked to build a new feature:
   - Always branch off of `staging`. 
   - Ensure the new branch is named `feature/<feature-name>`.
3. **Running Tests**: Before recommending a PR, ensure all unit tests and linting pass (`npm test` and `npm run lint` in both `frontend` and `backend`).
4. **Pull Requests**: Once a feature is done and tested locally, it should be merged into `staging` via a Pull Request (or local merge if instructed) to trigger Staging Validation and Deployment.
5. **AWS Deployment**: Staging and Production deployments are aimed at AWS. Ensure any infrastructure code respects this.

Reference [GIT_FLOW.md](./GIT_FLOW.md) for full details on this branching strategy.
