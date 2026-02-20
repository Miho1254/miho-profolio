import { getCollection } from 'astro:content';

export async function GET() {
    const posts = await getCollection('blog');
    const sorted = posts
        .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
        .slice(0, 4)
        .map((post) => ({
            title: post.data.title,
            description: post.data.description || "",
            link: `/blogs/posts/${post.slug}`,
            date: post.data.pubDate,
            image: post.data.hero || "",
        }));

    return new Response(JSON.stringify(sorted), {
        headers: { "Content-Type": "application/json" },
    });
}
