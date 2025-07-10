# VPS Configuration

## Overview
- **Frontend**: `amiroff.me/stackconverter` (React SPA)
- **Backend**: Node.js API on localhost:5000 (proxied via `amiroff.me/stackconverter/api/*`)

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

## Current .htaccess Configuration

### Root: `/public_html/.htaccess`
```apache
# StackConverter Configuration
RewriteEngine On

# Proxy API calls to backend
RewriteCond %{REQUEST_URI} ^/stackconverter/api/
RewriteRule ^stackconverter/api/(.*)$ http://127.0.0.1:5000/$1 [P,L]

# React Router SPA fallback for /stackconverter/
RewriteCond %{REQUEST_URI} ^/stackconverter/
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^stackconverter/(.*)$ /stackconverter/index.html [L]
```
**Description:**
- Proxies `/stackconverter/api/*` requests to the Node.js backend on `localhost:5000`
- Serves `/stackconverter/index.html` for all SPA routes (when not a real file/dir)
