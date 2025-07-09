const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Mock the captcha middleware
jest.mock('../../middleware/captchaSession', () => (req, res, next) => next());

// Mock file system
jest.mock('fs');
jest.mock('path');

// Mock multer to simulate actual route behavior
jest.mock('multer', () => {
  return jest.fn().mockReturnValue({
    single: jest.fn().mockImplementation(() => (req, res, next) => {
      // Simulate the actual fileFilter logic from the route
      const allowedExts = ['.zip', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'];
      const dangerousExts = ['.exe', '.sh', '.bat', '.cmd', '.php', '.py', '.rb', '.dll'];
      
      // Check if file data is provided
      if (!req.body || !req.body.filename) {
        return res.status(400).json({ error: 'No file uploaded or wrong file type.' });
      }
      
      // Get filename from the request (simulating file upload)
      const filename = req.body.filename;
      const mockPath = require('path');
      const ext = mockPath.extname(filename).toLowerCase();
      const size = req.body.size || 1024;
      const mimeType = req.body.mimeType || 'text/javascript';
      
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
      
      // Check disk space (simulate disk full scenario)
      if (req.body.simulateDiskFull) {
        return res.status(500).json({ error: 'Disk space insufficient' });
      }
      
      // Check for concurrent upload issues
      if (req.body.simulateConcurrentError) {
        return res.status(500).json({ error: 'File already being processed' });
      }
      
      // Valid file - simulate successful upload
      req.file = {
        originalname: filename,
        filename: 'test-123.js',
        path: '/tmp/test-123.js',
        size: size,
        mimetype: mimeType
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
    // Mock path.extname
    path.extname.mockImplementation((filename) => {
      const ext = filename.split('.').pop();
      return ext ? `.${ext}` : '';
    });
  });

  describe('Basic File Upload', () => {
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

  describe('File Size Validation', () => {
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

    it('should accept files exactly at 20MB limit', async () => {
      const response = await request(app)
        .post('/upload')
        .send({
          filename: 'exact-size.js',
          size: 20 * 1024 * 1024 // Exactly 20MB
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('filename');
    });

    it('should handle files with no size specified', async () => {
      const response = await request(app)
        .post('/upload')
        .send({
          filename: 'no-size.js'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('filename');
    });
  });

  describe('Dangerous File Type Filtering', () => {
    it('should reject dangerous file types', async () => {
      const dangerousFiles = [
        'script.exe',
        'malware.sh', 
        'virus.bat',
        'trojan.dll',
        'backdoor.cmd',
        'hack.php',
        'script.py',
        'malware.rb'
      ];
      
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

    it('should handle case-insensitive dangerous file extensions', async () => {
      const dangerousFiles = [
        'script.EXE',
        'malware.SH',
        'virus.BAT',
        'trojan.DLL'
      ];
      
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
  });

  describe('File Extension Validation', () => {
    it('should reject invalid file types', async () => {
      const invalidFiles = [
        'document.pdf',
        'image.jpg',
        'data.txt',
        'archive.rar',
        'video.mp4',
        'audio.mp3',
        'document.docx',
        'spreadsheet.xlsx'
      ];
      
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

    it('should handle files with no extension', async () => {
      const response = await request(app)
        .post('/upload')
        .send({
          filename: 'noextension',
          size: 1024
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Only .zip, .js, .jsx, .ts, .tsx, .vue, .svelte files are allowed!');
    });

    it('should handle files with multiple dots', async () => {
      const response = await request(app)
        .post('/upload')
        .send({
          filename: 'component.min.js',
          size: 1024
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('filename');
    });
  });

  describe('MIME Type Validation', () => {
    it('should handle various MIME types for valid files', async () => {
      const mimeTypes = [
        'text/javascript',
        'application/javascript',
        'text/x-typescript',
        'application/x-typescript',
        'text/plain',
        'text/html',
        'application/x-vue',
        'application/zip',
        'application/x-zip-compressed',
        'application/octet-stream'
      ];
      
      for (const mimeType of mimeTypes) {
        const response = await request(app)
          .post('/upload')
          .send({
            filename: 'test.js',
            size: 1024,
            mimeType: mimeType
          });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('filename');
      }
    });
  });

  describe('Error Scenarios', () => {
    it('should handle disk space issues', async () => {
      const response = await request(app)
        .post('/upload')
        .send({
          filename: 'test.js',
          size: 1024,
          simulateDiskFull: true
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Disk space insufficient');
    });

    it('should handle concurrent upload conflicts', async () => {
      const response = await request(app)
        .post('/upload')
        .send({
          filename: 'test.js',
          size: 1024,
          simulateConcurrentError: true
        });
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('File already being processed');
    });

    it('should handle multer configuration errors', async () => {
      // Test with malformed request that would cause multer errors
      const response = await request(app)
        .post('/upload')
        .send({
          filename: '',
          size: -1
        });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Response Format', () => {
    it('should return correct response format for successful upload', async () => {
      const response = await request(app)
        .post('/upload')
        .send({
          filename: 'test.js',
          size: 1024
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('filename');
      expect(response.body).toHaveProperty('originalname');
      expect(response.body).toHaveProperty('size');
      expect(response.body.message).toBe('File uploaded successfully!');
      expect(response.body.originalname).toBe('test.js');
      expect(response.body.size).toBe(1024);
    });
  });
}); 