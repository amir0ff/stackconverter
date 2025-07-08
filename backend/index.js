// backend/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const unzipper = require('unzipper');
const archiver = require('archiver');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ['https://amiroff.me', 'http://localhost:3000'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Set up multer for .zip uploads
const upload = multer({
  dest: path.join(__dirname, 'uploads/'),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream', // some zips
      'text/javascript',
      'application/javascript',
      'text/x-typescript',
      'application/x-typescript',
      'text/plain',
      'text/html', // for .vue files
      'application/x-vue' // some systems
    ];
    const allowedExts = ['.zip', '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .zip, .js, .jsx, .ts, .tsx, .vue, .svelte files are allowed!'));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads/');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Cleanup old files (older than 5 minutes for testing, change to 1 hour for production)
function cleanupOldFiles() {
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000); // 5 minutes for testing
  // const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour for production
  console.log('Running periodic cleanup...');
  console.log('Current time:', new Date().toISOString());
  console.log('Five minutes ago:', new Date(fiveMinutesAgo).toISOString());
  
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('Error reading uploads directory:', err);
      return;
    }
    console.log('Found files:', files.length);
    
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting stats for file:', file, err);
          return;
        }
        
        const fileTime = stats.mtime.getTime();
        const isOld = fileTime < fiveMinutesAgo;
        
        console.log(`File: ${file}, Modified: ${new Date(fileTime).toISOString()}, Is old: ${isOld}`);
        
        if (isOld) {
          console.log(`Attempting to delete file: ${file}`);
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Failed to delete old file:', file, err);
              console.error('Error details:', err.code, err.message);
            } else {
              console.log('Successfully cleaned up old file:', file);
            }
          });
        } else {
          console.log(`File ${file} is not old enough yet`);
        }
      });
    });
  });
}

// Cleanup ALL files on startup
function cleanupAllFilesOnStartup() {
  console.log('Running startup cleanup - deleting ALL files...');
  
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('Error reading uploads directory:', err);
      return;
    }
    console.log(`Found ${files.length} files to delete on startup`);
    
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Failed to delete file on startup:', file, err);
        } else {
          console.log('Deleted file on startup:', file);
        }
      });
    });
  });
}

// Run cleanup every 30 minutes
setInterval(cleanupOldFiles, 30 * 60 * 1000);

// Initial cleanup - delete ALL files on startup
cleanupAllFilesOnStartup();

// Rate limiting middleware (protects all endpoints)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Helper: Get file extension for target stack
function getFileExtension(targetStack, originalPath) {
  const ext = path.extname(originalPath).toLowerCase();
  
  switch (targetStack) {
    case 'vue':
      return ext.replace(/\.(js|jsx|ts|tsx)$/i, '.vue');
    case 'svelte':
      return ext.replace(/\.(js|jsx|ts|tsx)$/i, '.svelte');
    case 'angular':
      return ext.replace(/\.(js|jsx|ts|tsx)$/i, '.ts');
    case 'solid':
      return ext.replace(/\.(js|jsx|ts|tsx)$/i, '.tsx');
    case 'preact':
      return ext.replace(/\.(js|jsx|ts|tsx)$/i, '.tsx');
    default:
      return ext;
  }
}

// Helper: Build stack-specific prompt for Gemini
function buildPrompt(sourceCode, sourceStack, targetStack) {
  const stackInstructions = {
    'react': {
      'vue': `Convert this React component to Vue 3 Composition API. Use <script setup> syntax, reactive() for state, and proper Vue template structure. Convert useState to ref/reactive, useEffect to onMounted/onUnmounted, and JSX to Vue template syntax.`,
      'svelte': `Convert this React component to Svelte. Use Svelte's reactive syntax with $: for derived values, onMount for lifecycle, and proper Svelte component structure. Convert useState to let variables, useEffect to onMount, and JSX to Svelte template syntax.`,
      'angular': `Convert this React component to Angular. Use Angular's component decorator, TypeScript interfaces, and proper Angular template syntax. Convert useState to class properties, useEffect to ngOnInit/ngOnDestroy, and JSX to Angular template syntax.`,
      'solid': `Convert this React component to SolidJS. Use SolidJS's createSignal for state, createEffect for side effects, and proper SolidJS component structure. Convert useState to createSignal, useEffect to createEffect, and JSX to SolidJS syntax.`,
      'preact': `Convert this React component to Preact. Keep React-like syntax but use Preact's smaller footprint and specific optimizations.`
    },
    'vue': {
      'react': `Convert this Vue component to React. Use React hooks (useState, useEffect), functional components, and proper JSX syntax. Convert ref/reactive to useState, onMounted to useEffect, and Vue template to JSX.`,
      'svelte': `Convert this Vue component to Svelte. Use Svelte's reactive syntax, onMount for lifecycle, and proper Svelte component structure.`,
      'angular': `Convert this Vue component to Angular. Use Angular's component decorator, TypeScript interfaces, and proper Angular template syntax.`,
      'solid': `Convert this Vue component to SolidJS. Use SolidJS's createSignal for state and proper SolidJS syntax.`,
      'preact': `Convert this Vue component to Preact. Use Preact's React-like syntax with optimizations.`
    },
    'angular': {
      'react': `Convert this Angular component to React. Use React hooks, functional components, and proper JSX syntax. Convert Angular decorators to React patterns.`,
      'vue': `Convert this Angular component to Vue 3. Use Vue's Composition API, reactive state, and proper Vue template syntax.`,
      'svelte': `Convert this Angular component to Svelte. Use Svelte's reactive syntax and component structure.`,
      'solid': `Convert this Angular component to SolidJS. Use SolidJS's reactive patterns.`,
      'preact': `Convert this Angular component to Preact. Use Preact's React-like syntax.`
    },
    'svelte': {
      'react': `Convert this Svelte component to React. Use React hooks, functional components, and proper JSX syntax.`,
      'vue': `Convert this Svelte component to Vue 3. Use Vue's Composition API and template syntax.`,
      'angular': `Convert this Svelte component to Angular. Use Angular's component decorator and template syntax.`,
      'solid': `Convert this Svelte component to SolidJS. Use SolidJS's reactive patterns.`,
      'preact': `Convert this Svelte component to Preact. Use Preact's React-like syntax.`
    }
  };

  const instruction = stackInstructions[sourceStack]?.[targetStack] || 
    `Convert the following code from ${sourceStack} to ${targetStack}. Follow the target framework's best practices and conventions.`;

  return `${instruction}

Output only the converted code, with no explanations, comments, or Markdown formatting (no triple backticks).

Source code:
${sourceCode}
`;
}

