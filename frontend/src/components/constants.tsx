import React from 'react';
import { FaReact } from 'react-icons/fa';
import { SiVuedotjs, SiAngular, SiSvelte, SiSolid, SiPreact } from 'react-icons/si';
import { StackOption } from './types';

export const stackOptions: StackOption[] = [
  { value: 'react', label: 'React', icon: <FaReact color="#61DAFB" size={24} /> },
  { value: 'vue', label: 'Vue.js', icon: <SiVuedotjs color="#42B883" size={24} /> },
  { value: 'angular', label: 'Angular', icon: <SiAngular color="#DD0031" size={24} /> },
  { value: 'svelte', label: 'Svelte', icon: <SiSvelte color="#FF3E00" size={24} /> },
  { value: 'solid', label: 'SolidJS', icon: <SiSolid color="#2C4F7C" size={24} /> },
  { value: 'preact', label: 'Preact', icon: <SiPreact color="#673AB8" size={24} /> }
];

export const stackToLanguage: Record<string, string> = {
  react: 'jsx',
  vue: 'html',
  angular: 'typescript',
  svelte: 'html',
  solid: 'jsx',
  preact: 'jsx',
};

export const exampleCode: Record<string, string> = {
  react: `import React, { useState } from 'react';

const Counter = ({ initialValue = 0 }) => {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
};

export default Counter;`,
  vue: `<template>
  <div class="counter">
    <h2>Counter: {{ count }}</h2>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { defineProps } from 'vue';

const props = defineProps({
  initialValue: {
    type: Number,
    default: 0
  }
});

const count = ref(props.initialValue);
const increment = () => count.value++;
const decrement = () => count.value--;
</script>`,
  angular: `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: '<div class="counter">\n    <h2>Counter: {{ count }}</h2>\n    <button (click)="increment()">+</button>\n    <button (click)="decrement()">-</button>\n  </div>'
})
export class CounterComponent {
  @Input() initialValue: number = 0;
  count: number;

  constructor() {
    this.count = this.initialValue;
  }

  ngOnInit() {
    this.count = this.initialValue;
  }

  increment() { this.count++; }
  decrement() { this.count--; }
}
`,
  svelte: `<script>
  export let initialValue = 0;
  let count = initialValue;
  const increment = () => count++;
  const decrement = () => count--;
</script>

<div class="counter">
  <h2>Counter: {count}</h2>
  <button on:click={increment}>+</button>
  <button on:click={decrement}>-</button>
</div>`,
  solid: `import { createSignal } from 'solid-js';

const Counter = (props) => {
  const [count, setCount] = createSignal(props.initialValue || 0);
  const increment = () => setCount(count() + 1);
  const decrement = () => setCount(count() - 1);
  return (
    <div class="counter">
      <h2>Counter: {count()}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
};

export default Counter;`,
  preact: `import { h } from 'preact';
import { useState } from 'preact/hooks';

const Counter = ({ initialValue = 0 }) => {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  return (
    <div class="counter">
      <h2>Counter: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
};

export default Counter;`
};

export const convertedExamples: Record<string, Record<string, string>> = {
  react: {
    vue: `<template>
  <div class="counter">
    <h2>Counter: {{ count }}</h2>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { defineProps } from 'vue';

const props = defineProps({
  initialValue: {
    type: Number,
    default: 0
  }
});

const count = ref(props.initialValue);
const increment = () => count.value++;
const decrement = () => count.value--;
</script>`,
    angular: `import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: '<div class="counter">\n    <h2>Counter: {{ count }}</h2>\n    <button (click)="increment()">+</button>\n    <button (click)="decrement()">-</button>\n  </div>'
})
export class CounterComponent {
  @Input() initialValue: number = 0;
  count: number;

  constructor() {
    this.count = this.initialValue;
  }

  ngOnInit() {
    this.count = this.initialValue;
  }

  increment() { this.count++; }
  decrement() { this.count--; }
}
`,
    svelte: `<script>
  export let initialValue = 0;
  let count = initialValue;
  const increment = () => count++;
  const decrement = () => count--;
</script>

<div class="counter">
  <h2>Counter: {count}</h2>
  <button on:click={increment}>+</button>
  <button on:click={decrement}>-</button>
</div>`,
    solid: `import { createSignal } from 'solid-js';

const Counter = (props) => {
  const [count, setCount] = createSignal(props.initialValue || 0);
  const increment = () => setCount(count() + 1);
  const decrement = () => setCount(count() - 1);
  return (
    <div class="counter">
      <h2>Counter: {count()}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
};

export default Counter;`,
    preact: `import { h } from 'preact';
import { useState } from 'preact/hooks';

const Counter = ({ initialValue = 0 }) => {
  const [count, setCount] = useState(initialValue);
  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);
  return (
    <div class="counter">
      <h2>Counter: {count}</h2>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
};

export default Counter;`
  },
  // Add other source stacks as needed
};

export const features = [
  {
    icon: '🔄',
    title: 'Smart Conversion',
    description: 'AI-powered analysis converts components, state management, and lifecycle methods intelligently.',
    color: 'text-blue-400'
  },
  {
    icon: '⚡',
    title: 'Full Stack Support',
    description: 'Convert entire projects including build configs, routing, state management, and testing.',
    color: 'text-green-400'
  },
  {
    icon: '🎯',
    title: 'Best Practices',
    description: 'Generated code follows framework conventions and modern best practices out of the box.',
    color: 'text-purple-400'
  }
]; 