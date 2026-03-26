"use client";

type Category = { id: string; name: string };

export default function IdeasFilters(props: {
  categories: Category[];
  searchName: string;
  setSearchName: (v: string) => void;
  categoryName: string;
  setCategoryName: (v: string) => void;
  paymentStatus: "free" | "paid" | "all";
  setPaymentStatus: (v: "free" | "paid" | "all") => void;
  minUpvotes: number;
  setMinUpvotes: (v: number) => void;
  sort: "recent" | "top" | "comments";
  setSort: (v: "recent" | "top" | "comments") => void;
  onApply: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        props.onApply();
      }}
      className="mt-6 grid gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-black sm:grid-cols-2"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Search</label>
        <input
          value={props.searchName}
          onChange={(e) => props.setSearchName(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
          placeholder="title, keyword, description"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
        <select
          value={props.categoryName}
          onChange={(e) => props.setCategoryName(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
        >
          <option value="">All categories</option>
          {props.categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Payment Status</label>
        <select
          value={props.paymentStatus}
          onChange={(e) => props.setPaymentStatus(e.target.value as "free" | "paid" | "all")}
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
          value={props.minUpvotes}
          onChange={(e) => props.setMinUpvotes(Number(e.target.value))}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Sort</label>
        <select
          value={props.sort}
          onChange={(e) => props.setSort(e.target.value as "recent" | "top" | "comments")}
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
  );
}