// Helper: Build stack detection prompt for Gemini
function buildDetectionPrompt(sourceCode) {
  return `Analyze the following code and determine which JavaScript framework it uses. 

Available frameworks: React, Vue, Angular, Svelte, SolidJS, Preact

Look for framework-specific patterns:
- React: JSX syntax, useState, useEffect, React imports
- Vue: <template>, <script setup>, ref(), reactive(), Vue imports
- Angular: @Component decorator, Angular imports, TypeScript
- Svelte: <script>, reactive syntax, onMount, Svelte imports
- SolidJS: createSignal, createEffect, SolidJS imports
- Preact: React-like syntax but Preact imports

Return ONLY the framework name (react, vue, angular, svelte, solid, or preact) with no additional text, explanations, or formatting.

Code to analyze:
${sourceCode}`;
}

// Utility: Strip Markdown code block from Gemini API response
function stripCodeBlock(code) {
  code = code.trim();
  // Remove leading triple backticks and optional language
  code = code.replace(/^```[a-zA-Z]*\n?/, '');
  // Remove trailing triple backticks
  code = code.replace(/```$/, '');
  return code.trim();
}

// POST /detect-stack endpoint
app.post('/detect-stack', async (req, res) => {
  const { sourceCode } = req.body;
  if (!sourceCode) {
    return res.status(400).json({ error: 'No source code provided.' });
  }

  try {
    const prompt = buildDetectionPrompt(sourceCode);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const detectedStack = response.text().trim().toLowerCase();
    
    // Validate the detected stack
    const validStacks = ['react', 'vue', 'angular', 'svelte', 'solid', 'preact'];
    const stack = validStacks.includes(detectedStack) ? detectedStack : 'react';
    
    res.json({ detectedStack: stack });
  } catch (error) {
    console.error('Stack detection error:', error);
    res.status(500).json({ error: 'Failed to detect stack.', details: error.message || error.toString() });
  }
});

// POST /convert endpoint
app.post('/convert', async (req, res) => {
  const { sourceCode, sourceStack, targetStack, captchaToken } = req.body;
  if (!sourceCode || !sourceStack || !targetStack) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Turnstile verification (only in production)
  if (process.env.NODE_ENV === 'production') {
    if (!captchaToken) {
      return res.status(400).json({ error: 'Missing CAPTCHA token.' });
    }
    try {
      const verifyRes = await axios.post(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: captchaToken,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      if (!verifyRes.data.success) {
        return res.status(403).json({ error: 'Failed CAPTCHA verification.' });
      }
    } catch (err) {
      return res.status(500).json({ error: 'CAPTCHA verification error.' });
    }
  }

  try {
    const prompt = buildPrompt(sourceCode, sourceStack, targetStack);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const convertedCode = response.text();
                    // Log detailed info only in development mode
                if (process.env.NODE_ENV === 'development') {
                  console.log('--- Gemini API Call ---');
                  console.log('Prompt length:', prompt.length);
                  console.log('Prompt preview:', prompt.slice(0, 100) + '...');
                  console.log('Response length:', convertedCode.length);
                  
                  // Extract and log token usage information
                  if (response.usageMetadata) {
                    const usage = response.usageMetadata;
                    console.log('--- Token Usage ---');
                    console.log('Prompt tokens:', usage.promptTokenCount);
                    console.log('Response tokens:', usage.candidatesTokenCount);
                    console.log('Total tokens:', usage.totalTokenCount);
                    console.log('Model version:', response.modelVersion);
                    
                    // Additional useful metadata
                    console.log('Response ID:', response.responseId);
                    console.log('Finish reason:', response.candidates?.[0]?.finishReason || 'N/A');
                    console.log('Average log probability:', response.candidates?.[0]?.avgLogprobs || 'N/A');
                    
                    // Token details if available
                    if (usage.promptTokensDetails) {
                      console.log('Prompt token details:', usage.promptTokensDetails.length, 'segments');
                    }
                    if (usage.candidatesTokensDetails) {
                      console.log('Response token details:', usage.candidatesTokensDetails.length, 'segments');
                    }
                  }
                } else {
                  // Production logging - just basic info
                  if (response.usageMetadata) {
                    const usage = response.usageMetadata;
                    console.log(`[Gemini] Conversion completed - Total tokens: ${usage.totalTokenCount}`);
                  }
                }
    const cleanedCode = stripCodeBlock(convertedCode);
    res.json({ convertedCode: cleanedCode });
  } catch (error) {
    console.error('Gemini API error:', error);
    if (error && error.response) {
      console.error('Gemini API error response:', error.response.data || error.response);
    }
    res.status(500).json({ error: 'Failed to convert code.', details: error.message || error.toString() });
  }
});

// POST /upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or wrong file type.' });
  }
  res.json({
    message: 'File uploaded successfully.',
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
  });
});

