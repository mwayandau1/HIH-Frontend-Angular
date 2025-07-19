# 🛡️ Pre-push Hook - Husky

This Git pre-push hook ensures the following checks are passed before allowing a push:

## ✅ What it does

- Warns if you have stashed changes.
- Runs linting using `npm run lint`.
- Runs tests only for changed files using `jest --onlyChanged --passWithNoTests`.
- Performs test coverage check only for changed `.ts`/`.tsx` files.
- Blocks push if coverage is below the defined threshold (default: 75%).
- Ensures the project builds before push.

## ℹ️ Setup Notes

- Ensure `origin/develop` is available locally for diff checks.
- Coverage is only enforced if meaningful test coverage is detected.
- To ignore specific files from coverage check, use `.precommitignore`.

## 🔧 Fixing Common Issues

- **No tests found:** Ensure at least one test covers changed files. Otherwise, the script skips safely.
- **Build or lint fails:** Fix the issues locally before retrying.
- **Stashed changes warning:** This does not block the push, but you should apply or drop stashes before pushing.

---

> This hook is maintained in `husky/pre-push` and auto-runs on every `git push`.
