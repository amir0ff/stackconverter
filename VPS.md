# VPS Configuration

## Overview
- **Frontend**: `amiroff.me/stackconverter` (React SPA)
- **Backend**: `api.amiroff.me` (Node.js API on localhost:5000)

## Architecture

```
Internet
    ↓
┌─────────────────────────────────────┐
│           VPS (cPanel)             │
├─────────────────────────────────────┤
│  Apache Web Server                 │
│  ┌─────────────────────────────┐   │
│  │ amiroff.me/stackconverter  │   │
│  │ (React App)                 │   │
│  │ - Serves static files       │   │
│  │ - Proxies /api/* to backend│   │
│  └─────────────────────────────┘   │
│                                   │
│  ┌─────────────────────────────┐   │
│  │ api.amiroff.me             │   │
│  │ (API Proxy)                │   │
│  │ - Direct API access        │   │
│  │ - Routes to Node.js        │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│        Node.js Backend             │
│        (localhost:5000)            │
│  ┌─────────────────────────────┐   │
│  │ Express Server              │   │
│  │ - /convert                  │   │
│  │ - /upload                   │   │
│  │ - /batch-convert            │   │
│  │ - /detect-stack             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

## Current .htaccess Files

### Frontend: `amiroff.me/stackconverter`
**File**: `/public_html/stackconverter/.htaccess`
```apache
RewriteEngine On
# Proxy API calls to backend
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://127.0.0.1:5000/$1 [P,L]
# Handle React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Backend: `api.amiroff.me`
**File**: `/public_html/.htaccess`
```apache
# Node.js reverse proxy for API endpoints
RewriteEngine On
RewriteCond %{REQUEST_URI} ^/(convert|upload|batch-convert|detect-stack)
RewriteRule ^(.*)$ http://127.0.0.1:5000/$1 [P,L]
```

## Adding New API Endpoints

### Step 1: Update Backend .htaccess
Add new endpoint to the RewriteCond:
```apache
RewriteCond %{REQUEST_URI} ^/(convert|upload|batch-convert|detect-stack|new-endpoint)
```

### Step 2: Test
```bash
# Test direct access
curl -X POST https://api.amiroff.me/new-endpoint

# Test frontend proxy
curl -X POST https://amiroff.me/stackconverter/api/new-endpoint
```
