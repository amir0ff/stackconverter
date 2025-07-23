# ⚡ Stack Converter
[![🚀 Deploy to VPS](https://github.com/amir0ff/stackconverter/actions/workflows/deploy.yml/badge.svg)](https://github.com/amir0ff/stackconverter/actions/workflows/deploy.yml)
![GitHub License](https://img.shields.io/github/license/amir0ff/stackconverter)

AI-powered codebase converter. Instantly convert code between frameworks (e.g., React to Vue) using Google Gemini AI.

## Project Structure

- `/frontend` — Vite + React app (UI)
- `/backend` — Node.js + Express API

## Features
- 🔄 Convert code between major frameworks (React, Vue, Angular, Svelte, SolidJS, Preact)
- 🧠 Powered by Google `gemini-2.5-pro`
- 🚀 Monorepo for easy development and deployment

## Deployment & VPS Configuration

- **Frontend:** Deployed to `amiroff.me/stackconverter`
- **Backend:** Node.js API on `localhost:5000` (proxied via `amiroff.me/stackconverter/api/*`)
- **CI/CD:** Automated with GitHub Actions, rsync, and PM2 for zero-downtime deploys
- **VPS & Proxy Setup:** See [VPS.md](./VPS.md) for details on VPS setup, reverse proxy, and deployment configuration

## Getting Started

### 1. Set Up
- In `/backend/.env`:

Get a Gemini API Key: [here](https://aistudio.google.com/apikey)
  ```
  GEMINI_API_KEY=xxx
  ```

### 2. Install & Run

```bash
# Install
pnpm install

# Run both frontend and backend dev servers
pnpm dev
```

## Testing
See [TESTING.md](./TESTING.md) for comprehensive testing documentation.

## Roadmap
See [ROADMAP.md](./ROADMAP.md) for planned features and progress.
