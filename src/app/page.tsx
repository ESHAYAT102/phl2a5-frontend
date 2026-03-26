"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";
import IdeaCard, { type IdeaCardModel } from "../components/IdeaCard";
import NewsletterSection from "../components/NewsletterSection";

type Category = { id: string; name: string };
type TopIdeaResponse = IdeaCardModel & { upvotes: number; downvotes: number };

export default function Home() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [topIdeas, setTopIdeas] = useState<TopIdeaResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [searchCategory, setSearchCategory] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [cats, ideas] = await Promise.all([
          apiFetch<{ categories: Category[] }>("/api/categories"),
          apiFetch<{ ideas: TopIdeaResponse[] }>("/api/ideas", {
            query: { sort: "top", pageSize: 3, paymentStatus: "all" },
          }),
        ]);
        if (!mounted) return;
        setCategories(cats.categories);
        setTopIdeas(ideas.ideas);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const search = () => {
    const params = new URLSearchParams();
    if (searchName.trim()) params.set("search", searchName.trim());
    if (searchCategory) params.set("category", searchCategory);
    router.push(`/ideas?${params.toString()}`);
  };

  return (
    <div className="flex flex-col bg-zinc-50 dark:bg-black">
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-lime-500/10 to-sky-500/20"
          aria-hidden="true"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Share sustainability ideas that actually move the world.
            </h1>
            <p className="max-w-xl text-zinc-700 dark:text-zinc-300">
              EcoSpark Hub helps communities turn good intentions into real projects—powered by feedback, votes, and trusted review.
            </p>
          </div>

          <div className="w-full rounded-xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-black/40 md:max-w-md">
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Search</label>
                <input
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
                  placeholder="e.g., plastic reduction"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
                <select
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={search}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black"
              >
                Search Ideas
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Top voted projects</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Based on up-vote count (up - down).</p>
          </div>
          <Link className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300" href="/ideas">
            View all Ideas
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {topIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={{
                  id: idea.id,
                  title: idea.title,
                  categoryName: idea.categoryName,
                  summary: idea.summary,
                  representativeImageUrl: idea.representativeImageUrl,
                  voteScore: idea.voteScore,
                  isPaid: idea.isPaid,
                  hasAccess: idea.hasAccess,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <NewsletterSection />
    </div>
  );
}
