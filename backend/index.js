// backend/index.js
const express = require('express');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const { corsMiddleware } = require('./middleware/cors');
const { errorHandler } = require('./middleware/errorHandler');
const detectStackRoute = require('./routes/detectStack');
const convertRoute = require('./routes/convert');
const uploadRoute = require('./routes/upload');
const batchConvertRoute = require('./routes/batchConvert');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(corsMiddleware);
app.use(cookieParser());
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads/');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

function cleanUploadsDir() {
  const uploadsDir = path.join(__dirname, 'uploads');
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('[Cleanup] Failed to read uploads directory:', err);
      return;
    }
    let deleted = 0;
    for (const file of files) {
      fs.unlink(path.join(uploadsDir, file), (err) => {
        if (!err) deleted++;
      });
    }
    if (files.length > 0) {
      console.info(`[Cleanup] Deleted ${files.length} file(s) from uploads directory.`);
    } else {
      console.info('[Cleanup] No files to delete in uploads directory.');
    }
  });
}

// Clean on server start
cleanUploadsDir();

// Clean every 30 minutes
setInterval(cleanUploadsDir, 30 * 60 * 1000);

// Mount routes
app.use('/detect-stack', detectStackRoute);
app.use('/convert', convertRoute);
app.use('/upload', uploadRoute);
app.use('/batch-convert', batchConvertRoute);

app.get('/', (req, res) => {
  res.send('Stack Converter backend is running.');
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

module.exports = app; 