import rss from "@astrojs/rss";

const postImportResult = import.meta.glob("./posts/*.{md,mdx}", { eager: true });
const posts = Object.values(postImportResult);

export const GET = () =>
  rss({
    title: "Miho Blog",
    description: "Miho's personal blog",
    site: import.meta.env.SITE,
    items: import.meta.glob("./posts/**/*.{md,mdx}"),
  });
