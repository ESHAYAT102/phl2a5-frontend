"use client";

export default function VotePanel({
  upvotes,
  downvotes,
  userVote,
  isAuthed,
  onUpvote,
  onDownvote,
}: {
  upvotes: number;
  downvotes: number;
  userVote: 1 | -1 | null;
  isAuthed: boolean;
  onUpvote: () => void;
  onDownvote: () => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Voting</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {upvotes} upvotes • {downvotes} downvotes
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!isAuthed}
            onClick={onUpvote}
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {userVote === 1 ? "Remove Upvote" : "Upvote"}
          </button>
          <button
            type="button"
            disabled={!isAuthed}
            onClick={onDownvote}
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {userVote === -1 ? "Remove Downvote" : "Downvote"}
          </button>
        </div>
      </div>
    </div>
  );
}

