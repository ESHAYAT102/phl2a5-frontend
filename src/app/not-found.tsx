import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center dark:border-zinc-800 dark:bg-black">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Page not found</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">The page you are looking for does not exist.</p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
