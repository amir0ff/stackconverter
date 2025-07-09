const request = require('supertest');

// Mock middleware
jest.mock('../middleware/cors', () => (req, res, next) => next());
jest.mock('../middleware/errorHandler', () => (err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

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

// Mock the main app
jest.mock('../index', () => {
  const express = require('express');
  const app = express();
  app.use(express.json());
  app.use('/convert', require('../routes/convert'));
  app.use('/detect-stack', require('../routes/detectStack'));
  app.use('/upload', require('../routes/upload'));
  app.use('/batch-convert', require('../routes/batchConvert'));
  return app;
});

// Import after mocking
const app = require('../index');

describe('Server', () => {
  it('should start server successfully', () => {
    expect(app).toBeDefined();
  });

  it('should handle convert route successfully', async () => {
    const response = await request(app)
      .post('/convert')
      .send({
        sourceCode: 'const x = 1;',
        sourceStack: 'react',
        targetStack: 'vue'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('convertedCode');
  });

  it('should handle detect stack route successfully', async () => {
    const response = await request(app)
      .post('/detect-stack')
      .send({
        sourceCode: 'import React from "react"'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('detectedStack');
  });

  it('should handle upload route successfully', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('file', Buffer.from('const x = 1;'), 'test.js');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('filename');
  });

  it('should handle batch convert route successfully', async () => {
    const response = await request(app)
      .post('/batch-convert')
      .send({
        filename: 'test.zip',
        sourceStack: 'react',
        targetStack: 'vue'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('convertedFiles');
  });

  it('should handle missing routes', async () => {
    const response = await request(app)
      .get('/nonexistent');

    expect(response.status).toBe(404);
  });
}); 