"use client";

export type CommentNode = {
  id: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  replies: CommentNode[];
};

export default function CommentsTree({ nodes, onReply }: { nodes: CommentNode[]; onReply: (commentId: string) => void }) {
  return (
    <div className="space-y-4">
      {nodes.map((c) => (
        <div key={c.id} className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-black">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-medium text-zinc-500">User: {c.userId}</div>
              <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">{c.content}</div>
            </div>
            <div className="shrink-0">
              <button
                type="button"
                className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-300"
                onClick={() => onReply(c.id)}
              >
                Reply
              </button>
            </div>
          </div>
          {c.replies?.length ? (
            <div className="mt-3 border-l border-zinc-200 pl-3 dark:border-zinc-800">
              <CommentsTree nodes={c.replies} onReply={onReply} />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

