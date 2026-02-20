const postImportResult = import.meta.glob("../posts/*.{md,mdx}", { eager: true });
const posts = Object.values(postImportResult);

export function GET() {
    const sorted = posts
        .sort((a, b) => new Date(b.frontmatter.pubDate).valueOf() - new Date(a.frontmatter.pubDate).valueOf())
        .slice(0, 4)
        .map((post) => ({
            title: post.frontmatter.title,
            description: post.frontmatter.description || "",
            link: post.url,
            date: post.frontmatter.pubDate,
            image: post.frontmatter.hero || "",
        }));

    return new Response(JSON.stringify(sorted), {
        headers: { "Content-Type": "application/json" },
    });
}
