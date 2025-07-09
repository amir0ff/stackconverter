const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Mock external dependencies BEFORE importing routes
jest.mock('../utils/gemini');
jest.mock('axios');
jest.mock('multer');

// Set environment for CAPTCHA testing
process.env.NODE_ENV = 'production';

// Mock multer
jest.mock('multer', () => {
  const mockMulter = {
    single: jest.fn().mockReturnValue((req, res, next) => {
      // Check file type validation
      const file = req.files?.[0] || req.file;
      if (file) {
        const ext = file.originalname.toLowerCase().split('.').pop();
        const allowedExts = ['zip', 'js', 'jsx', 'ts', 'tsx', 'vue', 'svelte'];
        const dangerousExts = ['exe', 'sh', 'bat', 'cmd', 'php', 'py', 'rb', 'dll'];
        
        if (dangerousExts.includes(ext)) {
          return res.status(400).json({ error: 'Only .zip, .js, .jsx, .ts, .tsx, .vue, .svelte files are allowed!' });
        }
        
        if (file.size > 20 * 1024 * 1024) {
          return res.status(400).json({ error: 'File too large' });
        }
        
        req.file = {
          filename: 'test-file.zip',
          originalname: file.originalname,
          size: file.size || 1024
        };
      }
      next();
    })
  };
  return jest.fn().mockReturnValue(mockMulter);
});

// Now import the routes after mocking
const corsMiddleware = require('../middleware/cors').corsMiddleware;
const errorHandler = require('../middleware/errorHandler').errorHandler;
const detectStackRoute = require('../routes/detectStack');
const convertRoute = require('../routes/convert');
const uploadRoute = require('../routes/upload');
const batchConvertRoute = require('../routes/batchConvert');

// Create Express app for testing
const app = express();

// Set up the app for testing
app.use(corsMiddleware);
app.use(express.json({ limit: '50mb' }));

// Mount routes with proper error handling
app.use('/detect-stack', detectStackRoute);
app.use('/convert', convertRoute);
app.use('/upload', uploadRoute);
app.use('/batch-convert', batchConvertRoute);

app.get('/', (req, res) => {
  res.send('Stack Converter backend is running.');
});

// Add 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get the mocked modules
    const geminiUtils = require('../utils/gemini');
    const multer = require('multer');
    
    // Reset mocks to default values
    geminiUtils.buildPrompt.mockReturnValue('Mock prompt');
    geminiUtils.buildDetectionPrompt.mockReturnValue('Mock detection prompt');
    geminiUtils.stripCodeBlock.mockImplementation(code => code);
    geminiUtils.verifyCaptcha.mockResolvedValue(true);
    
    // Mock genAI function to return an object with generateContent
    geminiUtils.genAI.mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => 'Converted code here'
        }
      })
    });
  });

  afterEach(() => {
    // Clean up any test files
    const uploadsDir = path.join(__dirname, '../uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        if (file.startsWith('test-')) {
          fs.unlinkSync(path.join(uploadsDir, file));
        }
      });
    }
  });

  describe('Complete Conversion Workflow', () => {
    it('should handle complete React to Vue conversion workflow', async () => {
      const sourceCode = `
        import React, { useState, useEffect } from 'react';
        
        function Counter() {
          const [count, setCount] = useState(0);
          
          useEffect(() => {
            document.title = \`Count: \${count}\`;
          }, [count]);
          
          return (
            <div>
              <p>Count: {count}</p>
              <button onClick={() => setCount(count + 1)}>Increment</button>
            </div>
          );
        }
        
        export default Counter;
      `;

      // Step 1: Detect stack
      const detectResponse = await request(app)
        .post('/detect-stack')
        .send({ sourceCode })
        .expect(200);

      expect(detectResponse.body.detectedStack).toBeDefined();

      // Step 2: Convert code
      const convertResponse = await request(app)
        .post('/convert')
        .send({
          sourceCode,
          sourceStack: 'react',
          targetStack: 'vue'
        })
        .expect(200);

      expect(convertResponse.body.convertedCode).toBeDefined();
    });

    it('should handle Vue to React conversion workflow', async () => {
      const sourceCode = `
        <template>
          <div>
            <p>Count: {{ count }}</p>
            <button @click="increment">Increment</button>
          </div>
        </template>
        
        <script setup>
        import { ref, onMounted } from 'vue';
        
        const count = ref(0);
        
        const increment = () => {
          count.value++;
        };
        
        onMounted(() => {
          document.title = \`Count: \${count.value}\`;
        });
        </script>
      `;

      // Step 1: Detect stack
      const detectResponse = await request(app)
        .post('/detect-stack')
        .send({ sourceCode })
        .expect(200);

      expect(detectResponse.body.detectedStack).toBeDefined();

      // Step 2: Convert code
      const convertResponse = await request(app)
        .post('/convert')
        .send({
          sourceCode,
          sourceStack: 'vue',
          targetStack: 'react'
        })
        .expect(200);

      expect(convertResponse.body.convertedCode).toBeDefined();
    });
  });

  describe('Batch Conversion Workflow', () => {
    it('should handle batch conversion with missing filename', async () => {
      const response = await request(app)
        .post('/batch-convert')
        .send({
          sourceStack: 'react',
          targetStack: 'vue'
        })
        .expect(400);

      expect(response.body.error).toBe('No filename provided.');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .post('/convert')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/convert')
        .send({ sourceCode: 'test' }) // Missing sourceStack and targetStack
        .expect(400);

      expect(response.body.error).toBe('Missing required fields.');
    });

    it('should handle empty source code', async () => {
      const response = await request(app)
        .post('/detect-stack')
        .send({ sourceCode: '' })
        .expect(400);

      expect(response.body.error).toBe('No source code provided.');
    });
  });

  describe('Cross-Stack Conversion Matrix', () => {
    const testCases = [
      { from: 'react', to: 'vue' },
      { from: 'vue', to: 'react' }
    ];
    const testCode = 'const Component = () => <div>Hello</div>;';

    testCases.forEach(({ from, to }) => {
      it(`should convert from ${from} to ${to}`, async () => {
        const response = await request(app)
          .post('/convert')
          .send({
            sourceCode: testCode,
            sourceStack: from,
            targetStack: to
          })
          .expect(200);

        expect(response.body.convertedCode).toBeDefined();
      });
    });
  });

  describe('Health Check and Server Status', () => {
    it('should respond to health check', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toBe('Stack Converter backend is running.');
    });

    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body.error).toBeDefined();
    });
  });

}); 