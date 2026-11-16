// The design system's docs site ("storefront", guideline 13): Astro + Starlight at /, with the Storybook
// ("workshop") copied in at /workshop/ so both ship as one Vercel deploy. Decision: docs/adr/0007-docs-site.md.
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import starlightLinksValidator from 'starlight-links-validator';
import { workshop } from './src/integrations/workshop.mjs';

export default defineConfig({
  site: 'https://protokit.design',
  integrations: [
    starlight({
      title: 'Protokit',
      description: 'Tokens and React components for Salem Cobalt’s side projects.',
      favicon: '/favicon.svg',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/sghoweri/protokit' },
        { icon: 'npm', label: 'npm', href: 'https://www.npmjs.com/package/@protokit/ui' },
        { icon: 'storybook', label: 'Workshop (Storybook)', href: '/workshop/' },
      ],
      editLink: { baseUrl: 'https://github.com/sghoweri/protokit/edit/main/apps/docs/' },
      // Tokens, then the component layer (@layer proto), then the Starlight mapping, which is unlayered and so wins.
      customCss: ['@protokit/tokens/css', '@protokit/ui/styles.css', './src/styles/theme.css'],
      components: { Head: './src/components/Head.astro' },
      sidebar: [
        { label: 'Getting started', slug: 'getting-started' },
        { label: 'Foundations', items: [{ slug: 'foundations/color' }] },
        { label: 'Components', items: [{ slug: 'components/button' }] },
        { label: 'Guides', items: [{ slug: 'guides/astro' }] },
        { label: 'Workshop (Storybook)', link: '/workshop/' },
      ],
      plugins: [
        // /workshop/ is Storybook's static build, copied in after Astro builds, so it is not an Astro page.
        starlightLinksValidator({ exclude: ['/workshop/', '/workshop/**'] }),
      ],
    }),
    react(),
    workshop(),
  ],
});
