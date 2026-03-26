"use client";

import type { FormEvent } from "react";

export default function CommentComposer(props: {
  isAuthed: boolean;
  content: string;
  setContent: (v: string) => void;
  replyTo: string | null;
  onCancelReply: () => void;
  commentLoading: boolean;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <form onSubmit={props.onSubmit} className="mt-5 space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Add a comment</label>
        <textarea
          value={props.content}
          onChange={(e) => props.setContent(e.target.value)}
          className="h-28 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
          required
          placeholder="Share your thoughts..."
        />
      </div>

      {props.replyTo ? (
        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          Replying to comment <span className="font-semibold">{props.replyTo}</span>{" "}
          <button
            type="button"
            className="ml-2 font-medium text-emerald-700 hover:underline dark:text-emerald-300"
            onClick={props.onCancelReply}
          >
            Cancel
          </button>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          disabled={!props.isAuthed || props.commentLoading}
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {props.commentLoading ? "Posting..." : "Post Comment"}
        </button>
        {!props.isAuthed ? (
          <a className="text-sm font-medium text-zinc-700 underline dark:text-zinc-300" href="/login">
            Login to comment
          </a>
        ) : null}
      </div>
    </form>
  );
}

