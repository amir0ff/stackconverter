// backend/routes/batchConvert.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const unzipper = require('unzipper');
const { buildPrompt, genAI, stripCodeBlock } = require('../utils/gemini');
const captchaSession = require('../middleware/captchaSession');
const router = express.Router();

// Map target stack to file extension
const stackToExt = {
  react: '.jsx',
  vue: '.vue',
  angular: '.ts',
  svelte: '.svelte',
  solid: '.jsx',
  preact: '.jsx',
};

router.post('/', captchaSession, async (req, res) => {
  const { filename, sourceStack, targetStack } = req.body;
  if (!filename) {
    return res.status(400).json({ error: 'No filename provided.' });
  }
  const zipPath = path.join(__dirname, '../uploads', filename);
  if (!fs.existsSync(zipPath)) {
    return res.status(404).json({ error: 'File not found.' });
  }
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="converted-${targetStack}.zip"`);
  const archive = archiver('zip');
  archive.pipe(res);
  const processEntries = [];
  fs.createReadStream(zipPath)
    .pipe(unzipper.Parse())
    .on('error', (err) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Unzip error:', err);
      }
      if (!res.headersSent) {
        res.status(400).json({ error: 'Invalid or corrupted zip file.' });
      }
    })
    .on('entry', function (entry) {
      const ext = path.extname(entry.path).toLowerCase();
      const allowedExts = [".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte"];
      const dangerousExts = [".exe", ".sh", ".bat", ".cmd", ".php", ".py", ".rb", ".dll"];
      if (dangerousExts.includes(ext)) {
        entry.autodrain();
        return;
      }
      if (allowedExts.includes(ext)) {
        processEntries.push(
          entry.buffer().then(async (codeBuffer) => {
            const code = codeBuffer.toString();
            try {
              const prompt = buildPrompt(code, sourceStack, targetStack);
              const model = genAI();
              const result = await model.generateContent(prompt);
              const response = await result.response;
              const convertedCode = response.text();
              const base = path.basename(entry.path, path.extname(entry.path));
              const newExt = stackToExt[targetStack] || '.txt';
              const newName = base + newExt;
              const cleanedCode = stripCodeBlock(convertedCode);
              archive.append(cleanedCode, { name: newName });
            } catch (err) {
              archive.append('// Conversion failed', { name: entry.path });
            }
          })
        );
      } else {
        entry.autodrain();
      }
    })
    .on('close', async () => {
      await Promise.all(processEntries);
      archive.finalize();
      fs.unlink(zipPath, (err) => {
        if (err) console.error('Failed to delete uploaded file:', filename);
      });
    });
});

module.exports = router; 