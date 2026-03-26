"use client";

import type { FormEvent } from "react";

type Category = { id: string; name: string };

export default function IdeaEditorForm(props: {
  categories: Category[];
  title: string;
  setTitle: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  problemStatement: string;
  setProblemStatement: (v: string) => void;
  proposedSolution: string;
  setProposedSolution: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  imageUrlsCsv: string;
  setImageUrlsCsv: (v: string) => void;
  isPaid: boolean;
  setIsPaid: (v: boolean) => void;
  priceCents: number;
  setPriceCents: (v: number) => void;
  formMode: "DRAFT" | "SUBMIT";
  setFormMode: (v: "DRAFT" | "SUBMIT") => void;
  editingDraftId: string | null;
  formLoading: boolean;
  disabled: boolean;
  onSubmit: () => void;
}) {
  const {
    categories,
    title,
    setTitle,
    categoryId,
    setCategoryId,
    problemStatement,
    setProblemStatement,
    proposedSolution,
    setProposedSolution,
    description,
    setDescription,
    imageUrlsCsv,
    setImageUrlsCsv,
    isPaid,
    setIsPaid,
    priceCents,
    setPriceCents,
    formMode,
    setFormMode,
    editingDraftId,
    formLoading,
    disabled,
    onSubmit,
  } = props;

  const buttonText = formLoading
    ? "Saving..."
    : editingDraftId
      ? "Save Draft Changes"
      : formMode === "DRAFT"
        ? "Save Draft"
        : "Submit Idea";

  const onLocalSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="lg:col-span-2 space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
      <div>
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Create Idea</div>
        <div className="text-sm text-zinc-600 dark:text-zinc-300">Drafts stay private until submitted.</div>
      </div>

      <form onSubmit={onLocalSubmit} className="grid gap-3">
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Problem Statement</label>
          <textarea
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            className="h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Proposed Solution</label>
          <textarea
            value={proposedSolution}
            onChange={(e) => setProposedSolution(e.target.value)}
            className="h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Image URLs (comma separated)</label>
          <input
            value={imageUrlsCsv}
            onChange={(e) => setImageUrlsCsv(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
            placeholder="https://... , https://..."
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="space-y-0.5">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Paid Idea</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-300">Users must pay to unlock voting/comments.</div>
          </div>
          <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />
        </div>

        {isPaid ? (
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Price (cents)</label>
            <input
              type="number"
              min={1}
              value={priceCents}
              onChange={(e) => setPriceCents(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
            />
          </div>
        ) : null}

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mode</label>
          <select
            value={formMode}
            onChange={(e) => setFormMode(e.target.value as "DRAFT" | "SUBMIT")}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
          >
            <option value="DRAFT">Draft</option>
            <option value="SUBMIT">Submit for review</option>
          </select>
        </div>

        <button
          disabled={disabled || formLoading}
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
}

