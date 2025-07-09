// backend/routes/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const captchaSession = require('../middleware/captchaSession');
const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream',
      'text/javascript',
      'application/javascript',
      'text/x-typescript',
      'application/x-typescript',
      'text/plain',
      'text/html',
      'application/x-vue'
    ];
    const allowedExts = ['.zip', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .zip, .js, .jsx, .ts, .tsx, .vue, .svelte files are allowed!'));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.post('/', captchaSession, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded or wrong file type.' });
      return;
    }
    res.json({
      message: 'File uploaded successfully.',
      filename: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Internal server error during upload.', details: err.message || err.toString() });
  }
});

module.exports = router; 