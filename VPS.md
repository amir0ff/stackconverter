# VPS Configuration

## Overview
- **Frontend**: `amiroff.me/stackconverter` (React SPA)
- **Backend**: Node.js API on localhost:5000 (proxied via `/stackconverter/api/*`)

## Architecture

```
Internet
    ↓
┌─────────────────────────────────────┐
│           VPS (cPanel)              │
├─────────────────────────────────────┤
│  Apache Web Server                  │
│  ┌─────────────────────────────┐    │
│  │ amiroff.me/stackconverter   │    │
│  │ (React App)                 │    │
│  │ - Serves static files       │    │
│  │ - Proxies /api/* to backend │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│        Node.js Backend              │
│        (localhost:5000)             │
│  ┌─────────────────────────────┐    │
│  │ Express Server              │    │
│  │ - /convert                  │    │
│  │ - /upload                   │    │
│  │ - /batch-convert            │    │
│  │ - /detect-stack             │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

## Current .htaccess Files

### Frontend: `amiroff.me/stackconverter`
```apache
RewriteEngine On
# Proxy API calls to backend
RewriteCond %{REQUEST_URI} ^/stackconverter/api/
RewriteRule ^stackconverter/api/(.*)$ http://127.0.0.1:5000/$1 [P,L]
# React Router SPA fallback
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /stackconverter/index.html [L]
```
**Description:**
- Enables Apache’s rewrite engine.
- Proxies all `/stackconverter/api/*` requests to your Node.js backend running on the same server (localhost:5000).
- If the requested path is not a real file or directory, it serves `index.html` for SPA routing.
