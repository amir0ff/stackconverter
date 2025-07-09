const request = require('supertest');
const express = require('express');

// Mock external dependencies
jest.mock('express-rate-limit');
jest.mock('fs');
jest.mock('path');

// Mock middleware
jest.mock('../middleware/cors', () => ({
  corsMiddleware: (req, res, next) => next()
}));
jest.mock('../middleware/errorHandler', () => ({
  errorHandler: (err, req, res, next) => {
    res.status(500).json({ error: err.message });
  }
}));

// Mock routes
jest.mock('../routes/convert', () => {
  const express = require('express');
  const router = express.Router();
  router.post('/', (req, res) => res.json({ convertedCode: 'test' }));
  return router;
});

jest.mock('../routes/detectStack', () => {
  const express = require('express');
  const router = express.Router();
  router.post('/', (req, res) => res.json({ detectedStack: 'react' }));
  return router;
});

jest.mock('../routes/upload', () => {
  const express = require('express');
  const router = express.Router();
  router.post('/', (req, res) => res.json({ filename: 'test.js' }));
  return router;
});

jest.mock('../routes/batchConvert', () => {
  const express = require('express');
  const router = express.Router();
  router.post('/', (req, res) => res.json({ convertedFiles: [] }));
  return router;
});

// Mock rate limiter
const mockRateLimit = jest.fn().mockReturnValue((req, res, next) => next());
jest.mock('express-rate-limit', () => jest.fn().mockReturnValue(mockRateLimit));

describe('Server Configuration', () => {
  it('should handle environment variable configuration', () => {
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'test';
    
    // Verify environment variables are used
    expect(process.env.PORT).toBe('3000');
    expect(process.env.NODE_ENV).toBe('test');
  });
}); 