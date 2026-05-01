import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text', 'text-summary'],
      include: ['src/**/*.js'],
      exclude: [
        'src/main.js',
        '**/*.config.js',
      ],
    },
  },
});
