// backend/routes/convert.js
const express = require('express');
const router = express.Router();
const { buildPrompt, genAI, stripCodeBlock } = require('../utils/gemini');
const captchaSession = require('../middleware/captchaSession');

router.post('/', captchaSession, async (req, res) => {
  const { sourceCode, sourceStack, targetStack } = req.body;
  if (!sourceCode || !sourceStack || !targetStack) {
    return res.status(400).json({ error: 'Missing required fields.' });
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