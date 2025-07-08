# ⚡ Stack Converter
[![🚀 Deploy to VPS](https://github.com/amir0ff/stackconverter/actions/workflows/deploy.yml/badge.svg)](https://github.com/amir0ff/stackconverter/actions/workflows/deploy.yml)
![GitHub License](https://img.shields.io/github/license/amir0ff/stackconverter)

A full-stack, AI-powered codebase converter. Instantly convert code between frameworks (e.g., React to Vue) using Google Gemini AI.

## Monorepo Structure

- `/frontend` — Vite + React app (UI)
- `/backend` — Node.js + Express API

## Features
- 🔄 Convert code between major frameworks (React, Vue, Angular, Svelte, SolidJS, Preact)
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

**Run both frontend and backend:**
```bash
pnpm dev
```
Or run individually:
```bash
pnpm dev:backend   # Backend (nodemon)
pnpm dev:frontend  # Frontend (Vite)
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000)

## Monorepo Commands

```bash
# Install all dependencies
pnpm install

# Run both apps in parallel
pnpm dev

# Build all packages
pnpm build

# Build frontend only
pnpm build:frontend

# Clean all node_modules
pnpm clean

# Lint all packages
pnpm lint
```

## Deployment (Production)
- **Frontend:** Deployed to https://amiroff.me/stackconverter
- **Backend:** Deployed to https://api.amiroff.me (Node.js/Express, managed by PM2)
- **API Calls:** Frontend calls backend via HTTPS (reverse proxy with Apache .htaccess)
- **CI/CD:** Automated with GitHub Actions, rsync, and PM2 for zero-downtime deploys.

## Roadmap
See [ROADMAP.md](./ROADMAP.md) for planned features and progress.
