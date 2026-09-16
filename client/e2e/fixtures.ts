/* oxlint-disable react-hooks/rules-of-hooks -- fixture de Playwright, no es un hook de React */
import { expect, test as base } from '@playwright/test';
import { Actor } from './actor/Actor.js';

export const test = base.extend<{ actor: Actor }>({
  actor: async ({ page }, use) => {
    const actor = new Actor('Ana', page);
    await use(actor);
  },
});

export { expect };