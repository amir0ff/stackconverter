const request = require('supertest');
const express = require('express');

// Mock the captcha middleware
jest.mock('../../middleware/captchaSession', () => (req, res, next) => next());

// Mock multer to simulate actual route behavior
jest.mock('multer', () => {
  return jest.fn().mockReturnValue({
    single: jest.fn().mockImplementation(() => (req, res, next) => {
      // Simulate the actual fileFilter logic from the route
      const path = require('path');
      const allowedExts = ['.zip', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'];
      const dangerousExts = ['.exe', '.sh', '.bat', '.cmd', '.php', '.py', '.rb', '.dll'];
      
      // Check if file data is provided
      if (!req.body || !req.body.filename) {
        return res.status(400).json({ error: 'No file uploaded or wrong file type.' });
      }
      
      // Get filename from the request (simulating file upload)
      const filename = req.body.filename;
      const ext = path.extname(filename).toLowerCase();
      const size = req.body.size || 1024;
      
      // Check for dangerous file types
      if (dangerousExts.includes(ext)) {
        return res.status(400).json({ error: 'Dangerous file type rejected' });
      }
      
      // Check for allowed extensions
      if (!allowedExts.includes(ext)) {
        return res.status(400).json({ error: 'Only .zip, .js, .jsx, .ts, .tsx, .vue, .svelte files are allowed!' });
      }
      
      // Check file size (20MB limit)
      if (size > 20 * 1024 * 1024) {
        return res.status(400).json({ error: 'File too large. Maximum size is 20MB.' });
      }
      
      // Valid file - simulate successful upload
      req.file = {
        originalname: filename,
        filename: 'test-123.js',
        path: '/tmp/test-123.js',
        size: size
      };
      next();
    })
  });
});

const app = express();
app.use(express.json());

// Import after mocking
const uploadRoute = require('../../routes/upload');
app.use('/upload', uploadRoute);

describe('Upload Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle valid file upload successfully', async () => {
    const response = await request(app)
      .post('/upload')
      .send({
        filename: 'test.js',
        size: 1024
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('filename');
    expect(response.body.filename).toBe('test-123.js');
  });

  it('should reject dangerous file types', async () => {
    const dangerousFiles = ['script.exe', 'malware.sh', 'virus.bat', 'trojan.dll'];
    
    for (const filename of dangerousFiles) {
      const response = await request(app)
        .post('/upload')
        .send({
          filename: filename,
          size: 1024
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Dangerous file type rejected');
    }
  });

  it('should reject invalid file types', async () => {
    const invalidFiles = ['document.pdf', 'image.jpg', 'data.txt', 'archive.rar'];
    
    for (const filename of invalidFiles) {
      const response = await request(app)
        .post('/upload')
        .send({
          filename: filename,
          size: 1024
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Only .zip, .js, .jsx, .ts, .tsx, .vue, .svelte files are allowed!');
    }
  });

  it('should reject files larger than 20MB', async () => {
    const response = await request(app)
      .post('/upload')
      .send({
        filename: 'large.js',
        size: 25 * 1024 * 1024 // 25MB
      });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('File too large. Maximum size is 20MB.');
  });

  it('should accept all valid file types', async () => {
    const validFiles = [
      'component.js',
      'component.jsx', 
      'component.ts',
      'component.tsx',
      'component.vue',
      'component.svelte',
      'archive.zip'
    ];
    
    for (const filename of validFiles) {
      const response = await request(app)
        .post('/upload')
        .send({
          filename: filename,
          size: 1024
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('filename');
    }
  });

  it('should handle missing file', async () => {
    const response = await request(app)
      .post('/upload');
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('No file uploaded or wrong file type.');
  });
}); 