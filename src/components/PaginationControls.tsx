"use client";

export default function PaginationControls(props: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <button
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:hover:bg-zinc-900 disabled:opacity-50"
        disabled={props.page <= 1}
        onClick={props.onPrev}
        type="button"
      >
        Previous
      </button>
      <div className="text-sm text-zinc-700 dark:text-zinc-300">
        Page <span className="font-semibold text-zinc-900 dark:text-zinc-100">{props.page}</span> of{" "}
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{props.totalPages}</span>
      </div>
      <button
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:hover:bg-zinc-900 disabled:opacity-50"
        disabled={props.page >= props.totalPages}
        onClick={props.onNext}
        type="button"
      >
        Next
      </button>
    </div>
  );
}

