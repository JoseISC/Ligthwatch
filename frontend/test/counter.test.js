import { describe, it, expect } from 'vitest';
import { setupCounter } from '../src/counter.js';

describe('setupCounter', () => {
  it('inicializa el contador en 0', () => {
    const button = document.createElement('button');
    setupCounter(button);
    expect(button.innerHTML).toBe('Count is 0');
  });

  it('incrementa el contador en cada click', () => {
    const button = document.createElement('button');
    setupCounter(button);
    button.click();
    expect(button.innerHTML).toBe('Count is 1');
    button.click();
    button.click();
    expect(button.innerHTML).toBe('Count is 3');
  });
});
