"use client";

export default function GlobalError(props: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/40 dark:bg-red-950/20">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">Something went wrong</h2>
        <p className="mt-2 text-sm text-red-700 dark:text-red-100">{props.error.message || "Unexpected error."}</p>
        <button
          type="button"
          onClick={props.reset}
          className="mt-4 rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
