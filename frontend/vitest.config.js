import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [
      'allure-vitest/setup',
      './test/allure.setup.js',
    ],
    reporters: [
      'default',
      ['allure-vitest/reporter', { resultsDir: 'allure-results' }],
    ],
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
