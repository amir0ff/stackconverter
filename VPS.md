# VPS Configuration

## Overview
- **Frontend**: `amiroff.me/stackconverter` (React SPA)
- **Backend**: `api.amiroff.me` (Node.js API on localhost:5000)

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
│                                     │
│  ┌─────────────────────────────┐    │
│  │ api.amiroff.me              │    │
│  │ (API Proxy)                 │    │
│  │ - Direct API access         │    │
│  │ - Routes to Node.js         │    │
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
# Handle React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```
**Description:**
- Enables Apache’s rewrite engine.
- If the requested path is not a real file or directory, it serves `index.html`.
- This allows your React single-page application (SPA) to handle all client-side routes, so users can refresh or deep-link to any page without getting a 404 error.

### Backend: `api.amiroff.me`
```apache
# Node.js reverse proxy for API endpoints
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/(convert|upload|batch-convert|detect-stack)
RewriteRule ^(.*)$ http://127.0.0.1:5000/$1 [P,L]
# Prevent directory listing
Options -Indexes
```
**Description:**
- Enables Apache’s rewrite engine.
- Proxies only the specified API endpoints (`/convert`, `/upload`, `/batch-convert`, `/detect-stack`) to your Node.js backend running on the same server (localhost:5000).
- The `Options -Indexes` disables directory listing.
