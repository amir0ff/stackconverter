// backend/utils/gemini.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

function genAI() {
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({ model: 'gemini-2.5-pro' });
}

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

function buildDetectionPrompt(sourceCode) {
  return `
Analyze the following code and determine which JavaScript framework it uses.
Available frameworks: React, Vue, Angular, Svelte, SolidJS, Preact.

- If the code contains <template>, <script setup>, defineProps, or other Vue-specific syntax, it is likely Vue.
- If the code uses JSX, useState, useEffect, or React-specific hooks, it is likely React.
- If the code uses @Component, Angular decorators, or TypeScript classes, it is likely Angular.
- If the code uses $:, <script>, or Svelte-specific syntax, it is likely Svelte.

Code to analyze:
${sourceCode}

Return only the framework name (e.g., 'vue', 'react', etc.).
`;
}

function stripCodeBlock(code) {
  code = code.trim();
  code = code.replace(/^```[a-zA-Z]*\n?/, '');
  code = code.replace(/```$/, '');
  return code.trim();
}

async function verifyCaptcha(captchaToken) {
  if (!captchaToken) return false;
  try {
    const verifyRes = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: captchaToken,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return verifyRes.data.success;
  } catch {
    return false;
  }
}

module.exports = {
  genAI,
  buildPrompt,
  buildDetectionPrompt,
  stripCodeBlock,
  verifyCaptcha,
}; 