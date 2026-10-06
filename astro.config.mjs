import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
export default defineConfig({
  site: 'https://holycity-realestate.com',
  trailingSlash: 'always',
  integrations: [
    sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', he: 'he' } } }),
  ],
});
