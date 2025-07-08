# ⚡ Stack Converter
[![🚀 Deploy to VPS](https://github.com/amir0ff/stackconverter/actions/workflows/deploy.yml/badge.svg)](https://github.com/amir0ff/stackconverter/actions/workflows/deploy.yml)

A full-stack, AI-powered codebase converter. Instantly convert code between frameworks (e.g., React to Vue) using Google Gemini AI.

## Monorepo Structure

- `/frontend` — Vite + React app (UI)
- `/backend` — Node.js + Express API (Gemini integration)

## Features
- 🔄 Convert code between major frameworks (React, Vue, etc.)
- 🧠 Powered by Google Gemini AI (`gemini-2.5-flash`)
- 🖥️ Modern, responsive UI
- 🚀 Monorepo for easy development and deployment

## Getting Started

### 1. Clone and Install
```bash
# Clone the repo
# Install all dependencies (frontend + backend)
pnpm install
```

### 2. Set Up Gemini API Key
- In `/backend/.env`:
  ```
  GEMINI_API_KEY=your-gemini-api-key
  PORT=5000
  ```

### 3. Run the App

**Option A: Run both frontend and backend**
```bash
pnpm dev # Both apps with file watching
```

**Option B: Run individually**
```bash
pnpm dev:backend # Nodemon watching backend

pnpm dev:frontend # Vite dev server
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000)

## Monorepo Commands

```bash
# Install all dependencies
pnpm install

# Run both apps in parallel
pnpm dev

# Build frontend
pnpm build:frontend

# Clean all node_modules
pnpm clean

# Run linting across all packages
pnpm lint
```

## Usage
- Enter your code, select source and target stacks, and click Convert.
- The backend will use Gemini AI to convert your code and return the result.

## Roadmap
See [ROADMAP.md](../ROADMAP.md) for planned features and progress.

## License
MIT 