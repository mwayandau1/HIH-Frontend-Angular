# Health Interoperability Hub (HIH)

The **Health Interoperability Hub (HIH)** is a multi-faceted web platform designed to bridge communication and data exchange between patients, providers, and administrators in healthcare environments. It includes three applications:

- **Patient App**
- **Provider App**
- **Admin App**

Each app is independently developed and served to ensure flexibility and modularity.

---

## 🏗 Tech Stack

- **Angular 18**
- **NgRx** for state management
- **Tailwind CSS** for styling
- **Angular SSR** (Server Side Rendering)
- **Jest** for unit testing
- **Husky** for Git hooks (e.g., pre-commit checks)
- **ESLint + Prettier** for linting and formatting

---

## 📁 Project Structure

```
/health-interoperability-hub
│
├── src/
│   ├── apps/
│   │   ├── patient/
│   │   ├── provider/
│   │   └── admin/
│   └── libs/
│       ├── core/      → singleton services, interceptors, tokens, etc.
│       ├── shared/    → UI components, pipes, and directives shared across apps
│       └── features/  → feature modules reused between apps
│
├── .husky/             → Git hooks for enforcing checks
├── angular.json        → Angular workspace config
├── tailwind.config.ts  → Tailwind CSS config
├── tsconfig.base.json  → Shared TypeScript config
└── ...
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/health-interoperability-hub.git
cd health-interoperability-hub
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Apps Locally

Each app runs on its own port for local development:

| App      | Script                   | Port   |
| -------- | ------------------------ | ------ |
| Patient  | `npm run start:patient`  | `4201` |
| Provider | `npm run start:provider` | `4202` |
| Admin    | `npm run start:admin`    | `4203` |

```bash
# Examples
npm run start:patient
npm run start:provider
npm run start:admin
```

---

## 🔧 Useful Scripts

| Script                    | Purpose                                                 |
| ------------------------- | ------------------------------------------------------- |
| `npm run build`           | Build all apps                                          |
| `npm run test`            | Run unit tests with Jest                                |
| `npm run test:watch`      | Watch and re-run tests on file change                   |
| `npm run test:coverage`   | Generate coverage report                                |
| `npm run format`          | Format files with Prettier                              |
| `npm run lint`            | Run ESLint for static analysis                          |
| `npm run prepare`         | Install Husky Git hooks                                 |
| `npm run serve:ssr:<app>` | Serve SSR version (e.g., `health-interoperability-hub`) |

---

## ✅ Pre-commit Checks

This project uses **Husky** to enforce code quality:

- Runs tests related to staged files
- Applies ESLint and Prettier formatting

Make sure your changes pass before committing.

---

### Pre-Push Hook Overview

This `pre-push` hook enforces code quality and project health by running a series of checks before allowing a push:

1. **Stashed Changes Warning** – Alerts if you have uncommitted stashes.
2. **Linting (`npm run lint:all`)** – Ensures all code adheres to lint rules.
3. **Tests with Coverage** – Runs the full Jest test suite with coverage reporting.
4. **Coverage Threshold Check** – Blocks push if overall **statements, branches, lines, or functions** coverage is below **85%**.
5. **Build Check (`npm run build:all`)** – Verifies that all projects compile successfully.

If any step fails, the push is blocked with a clear error message. This ensures code pushed to remote is well-tested, clean, and production-ready.

---

##  Custom Fonts

The Lato font (including Light and Italic variants) is installed locally in `public/fonts` and loaded globally via `styles.css`.

---

## 📚 Storybook (Optional)

To visualize and test UI components in isolation:

```bash
npm run storybook
```

> Make sure you have Storybook installed and configured.

---

## 🛆 Environment Setup

To define app-specific environments, create these files as needed:

```
apps/<app>/src/environments/
  ├── environment.ts
  └── environment.prod.ts
```

---

## 🧪 Testing Strategy

- Unit tests: Jest
- Component isolation: Storybook (optional)
- CI-ready with format/lint/test pre-commit checks

---

## 🧹 Custom Library Imports

You can use custom paths like `@libs/core`, `@libs/shared`, and `@libs/features` thanks to path mapping in `tsconfig.base.json`.

---

## 🛠 Future Improvements

- Add e2e tests with Cypress or Playwright
- CI/CD integration
- API mocking for isolated testing
- ***

---

## 👥 Contributors

- [Darko Michael Agyeman](https://github.com/MADAkwasi)
- [Donald Wewoli Akite](https://github.com/quavo19)
