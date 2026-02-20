import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

export default defineConfig({
  integrations: [sitemap(), mdx()],
  site: "https://miho.worldsimp.com/",
  image: {
    service: { entrypoint: 'astro/assets/services/noop' }
  }
});
