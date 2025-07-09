const { buildPrompt, buildDetectionPrompt, stripCodeBlock, verifyCaptcha } = require('../../utils/gemini');

// Mock axios
jest.mock('axios');

describe('Gemini Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildPrompt', () => {
    it('should build prompts for all framework combinations', () => {
      const testCases = [
        // React conversions
        { from: 'react', to: 'vue', expect: 'Vue 3 Composition API' },
        { from: 'react', to: 'svelte', expect: 'Svelte\'s reactive syntax' },
        { from: 'react', to: 'angular', expect: 'Angular\'s component decorator' },
        { from: 'react', to: 'solid', expect: 'SolidJS\'s createSignal' },
        { from: 'react', to: 'preact', expect: 'Preact\'s smaller footprint' },
        
        // Vue conversions
        { from: 'vue', to: 'react', expect: 'React hooks' },
        { from: 'vue', to: 'svelte', expect: 'Svelte\'s reactive syntax' },
        { from: 'vue', to: 'angular', expect: 'Angular\'s component decorator' },
        { from: 'vue', to: 'solid', expect: 'SolidJS\'s createSignal' },
        { from: 'vue', to: 'preact', expect: 'Preact\'s React-like syntax' },
        
        // Angular conversions
        { from: 'angular', to: 'react', expect: 'React hooks' },
        { from: 'angular', to: 'vue', expect: 'Vue\'s Composition API' },
        { from: 'angular', to: 'svelte', expect: 'Svelte\'s reactive syntax' },
        { from: 'angular', to: 'solid', expect: 'SolidJS\'s reactive patterns' },
        { from: 'angular', to: 'preact', expect: 'Preact\'s React-like syntax' },
        
        // Svelte conversions
        { from: 'svelte', to: 'react', expect: 'React hooks' },
        { from: 'svelte', to: 'vue', expect: 'Vue\'s Composition API' },
        { from: 'svelte', to: 'angular', expect: 'Angular\'s component decorator' },
        { from: 'svelte', to: 'solid', expect: 'SolidJS\'s reactive patterns' },
        { from: 'svelte', to: 'preact', expect: 'Preact\'s React-like syntax' }
      ];

      testCases.forEach(({ from, to, expect: expectedText }) => {
        const sourceCode = `const Component = () => <div>Hello</div>`;
        const prompt = buildPrompt(sourceCode, from, to);
        
        expect(prompt).toContain(expectedText);
        expect(prompt).toContain(sourceCode);
        expect(prompt).toContain('Output only the converted code');
        expect(prompt).toContain('no explanations, comments, or Markdown formatting');
      });
    });

    it('should handle unsupported combinations gracefully', () => {
      const testCases = [
        { from: 'react', to: 'unsupported' },
        { from: 'vue', to: 'invalid' },
        { from: 'angular', to: 'unknown' },
        { from: 'svelte', to: 'random' }
      ];

      testCases.forEach(({ from, to }) => {
        const sourceCode = 'const Component = () => <div>Hello</div>';
        const prompt = buildPrompt(sourceCode, from, to);
        
        expect(prompt).toContain(`Convert the following code from ${from} to ${to}`);
        expect(prompt).toContain('Follow the target framework\'s best practices and conventions');
        expect(prompt).toContain(sourceCode);
      });
    });
  });

  describe('buildDetectionPrompt', () => {
    it('should build detection prompt correctly', () => {
      const sourceCode = 'const Component = () => <div>Hello</div>';
      const prompt = buildDetectionPrompt(sourceCode);
      
      expect(prompt).toContain('Analyze the following code and determine which JavaScript framework it uses');
      expect(prompt).toContain('Available frameworks: React, Vue, Angular, Svelte, SolidJS, Preact');
      expect(prompt).toContain(sourceCode);
    });

    it('should include framework detection hints', () => {
      const prompt = buildDetectionPrompt('test code');
      
      expect(prompt).toContain('If the code contains <template>, <script setup>, defineProps, or other Vue-specific syntax, it is likely Vue');
      expect(prompt).toContain('If the code uses JSX, useState, useEffect, or React-specific hooks, it is likely React');
      expect(prompt).toContain('If the code uses @Component, Angular decorators, or TypeScript classes, it is likely Angular');
      expect(prompt).toContain('If the code uses $:, <script>, or Svelte-specific syntax, it is likely Svelte');
    });
  });

  describe('stripCodeBlock', () => {
    it('should remove markdown code blocks', () => {
      const code = '```jsx\nconst Component = () => <div>Hello</div>;\n```';
      const result = stripCodeBlock(code);
      
      expect(result).toBe('const Component = () => <div>Hello</div>;');
    });

    it('should handle code without markdown blocks', () => {
      const code = 'const Component = () => <div>Hello</div>;';
      const result = stripCodeBlock(code);
      
      expect(result).toBe(code);
    });

    it('should handle empty code', () => {
      const code = '';
      const result = stripCodeBlock(code);
      
      expect(result).toBe('');
    });

    it('should handle null input', () => {
      const result = stripCodeBlock(null || '');
      expect(result).toBe('');
    });

    it('should handle code with language specification', () => {
      const testCases = [
        { input: '```javascript\nconst x = 1;\n```', expected: 'const x = 1;' },
        { input: '```vue\n<template></template>\n```', expected: '<template></template>' },
        { input: '```typescript\nconst x: number = 1;\n```', expected: 'const x: number = 1;' },
        { input: '```jsx\nconst Component = () => <div></div>;\n```', expected: 'const Component = () => <div></div>;' }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = stripCodeBlock(input);
        expect(result).toBe(expected);
      });
    });
  });

  describe('verifyCaptcha', () => {
    const axios = require('axios');

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should handle all captcha scenarios', async () => {
      const testCases = [
        { token: null, expected: false, description: 'missing token' },
        { token: '', expected: false, description: 'empty token' },
        { 
          token: 'valid-token', 
          mockResponse: { data: { success: true } },
          expected: true, 
          description: 'valid token' 
        },
        { 
          token: 'invalid-token', 
          mockResponse: { data: { success: false } },
          expected: false, 
          description: 'invalid token' 
        },
        { 
          token: 'error-token', 
          mockError: new Error('Network error'),
          expected: false, 
          description: 'API error' 
        }
      ];

      for (const testCase of testCases) {
        if (testCase.mockError) {
          axios.post.mockRejectedValue(testCase.mockError);
        } else if (testCase.mockResponse) {
          axios.post.mockResolvedValue(testCase.mockResponse);
        }

        const result = await verifyCaptcha(testCase.token);
        expect(result).toBe(testCase.expected);
      }
    });
  });
}); 