// POST /batch-convert endpoint
app.post('/batch-convert', async (req, res) => {
  const { filename, sourceStack, targetStack } = req.body;
  if (!filename) {
    return res.status(400).json({ error: 'No filename provided.' });
  }
  const zipPath = path.join(__dirname, 'uploads', filename);
  if (!fs.existsSync(zipPath)) {
    return res.status(404).json({ error: 'File not found.' });
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="converted.zip"');
  const archive = archiver('zip');
  archive.pipe(res);

  const processEntries = [];
  fs.createReadStream(zipPath)
    .pipe(unzipper.Parse())
    .on('entry', function (entry) {
      const ext = path.extname(entry.path).toLowerCase();
      const allowedExts = [".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte"];
      const dangerousExts = [".exe", ".sh", ".bat", ".cmd", ".php", ".py", ".rb", ".dll"];
      if (dangerousExts.includes(ext)) {
        // Skip dangerous files
        entry.autodrain();
        return;
      }
      if (allowedExts.includes(ext)) {
        // Convert code files
        processEntries.push(
          entry.buffer().then(async (codeBuffer) => {
            const code = codeBuffer.toString();
            try {
              const prompt = buildPrompt(code, sourceStack, targetStack);
              const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
              const result = await model.generateContent(prompt);
              const response = await result.response;
              const convertedCode = response.text();
              const ext = getFileExtension(targetStack, entry.path);
              const base = path.basename(entry.path, path.extname(entry.path));
              const newName = base + ext;
              const cleanedCode = stripCodeBlock(convertedCode);
              archive.append(cleanedCode, { name: newName });
              // Log detailed info only in development mode
              if (process.env.NODE_ENV === 'development') {
                console.log('--- Gemini API Call ---');
                console.log('Prompt length:', prompt.length);
                console.log('Prompt preview:', prompt.slice(0, 100) + '...');
                console.log('Response length:', convertedCode.length);
                
                // Extract and log token usage information
                if (response.usageMetadata) {
                  const usage = response.usageMetadata;
                  console.log('--- Token Usage ---');
                  console.log('Prompt tokens:', usage.promptTokenCount);
                  console.log('Response tokens:', usage.candidatesTokenCount);
                  console.log('Total tokens:', usage.totalTokenCount);
                  console.log('Model version:', response.modelVersion);
                  
                  // Additional useful metadata
                  console.log('Response ID:', response.responseId);
                  console.log('Finish reason:', response.candidates?.[0]?.finishReason || 'N/A');
                  console.log('Average log probability:', response.candidates?.[0]?.avgLogprobs || 'N/A');
                  
                  // Token details if available
                  if (usage.promptTokensDetails) {
                    console.log('Prompt token details:', usage.promptTokensDetails.length, 'segments');
                  }
                  if (usage.candidatesTokensDetails) {
                    console.log('Response token details:', usage.candidatesTokensDetails.length, 'segments');
                  }
                }
              } else {
                // Production logging - just basic info
                if (response.usageMetadata) {
                  const usage = response.usageMetadata;
                  console.log(`[Gemini] Conversion completed - Total tokens: ${usage.totalTokenCount}`);
                }
              }
            } catch (err) {
              archive.append('// Conversion failed', { name: entry.path });
            }
          })
        );
      } else {
        // Skip non-code files entirely
        entry.autodrain();
      }
    })
    .on('close', async () => {
      await Promise.all(processEntries);
      archive.finalize();
      
      // Clean up the uploaded file after processing
      fs.unlink(zipPath, (err) => {
        if (err) console.error('Failed to delete uploaded file:', filename);
        else console.log('Cleaned up uploaded file:', filename);
      });
    });
});

app.get('/', (req, res) => {
  res.send('Stack Converter backend is running.');
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 