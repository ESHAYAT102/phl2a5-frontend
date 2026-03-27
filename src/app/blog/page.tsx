export default function BlogPage() {
  const posts = [
    {
      title: "How to Start a Zero-Waste Neighborhood Program",
      excerpt:
        "A practical playbook for running a local reuse campaign, from volunteer onboarding to tracking impact metrics.",
      tag: "Waste",
    },
    {
      title: "Community Solar 101: Small Steps, Big Impact",
      excerpt:
        "Learn how small communities can evaluate rooftops, estimate savings, and organize shared solar initiatives.",
      tag: "Energy",
    },
    {
      title: "Reducing Commuting Emissions With Micro-Mobility",
      excerpt:
        "A guide to bike-share pilots, safe-route planning, and incentives that increase low-emission commuting.",
      tag: "Transportation",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Blog</h1>
      <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">Sustainability guides, community wins, and platform updates.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <article key={post.title} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black">
            <div className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
              {post.tag}
            </div>
            <h2 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">{post.title}</h2>
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

