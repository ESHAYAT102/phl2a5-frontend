"use client";

import Link from "next/link";

export type IdeaCardModel = {
  id: string;
  title: string;
  categoryName: string | null;
  summary: string;
  representativeImageUrl: string | null;
  voteScore: number;
  isPaid: boolean;
  hasAccess?: boolean;
};

export default function IdeaCard({ idea }: { idea: IdeaCardModel }) {
  const actionText = idea.isPaid && idea.hasAccess === false ? "Locked" : "View Idea";

  return (
    <Link
      href={`/ideas/${idea.id}`}
      className="group flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-emerald-500 dark:border-zinc-800 dark:bg-black"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 w-32">
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{idea.categoryName ?? "Category"}</div>
          <div className="mt-1 line-clamp-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">{idea.title}</div>
        </div>
        {idea.isPaid ? (
          <div className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
            Paid
          </div>
        ) : (
          <div className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
            Free
          </div>
        )}
      </div>

      <div className="mt-3 w-full">
        {idea.representativeImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={idea.representativeImageUrl}
            alt=""
            loading="lazy"
            className="aspect-[4/3] w-full rounded-lg object-cover"
          />
        ) : (
          <div className="aspect-[4/3] w-full rounded-lg bg-zinc-100 dark:bg-zinc-800">
            <div className="flex h-full items-center justify-center px-3 text-center text-xs font-medium text-zinc-400 dark:text-zinc-500">
              No image
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 line-clamp-3 text-sm text-zinc-700 dark:text-zinc-300">{idea.summary}</p>

      <div className="mt-4 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
        <div className="font-medium text-zinc-900 dark:text-zinc-100">{idea.voteScore} score</div>
        <div className="font-medium text-emerald-700 dark:text-emerald-300">{actionText}</div>
      </div>
    </Link>
  );
}

