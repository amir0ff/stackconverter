const request = require('supertest');
const express = require('express');

// Mock the captcha middleware
jest.mock('../../middleware/captchaSession', () => (req, res, next) => next());

// Mock Gemini API with actual function call verification
jest.mock('../../utils/gemini', () => ({
  buildDetectionPrompt: jest.fn().mockImplementation((sourceCode) => {
    return `Analyze this code: ${sourceCode}`;
  }),
  genAI: jest.fn().mockReturnValue({
    generateContent: jest.fn().mockResolvedValue({
      response: {
        text: () => 'react'
      }
    })
  })
}));

const app = express();
app.use(express.json());

// Import after mocking
const detectStackRoute = require('../../routes/detectStack');
app.use('/detect-stack', detectStackRoute);

describe('Detect Stack Route', () => {
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for expected API failures
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should detect React stack successfully and call required functions', async () => {
    const { buildDetectionPrompt, genAI } = require('../../utils/gemini');
    
    const response = await request(app)
      .post('/detect-stack')
      .send({
        sourceCode: 'import React, { useState } from "react"; const Component = () => <div>Hello</div>'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('detectedStack');
    expect(response.body.detectedStack).toBe('react');
    
    // Verify actual function calls
    expect(buildDetectionPrompt).toHaveBeenCalledWith('import React, { useState } from "react"; const Component = () => <div>Hello</div>');
    expect(genAI).toHaveBeenCalled();
  });

  it('should detect Vue stack successfully', async () => {
    const { genAI } = require('../../utils/gemini');
    genAI.mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => 'vue'
        }
      })
    });

    const response = await request(app)
      .post('/detect-stack')
      .send({
        sourceCode: 'import { createApp } from "vue"; const app = createApp({});'
      });

    expect(response.status).toBe(200);
    expect(response.body.detectedStack).toBe('vue');
  });

  it('should validate required fields', async () => {
    const invalidRequests = [
      {},
      { sourceCode: '' },
      { sourceCode: null },
      { sourceCode: undefined }
    ];

    for (const invalidRequest of invalidRequests) {
      const response = await request(app)
        .post('/detect-stack')
        .send(invalidRequest);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('No source code provided.');
    }
  });

  it('should handle detection errors gracefully', async () => {
    const { genAI } = require('../../utils/gemini');
    genAI.mockReturnValue({
      generateContent: jest.fn().mockRejectedValue(new Error('Detection failed'))
    });

    const response = await request(app)
      .post('/detect-stack')
      .send({
        sourceCode: 'const x = 1;'
      });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toBe('Failed to detect stack.');
  });

  it('should detect multiple stack types', async () => {
    const testCases = [
      { sourceCode: 'import { createSignal } from "solid-js"', expected: 'solid' },
      { sourceCode: 'import { createRoot } from "preact"', expected: 'preact' },
      { sourceCode: 'import { createSignal } from "svelte"', expected: 'svelte' },
      { sourceCode: 'const x = 1; console.log(x);', expected: 'react' } // Default fallback
    ];

    for (const testCase of testCases) {
      const { genAI } = require('../../utils/gemini');
      genAI.mockReturnValue({
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: () => testCase.expected
          }
        })
      });

      const response = await request(app)
        .post('/detect-stack')
        .send({
          sourceCode: testCase.sourceCode
        });

      expect(response.status).toBe(200);
      expect(response.body.detectedStack).toBe(testCase.expected);
    }
  });

  it('should handle large code blocks', async () => {
    const largeCode = 'const x = 1;'.repeat(1000); // Large code block
    
    const response = await request(app)
      .post('/detect-stack')
      .send({
        sourceCode: largeCode
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('detectedStack');
  });

  it('should handle malformed JSON requests', async () => {
    const response = await request(app)
      .post('/detect-stack')
      .set('Content-Type', 'application/json')
      .send('{"invalid": json}');

    expect(response.status).toBe(400);
  });

  it('should test different code patterns', async () => {
    const testCases = [
      { code: 'import React from "react"', description: 'React import' },
      { code: '<template><div>Hello</div></template>', description: 'Vue template' },
      { code: '@Component({}) class MyComponent {}', description: 'Angular decorator' },
      { code: '<script>let count = 0;</script>', description: 'Svelte script' },
      { code: 'import { createSignal } from "solid-js"', description: 'SolidJS import' },
      { code: 'import { h } from "preact"', description: 'Preact import' }
    ];

    for (const testCase of testCases) {
      const response = await request(app)
        .post('/detect-stack')
        .send({
          sourceCode: testCase.code
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('detectedStack');
    }
  });
}); 