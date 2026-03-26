"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "../../lib/api";
import IdeaCard from "../../components/IdeaCard";
import IdeasFilters from "../../components/IdeasFilters";
import PaginationControls from "../../components/PaginationControls";

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

  const applyFilters = () => {
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

      <IdeasFilters
        categories={categories}
        searchName={searchName}
        setSearchName={setSearchName}
        categoryName={categoryName}
        setCategoryName={setCategoryName}
        paymentStatus={paymentStatus}
        setPaymentStatus={setPaymentStatus}
        minUpvotes={minUpvotes}
        setMinUpvotes={setMinUpvotes}
        sort={sort}
        setSort={setSort}
        onApply={applyFilters}
      />

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

      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  );
}

