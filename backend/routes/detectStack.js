// backend/routes/detectStack.js
const express = require('express');
const router = express.Router();
const { buildDetectionPrompt, genAI } = require('../utils/gemini');
const captchaSession = require('../middleware/captchaSession');

router.post('/', captchaSession, async (req, res) => {
  const { sourceCode } = req.body;
  if (!sourceCode) {
    return res.status(400).json({ error: 'No source code provided.' });
  }
  try {
    const prompt = buildDetectionPrompt(sourceCode);
    const model = genAI();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const detectedStack = response.text().trim().toLowerCase();
    const validStacks = ['react', 'vue', 'angular', 'svelte', 'solid', 'preact'];
    const stack = validStacks.includes(detectedStack) ? detectedStack : 'react';
    res.json({ detectedStack: stack });
  } catch (error) {
    console.error('Stack detection error:', error);
    res.status(500).json({ error: 'Failed to detect stack.', details: error.message || error.toString() });
  }
});

module.exports = router; 