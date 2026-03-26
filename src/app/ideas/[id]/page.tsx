"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "../../../lib/api";
import { getToken } from "../../../lib/auth";
import CommentsTree, { type CommentNode } from "../../../components/CommentsTree";
import VotePanel from "../../../components/VotePanel";

type IdeaDetailsResponse = {
  idea: {
    id: string;
    title: string;
    category: { id: string; name: string };
    authorEmail: string;
    submittedAt: string | null;
    status: string;
    isPaid: boolean;
    priceCents: number | null;
    problemStatement: string;
    proposedSolution: string;
    description: string;
    imageUrls: string[];
    videoUrl: string | null;
    pdfUrl: string | null;
    adminFeedback: string | null;
  };
  metrics: { upvotes: number; downvotes: number; commentCount: number };
  userVote: 1 | -1 | null;
  comments: CommentNode[];
};

export default function IdeaDetailsPage() {
  const params = useParams<{ id: string }>();
  const ideaId = params.id;

  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<IdeaDetailsResponse | null>(null);
  const [userVote, setUserVote] = useState<1 | -1 | null>(null);

  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const token = useMemo(() => getToken(), []);
  const canCheckout = !!token;

  async function load() {
    if (!ideaId) return;
    setLoading(true);
    setError(null);
    setLocked(false);
    try {
      const res = await apiFetch<IdeaDetailsResponse>(`/api/ideas/${ideaId}`, { auth: true });
      setData(res);
      setUserVote(res.userVote);
    } catch (e: unknown) {
      const status = typeof e === "object" && e ? (e as { status?: unknown }).status : undefined;
      const message = e instanceof Error ? e.message : null;
      if (status === 402) {
        setLocked(true);
        setError(message ?? "Payment required.");
      } else {
        setError(message ?? "Failed to load idea.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId]);

  const refresh = () => load();

  const vote = async (direction: 1 | -1) => {
    if (!token) return;
    await apiFetch(`/api/ideas/${ideaId}/vote`, {
      method: "POST",
      body: { direction: String(direction) },
      auth: true,
    });
    await refresh();
  };

  const removeVote = async () => {
    if (!token) return;
    await apiFetch(`/api/ideas/${ideaId}/vote`, { method: "DELETE", auth: true });
    await refresh();
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!content.trim()) return;
    setCommentLoading(true);
    try {
      await apiFetch(`/api/ideas/${ideaId}/comments`, {
        method: "POST",
        auth: true,
        body: { content, parentId: replyTo ?? undefined },
      });
      setContent("");
      setReplyTo(null);
      await refresh();
    } finally {
      setCommentLoading(false);
    }
  };

  const checkout = async () => {
    if (!token) return;
    setCheckoutLoading(true);
    try {
      await apiFetch(`/api/purchases/checkout`, {
        method: "POST",
        auth: true,
        body: { ideaId, provider: "mock" },
      });
      setLocked(false);
      await refresh();
    } catch {
      setError("Payment failed.");
    } finally {
      setCheckoutLoading(false);
    }
  };


  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {loading ? (
        <div className="animate-pulse rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-black">
          Loading idea...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {locked && !data ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="text-lg font-semibold text-amber-900 dark:text-amber-200">This is a paid idea.</div>
          <div className="mt-2 text-sm text-amber-800 dark:text-amber-100">Purchase is required to view details, vote, or comment.</div>
          <div className="mt-4">
            {canCheckout ? (
              <button
                type="button"
                disabled={checkoutLoading}
                onClick={checkout}
                className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-60"
              >
                {checkoutLoading ? "Processing..." : "Pay to Unlock (Mock)"}
              </button>
            ) : (
              <a href="/login" className="text-sm font-medium text-amber-900 underline dark:text-amber-200">
                Login to purchase
              </a>
            )}
          </div>
        </div>
      ) : null}

      {data ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
                    {data.idea.category.name}
                  </span>
                  {data.idea.isPaid ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                      Paid
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
                      Free
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{data.idea.title}</h1>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  By {data.idea.authorEmail} {data.idea.submittedAt ? `• Submitted ${new Date(data.idea.submittedAt).toLocaleDateString()}` : ""}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-5">
              <div className="md:col-span-3 space-y-4">
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Problem Statement</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{data.idea.problemStatement}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Proposed Solution</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{data.idea.proposedSolution}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Description</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">{data.idea.description}</div>
                </div>
              </div>
              <div className="md:col-span-2">
                {data.idea.imageUrls?.length ? (
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Supporting Images</div>
                    <div className="grid gap-2">
                      {data.idea.imageUrls.slice(0, 4).map((url: string) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={url} src={url} alt="" className="h-28 w-full rounded-lg object-cover" />
                      ))}
                    </div>
                  </div>
                ) : null}

                {data.idea.pdfUrl ? (
                  <a className="mt-4 block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300" href={data.idea.pdfUrl}>
                    View PDF attachment
                  </a>
                ) : null}

                {data.idea.videoUrl ? (
                  <a className="mt-2 block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300" href={data.idea.videoUrl}>
                    View video attachment
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <VotePanel
            upvotes={data.metrics.upvotes}
            downvotes={data.metrics.downvotes}
            userVote={userVote}
            isAuthed={!!token}
            onUpvote={() => (userVote === 1 ? removeVote() : vote(1))}
            onDownvote={() => (userVote === -1 ? removeVote() : vote(-1))}
          />

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Comments</div>
                <div className="text-sm text-zinc-600 dark:text-zinc-400">{data.metrics.commentCount} total comments</div>
              </div>
            </div>

            <form onSubmit={submitComment} className="mt-5 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Add a comment</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-28 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
                  required
                  placeholder="Share your thoughts..."
                />
              </div>
              {replyTo ? (
                <div className="text-xs text-zinc-600 dark:text-zinc-400">
                  Replying to comment <span className="font-semibold">{replyTo}</span>{" "}
                  <button type="button" className="ml-2 font-medium text-emerald-700 hover:underline dark:text-emerald-300" onClick={() => setReplyTo(null)}>
                    Cancel
                  </button>
                </div>
              ) : null}
              <div className="flex items-center gap-3">
                <button
                  disabled={!token || commentLoading}
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {commentLoading ? "Posting..." : "Post Comment"}
                </button>
                {!token ? (
                  <a className="text-sm font-medium text-zinc-700 underline dark:text-zinc-300" href="/login">
                    Login to comment
                  </a>
                ) : null}
              </div>
            </form>

            <div className="mt-6">
              <CommentsTree nodes={data.comments} onReply={(id) => setReplyTo(id)} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

