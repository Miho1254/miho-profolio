import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export const GET = async (context) => {
  const posts = await getCollection("blog");
  return rss({
    title: "Miho Blog",
    description: "Miho's personal blog",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blogs/posts/${post.slug}`,
    })),
  });
};
