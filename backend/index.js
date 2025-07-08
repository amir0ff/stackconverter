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
      'text/plain'
    ];
    const allowedExts = ['.zip', '.js', '.jsx', '.ts', '.tsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .zip, .js, .jsx, .ts, .tsx files are allowed!'));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads/');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

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

// Utility: Strip Markdown code block from Gemini API response
function stripCodeBlock(code) {
  code = code.trim();
  // Remove leading triple backticks and optional language
  code = code.replace(/^```[a-zA-Z]*\n?/, '');
  // Remove trailing triple backticks
  code = code.replace(/```$/, '');
  return code.trim();
}

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
      const allowedExts = [".js", ".jsx", ".ts", ".tsx"];
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
    });
});

app.get('/', (req, res) => {
  res.send('Stack Converter backend is running.');
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
}); 