// Copies the Storybook static build into the Astro output at /workshop/, so the docs site and the
// workshop are one deploy (guideline 13 rule 1). Build Storybook first: `pnpm build-storybook`.
import { cpSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const storybookStatic = fileURLToPath(new URL('../../../storybook/storybook-static/', import.meta.url));

/** @returns {import('astro').AstroIntegration} */
export function workshop() {
  return {
    name: 'salemcobalt:workshop',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        if (!existsSync(storybookStatic)) {
          throw new Error(
            `No Storybook build at ${storybookStatic}. Run \`pnpm build-storybook\` before \`pnpm build-docs\`.`,
          );
        }
        const target = fileURLToPath(new URL('workshop/', dir));
        cpSync(storybookStatic, target, { recursive: true });
        logger.info(`Copied the Storybook build to ${target}`);
      },
    },
  };
}
