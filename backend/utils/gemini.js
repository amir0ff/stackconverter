// backend/utils/gemini.js
const {GoogleGenerativeAI} = require('@google/generative-ai');
const axios = require('axios');

const genAIClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Optimized for high-quality code generation using the latest Gemini 3 model.
 */
function genAI() {
    return genAIClient.getGenerativeModel({model: 'gemini-3-flash-preview'});
}

/**
 * Optimized for speed and high rate-limits for simple classification tasks.
 */
function genDetectionAI() {
    return genAIClient.getGenerativeModel({model: 'gemini-2.5-flash-lite'});
}

function buildPrompt(sourceCode, sourceStack, targetStack) {
    const stackInstructions = {
        'react': {
            'vue': `Convert this React component to Vue 3 Composition API. Use <script setup> syntax. Convert useState to ref/reactive, useEffect to onMounted/watch, and map JSX logic to Vue directives (v-if, v-for).`,
            'svelte': `Convert this React component to Svelte 5. Use Svelte runes ($state, $derived, $effect) for state management and modern Svelte template syntax.`,
            'angular': `Convert this React component to Angular (Latest). Use Standalone Components and Angular Signals (signal, computed, effect) for state management.`,
            'solid': `Convert this React component to SolidJS. Use createSignal for state and createEffect for side effects. Ensure signal access happens inside the JSX for reactivity.`,
            'preact': `Convert this React component to Preact. Use Preact Hooks and optimize for the smaller Preact virtual DOM footprint.`
        },
        'vue': {
            'react': `Convert this Vue component to React. Use functional components and Hooks (useState, useEffect). Map Vue directives (v-if, v-for) to JSX patterns.`,
            'svelte': `Convert this Vue component to Svelte 5. Use Svelte runes ($state, $effect) and map Vue's template logic to Svelte syntax.`,
            'angular': `Convert this Vue component to Angular. Use Standalone Components and TypeScript. Map Vue's reactive refs to Angular Signals.`,
            'solid': `Convert this Vue component to SolidJS. Map Vue's Composition API logic to Solid's createSignal and createMemo.`,
            'preact': `Convert this Vue component to Preact using Hooks and JSX.`
        },
        'angular': {
            'react': `Convert this Angular component to React. Convert class-based logic and decorators to React Functional Components and Hooks.`,
            'vue': `Convert this Angular component to Vue 3 Composition API. Use <script setup> and map Angular inputs/outputs to Vue props/emits.`,
            'svelte': `Convert this Angular component to Svelte 5. Use Svelte's reactive syntax and component structure.`,
            'solid': `Convert this Angular component to SolidJS. Replace Angular's dependency injection and class logic with Solid's functional reactive patterns.`,
            'preact': `Convert this Angular component to Preact using functional components.`
        },
        'svelte': {
            'react': `Convert this Svelte component to React. Map Svelte's reactive assignments to useState and lifecycle to useEffect.`,
            'vue': `Convert this Svelte component to Vue 3. Use Composition API and <script setup>.`,
            'angular': `Convert this Svelte component to Angular. Use Standalone Components and Signals.`,
            'solid': `Convert this Svelte component to SolidJS using createSignal.`,
            'preact': `Convert this Svelte component to Preact.`
        }
    };

    const instruction = stackInstructions[sourceStack]?.[targetStack] ||
        `Convert the following code from ${sourceStack} to ${targetStack} using modern best practices and the latest stable API.`;

    return `You are a Senior Frontend Engineer.
${instruction}

OUTPUT CONSTRAINTS:
- Output ONLY the raw source code.
- DO NOT use markdown formatting (no triple backticks).
- DO NOT include explanations, introduction, or concluding remarks.
- Maintain original variable names unless they conflict with target framework keywords.

Source code:
${sourceCode}
`;
}

function buildDetectionPrompt(sourceCode) {
    return `
Analyze the JavaScript/TypeScript code provided below to identify its specific framework.

Detection Rules:
- react (Standard JSX, Hooks like useState/useEffect)
- vue (SFC structure, <template>, <script setup>, ref/reactive)
- angular (Decorators @Component, @Injectable, RxJS, or new Signals API)
- svelte (Svelte 4/5 syntax: $:, $state, $derived, <script> blocks)
- solid (JSX but uses createSignal, createEffect, or createMemo)
- preact (JSX, useSignal, or 'preact' imports)

Code to analyze:
${sourceCode}

Return ONLY the lowercase string of the framework name. No markdown, no explanation, no backticks.
`;
}

function stripCodeBlock(code) {
    if (!code) return '';
    return code.trim()
        .replace(/^```[a-zA-Z]*\n?/, '')
        .replace(/```$/, '')
        .trim();
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
            {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}
        );
        return verifyRes.data.success;
    } catch {
        return false;
    }
}

module.exports = {
    genAI,
    genDetectionAI,
    buildPrompt,
    buildDetectionPrompt,
    stripCodeBlock,
    verifyCaptcha,
};
