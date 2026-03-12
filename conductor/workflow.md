# Conductor Workflow Rules

## Implementation
- **TDD Strictness**: Optional, but validation is required.
- **Commit Strategy**: We will logically group commits by feature/task. Since Git may not be actively managed by the user, we will bypass git checks or automate them locally. Wait, since the AI might not be able to easily `git commit`, we'll focus on delivering correct files.
- **Verification Rule**: Each phase of a track must be verified before proceeding.

## Process
1. Initialize Track: Create Next.js structure.
2. Build Track by Track sequentially.
