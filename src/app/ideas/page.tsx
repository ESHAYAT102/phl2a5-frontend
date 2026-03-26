"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "../../lib/api";
import IdeaCard from "../../components/IdeaCard";

type Category = { id: string; name: string };
type IdeaListItem = IdeaCardModel & {
  id: string;
  commentCount: number;
  hasAccess?: boolean;
};

function clampPage(n: number) {
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export default function IdeasPage() {
  const params = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [ideas, setIdeas] = useState<IdeaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [totalCandidates, setTotalCandidates] = useState(0);

  const [searchName, setSearchName] = useState(params.get("search") ?? "");
  const [categoryName, setCategoryName] = useState(params.get("category") ?? "");
  const initialPayment = params.get("payment");
  const [paymentStatus, setPaymentStatus] = useState<"free" | "paid" | "all">(
    initialPayment === "free" || initialPayment === "paid" || initialPayment === "all" ? initialPayment : "all"
  );
  const [minUpvotes, setMinUpvotes] = useState<number>(Number(params.get("minUpvotes") ?? 0));
  const initialSort = params.get("sort");
  const [sort, setSort] = useState<"recent" | "top" | "comments">(
    initialSort === "recent" || initialSort === "top" || initialSort === "comments" ? initialSort : "recent"
  );

  const [page, setPage] = useState<number>(clampPage(Number(params.get("page") ?? 1)));
  const pageSize = 12;

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const cats = await apiFetch<{ categories: Category[] }>("/api/categories", { auth: false });
        setCategories(cats.categories);
      } finally {
        // fallthrough
      }
    }
    load();
  }, []);

  const query = useMemo((): Record<string, string | number | undefined> => {
    return {
      search: searchName || undefined,
      category: categoryName || undefined,
      paymentStatus,
      minUpvotes: minUpvotes > 0 ? minUpvotes : undefined,
      sort,
      page,
      pageSize,
    };
  }, [categoryName, minUpvotes, page, pageSize, paymentStatus, searchName, sort]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await apiFetch<{ ideas: IdeaListItem[]; page: number; pageSize: number; totalCandidates: number }>("/api/ideas", {
          query,
          auth: false,
        });
        if (!mounted) return;
        setIdeas(res.ideas);
        setTotalCandidates(res.totalCandidates);
      } catch {
        if (!mounted) return;
        setIdeas([]);
        setFetchError("Failed to load ideas. Try adjusting filters.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [query]);
  const totalPages = Math.max(1, Math.ceil(totalCandidates / pageSize));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    // For simplicity, state drives the fetch; URL query is optional for this MVP.
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">All Ideas</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Browse approved sustainability ideas. Paid ideas require purchase to view details.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Search</label>
          <input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
            placeholder="title, keyword, description"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
          <select
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Payment Status</label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as "free" | "paid" | "all")}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
          >
            <option value="all">All</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Min Upvotes</label>
          <input
            type="number"
            min={0}
            value={minUpvotes}
            onChange={(e) => setMinUpvotes(Number(e.target.value))}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "recent" | "top" | "comments")}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
          >
            <option value="recent">Recent</option>
            <option value="top">Top Voted</option>
            <option value="comments">Most Commented</option>
          </select>
        </div>

        <div className="flex items-end gap-3 sm:justify-end">
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black"
          >
            Apply Filters
          </button>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-zinc-600 dark:text-zinc-300">
          Showing {ideas.length} ideas{totalCandidates ? ` (candidates: ${totalCandidates})` : ""}.
        </div>
      </div>

      {fetchError ? <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-200">{fetchError}</div> : null}

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
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

      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:hover:bg-zinc-900 disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          type="button"
        >
          Previous
        </button>
        <div className="text-sm text-zinc-700 dark:text-zinc-300">
          Page <span className="font-semibold text-zinc-900 dark:text-zinc-100">{page}</span> of{" "}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalPages}</span>
        </div>
        <button
          className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:hover:bg-zinc-900 disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
}

