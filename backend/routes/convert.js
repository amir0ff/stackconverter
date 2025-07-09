// backend/routes/convert.js
const express = require('express');
const router = express.Router();
const { verifyCaptcha, buildPrompt, genAI, stripCodeBlock } = require('../utils/gemini');

router.post('/', async (req, res) => {
  const { sourceCode, sourceStack, targetStack, captchaToken } = req.body;
  if (!sourceCode || !sourceStack || !targetStack) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (process.env.NODE_ENV === 'production') {
    const valid = await verifyCaptcha(captchaToken);
    if (!valid) {
      return res.status(403).json({ error: 'Failed CAPTCHA verification.' });
    }
  }
  try {
    const prompt = buildPrompt(sourceCode, sourceStack, targetStack);
    const model = genAI();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const convertedCode = response.text();
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

module.exports = router; 