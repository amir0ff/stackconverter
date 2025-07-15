# VPS Configuration

> **Note:** This project structure and documentation assumes you are deploying to your own VPS server with CloudPanel installed for site and service management.

## Overview
- **Frontend**: `amiroff.me/stackconverter` (React SPA)
- **Backend**: Node.js API on localhost:5000 (proxied via `amiroff.me/stackconverter/api/*`)
- **CI/CD**: Uses a self-hosted GitHub Actions runner installed on the VPS.
- **Deployment**: Workflow is clean, robust, and fully automated—no more `sudo` hacks or permission errors.

## Architecture

```
Internet
    ↓
┌─────────────────────────────────────┐
│           VPS (CloudPanel)          │
├─────────────────────────────────────┤
│  Nginx Web Server                   │
│  ┌─────────────────────────────┐    │
│  │ amiroff.me/stackconverter   │    │
│  │ (React App)                 │    │
│  │ - Serves static files       │    │
│  │ - Proxies /stackconverter/api/*  │
│  │   to backend                │    │
│  └─────────────────────────────┘    │
│                                     │
│  Node.js Backend (localhost:5000)   │
│  ┌─────────────────────────────┐    │
│  │ Express Server              │    │
│  │ - /convert                  │    │
│  │ - /upload                   │    │
│  │ - /batch-convert            │    │
│  │ - /detect-stack             │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## Nginx Vhost Configuration for StackConverter

Below is the essential vhost configuration for deploying StackConverter:

```nginx
# --- StackConverter API reverse proxy ---
# Proxies all /stackconverter/api/* requests to the local Node.js backend (port 5000)
location /stackconverter/api/ {
    proxy_pass http://127.0.0.1:5000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# --- StackConverter React frontend and assets ---
# Serves static frontend files and supports SPA routing (fallback to index.html)
location /stackconverter/ {
    alias /home/amiroff/htdocs/amiroff.me/stackconverter/;
    try_files $uri $uri/ index.html;
}
```