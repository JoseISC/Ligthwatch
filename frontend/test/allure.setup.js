import { beforeEach } from 'vitest';
import { epic, parentSuite } from 'allure-js-commons';

beforeEach(async () => {
  await epic('Frontend (Vite)');
  await parentSuite('Frontend (Vite)');
});
