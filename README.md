# ⚡ Stack Converter
[![🚀 Deploy to VPS](https://github.com/amir0ff/stackconverter/actions/workflows/deploy.yml/badge.svg)](https://github.com/amir0ff/stackconverter/actions/workflows/deploy.yml)
![GitHub License](https://img.shields.io/github/license/amir0ff/stackconverter)

AI-powered codebase converter. Instantly convert code between frameworks (e.g., React to Vue) using Google Gemini AI.

## Monorepo Structure

- `/frontend` — Vite + React app (UI)
- `/backend` — Node.js + Express API

## Features
- 🔄 Convert code between major frameworks (React, Vue, Angular, Svelte, SolidJS, Preact)
- 🧠 Powered by Google (`gemini-2.5-flash`)
- 🚀 Monorepo for easy development and deployment

## Deployment & VPS Configuration

- **Frontend:** Deployed to https://amiroff.me/stackconverter
- **Backend:** Node.js/Express server running on localhost:5000
- **API Calls:** Frontend calls backend via `/stackconverter/api/*` (proxied through Apache .htaccess)
- **CI/CD:** Automated with GitHub Actions, rsync, and PM2 for zero-downtime deploys
- **VPS & Proxy Setup:** See [VPS.md](./VPS.md) for details on VPS setup, reverse proxy, and deployment configuration

## Getting Started

### 1. Set Up Gemini API Key
- In `/backend/.env`:
  ```
  GEMINI_API_KEY=your-gemini-api-key
  ```

### 2. Run the App

```bash
# Install all dependencies
pnpm install

# Run both apps in parallel
pnpm dev
# Or run individually:
pnpm dev:backend
pnpm dev:frontend

# Build all packages
pnpm build

# Clean all node_modules
pnpm clean

# Lint all packages
pnpm lint
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000)

## Testing

See [TESTING.md](./TESTING.md) for comprehensive testing documentation.

```bash
# Without coverage
pnpm test

# With coverage
pnpm test:coverage
```

## Roadmap
See [ROADMAP.md](./ROADMAP.md) for planned features and progress.
