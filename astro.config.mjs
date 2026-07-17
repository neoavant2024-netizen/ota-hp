// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 本番ドメイン。canonical / sitemap の生成に使用。
export default defineConfig({
  site: 'https://www.white-ota.co.jp',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'auto' },
});
