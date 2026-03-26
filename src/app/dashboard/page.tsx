"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import { decodeJwt, getToken } from "../../lib/auth";

type Category = { id: string; name: string };
type MyIdea = {
  id: string;
  title: string;
  status: string;
  isPaid: boolean;
  priceCents: number | null;
  createdAt: string;
  submittedAt: string | null;
  category: { name: string };
  adminFeedback?: string | null;
};

type AdminIdea = MyIdea & { authorEmail?: string; adminFeedback?: string };
type AdminUser = { id: string; email: string; role: "MEMBER" | "ADMIN"; isActive: boolean; createdAt: string };

export default function DashboardPage() {
  const router = useRouter();
  const token = useMemo(() => getToken(), []);
  const payload = useMemo(() => (token ? decodeJwt(token) : null), [token]);
  const role = payload?.role ?? null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [myIdeas, setMyIdeas] = useState<MyIdea[]>([]);

  const [adminIdeas, setAdminIdeas] = useState<AdminIdea[]>([]);
  const [adminStatusFilter, setAdminStatusFilter] = useState<"UNDER_REVIEW" | "APPROVED" | "REJECTED" | "DRAFT">("UNDER_REVIEW");
  const [adminTab, setAdminTab] = useState<"moderation" | "users">("moderation");
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [problemStatement, setProblemStatement] = useState("");
  const [proposedSolution, setProposedSolution] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrlsCsv, setImageUrlsCsv] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [priceCents, setPriceCents] = useState<number>(500);
  const [formMode, setFormMode] = useState<"DRAFT" | "SUBMIT">("SUBMIT");
  const [formLoading, setFormLoading] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);

  const lockedCreateDisabled = !title.trim() || !categoryId || !problemStatement.trim() || !proposedSolution.trim() || !description.trim() || (isPaid && priceCents <= 0);

  async function loadMember() {
    const [cats, res] = await Promise.all([
      apiFetch<{ categories: Category[] }>("/api/categories", { auth: false }),
      apiFetch<{ ideas: MyIdea[] }>("/api/me/ideas", { auth: true }),
    ]);
    setCategories(cats.categories);
    setMyIdeas(res.ideas);
    if (!categoryId && cats.categories[0]) setCategoryId(cats.categories[0].id);
  }

  async function loadAdmin() {
    const res = await apiFetch<{ ideas: AdminIdea[] }>(`/api/admin/ideas`, {
      auth: true,
      query: { status: adminStatusFilter },
    });
    setAdminIdeas(res.ideas);
  }

  async function loadUsers() {
    const res = await apiFetch<{ users: AdminUser[] }>(`/api/admin/users`, { auth: true });
    setAdminUsers(res.users);
  }

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError(null);
    (async () => {
      try {
        if (role === "ADMIN") await loadAdmin();
        else await loadMember();
      } catch (e: any) {
        setError(e?.message ?? "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (role === "ADMIN") {
      setLoading(true);
      (async () => {
        if (adminTab === "moderation") await loadAdmin();
        if (adminTab === "users") await loadUsers();
      })()
        .catch((e: any) => setError(e?.message ?? "Failed to load ideas"))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminStatusFilter, adminTab]);

  const submitIdea = async () => {
    if (!token) return;
    setFormLoading(true);
    setError(null);
    try {
      const imageUrls = imageUrlsCsv
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (editingDraftId) {
        await apiFetch(`/api/ideas/${editingDraftId}`, {
          method: "PATCH",
          auth: true,
          body: {
            title,
            categoryId,
            problemStatement,
            proposedSolution,
            description,
            imageUrls,
            isPaid,
            priceCents: isPaid ? priceCents : undefined,
          },
        });
      } else {
        await apiFetch<{ idea: any }>("/api/ideas", {
          method: "POST",
          auth: true,
          body: {
            title,
            categoryId,
            problemStatement,
            proposedSolution,
            description,
            imageUrls,
            isPaid,
            priceCents: isPaid ? priceCents : undefined,
            mode: formMode,
          },
        });
      }

      // Reset some fields.
      setTitle("");
      setProblemStatement("");
      setProposedSolution("");
      setDescription("");
      setImageUrlsCsv("");
      setIsPaid(false);
      setPriceCents(500);
      setFormMode("SUBMIT");
      setEditingDraftId(null);

      await loadMember();
    } catch (e: any) {
      setError(e?.message ?? "Failed to submit idea.");
    } finally {
      setFormLoading(false);
    }
  };

  const submitForReview = async (id: string) => {
    await apiFetch(`/api/ideas/${id}/submit`, { method: "PATCH", auth: true });
    await loadMember();
  };

  const deleteDraft = async (id: string) => {
    await apiFetch(`/api/ideas/${id}`, { method: "DELETE", auth: true });
    await loadMember();
  };

  const editDraft = async (id: string) => {
    const res = await apiFetch<{ idea: any }>(`/api/me/ideas/${id}`, { auth: true });
    const idea = res.idea;
    setEditingDraftId(id);
    setFormMode("DRAFT");
    setTitle(idea.title ?? "");
    setCategoryId(idea.categoryId);
    setProblemStatement(idea.problemStatement ?? "");
    setProposedSolution(idea.proposedSolution ?? "");
    setDescription(idea.description ?? "");
    setImageUrlsCsv((idea.imageUrls ?? []).join(", "));
    setIsPaid(!!idea.isPaid);
    setPriceCents(idea.priceCents ?? 500);
  };

  const moderateIdea = async (id: string, next: "APPROVED" | "REJECTED") => {
    const feedback = next === "REJECTED" ? window.prompt("Rejection feedback (visible only to submitter):") ?? "" : undefined;
    await apiFetch(`/api/admin/ideas/${id}`, {
      method: "PATCH",
      auth: true,
      body: { status: next, feedback: next === "REJECTED" ? feedback : undefined },
    });
    await loadAdmin();
  };

  const updateUser = async (id: string, patch: { isActive?: boolean; role?: "MEMBER" | "ADMIN" }) => {
    await apiFetch(`/api/admin/users/${id}`, { method: "PATCH", auth: true, body: patch });
    await loadUsers();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {role === "ADMIN" ? "Admin Dashboard" : "Member Dashboard"}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {role === "ADMIN" ? "Moderate ideas and review submissions." : "Create ideas, manage drafts, and submit for review."}
          </p>
        </div>
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Role: <span className="font-semibold text-zinc-900 dark:text-zinc-100">{role}</span>
        </div>
      </div>

      {error ? <div className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/20 dark:text-red-200">{error}</div> : null}
      {loading ? (
        <div className="mt-6 animate-pulse rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-black" />
      ) : null}

      {role !== "ADMIN" ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Create Idea</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">Drafts stay private until submitted.</div>
            </div>

            <div className="grid gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Problem Statement</label>
                <textarea value={problemStatement} onChange={(e) => setProblemStatement(e.target.value)} className="h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Proposed Solution</label>
                <textarea value={proposedSolution} onChange={(e) => setProposedSolution(e.target.value)} className="h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Image URLs (comma separated)</label>
                <input value={imageUrlsCsv} onChange={(e) => setImageUrlsCsv(e.target.value)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100" placeholder="https://... , https://..." />
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
                  <input type="number" min={1} value={priceCents} onChange={(e) => setPriceCents(Number(e.target.value))} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100" />
                </div>
              ) : null}

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mode</label>
                <select value={formMode} onChange={(e) => setFormMode(e.target.value as any)} className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100">
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMIT">Submit for review</option>
                </select>
              </div>

              <button
                disabled={formLoading || lockedCreateDisabled}
                onClick={submitIdea}
                type="button"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {formLoading ? "Saving..." : editingDraftId ? "Save Draft Changes" : formMode === "DRAFT" ? "Save Draft" : "Submit Idea"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-3 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">My Ideas</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">Drafts are editable; submissions go to admin review.</div>
            </div>

            {myIdeas.length === 0 ? <div className="text-sm text-zinc-600 dark:text-zinc-300">No ideas yet.</div> : null}

            <div className="space-y-4">
              {myIdeas.map((idea) => (
                <div key={idea.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{idea.category.name}</div>
                      <div className="mt-1 line-clamp-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">{idea.title}</div>
                      <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Status: {idea.status}</div>
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

                  <div className="mt-4 flex flex-wrap gap-2">
                    {idea.status === "REJECTED" && idea.adminFeedback ? (
                      <div className="w-full rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-200">
                        Rejection feedback: {idea.adminFeedback}
                      </div>
                    ) : null}
                    {idea.status === "DRAFT" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => editDraft(idea.id)}
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-100 dark:hover:bg-zinc-900"
                        >
                          Edit Draft
                        </button>
                        <button
                          type="button"
                          onClick={() => submitForReview(idea.id)}
                          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black"
                        >
                          Submit for review
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteDraft(idea.id)}
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-100 dark:hover:bg-zinc-900"
                        >
                          Delete Draft
                        </button>
                      </>
                    ) : null}
                    {idea.status !== "DRAFT" ? <div className="text-xs text-zinc-600 dark:text-zinc-400">Not editable.</div> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Moderation Queue</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">Approve or reject ideas and include feedback on rejection.</div>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdminTab("moderation")}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    adminTab === "moderation" ? "bg-emerald-600 text-white" : "border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
                  }`}
                >
                  Moderation
                </button>
                <button
                  type="button"
                  onClick={() => setAdminTab("users")}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    adminTab === "users" ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
                  }`}
                >
                  Members
                </button>
              </div>

              {adminTab === "moderation" ? (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
                  <select
                    value={adminStatusFilter}
                    onChange={(e) => setAdminStatusFilter(e.target.value as any)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
                  >
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              ) : null}
            </div>
          </div>

          {adminTab === "moderation" ? (
            <>
              {adminIdeas.length === 0 ? <div className="text-sm text-zinc-600 dark:text-zinc-300">No ideas in this status.</div> : null}

              <div className="space-y-4">
                {adminIdeas.map((idea) => (
                  <div key={idea.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{(idea as any).category?.name ?? idea.category.name}</div>
                        <div className="mt-1 line-clamp-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">{idea.title}</div>
                        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                          Author: {(idea as any).author?.email ?? (idea as any).authorEmail ?? "Unknown"}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Status: {idea.status}</div>
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

                    {idea.status === "REJECTED" && idea.adminFeedback ? (
                      <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-900/30 dark:text-zinc-200">
                        Feedback: {idea.adminFeedback}
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => moderateIdea(idea.id, "APPROVED")}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => moderateIdea(idea.id, "REJECTED")}
                        className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {adminUsers.length === 0 ? <div className="text-sm text-zinc-600 dark:text-zinc-300">No users yet.</div> : null}
              <div className="overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-zinc-50 text-xs uppercase text-zinc-600 dark:bg-zinc-900/40 dark:text-zinc-400">
                    <tr>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Active</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((u) => (
                      <tr key={u.id} className="border-t border-zinc-200 dark:border-zinc-800">
                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{u.email}</td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            onChange={(e) => updateUser(u.id, { role: e.target.value as any })}
                            className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm outline-none dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
                          >
                            <option value="MEMBER">MEMBER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={u.isActive}
                            onChange={(e) => updateUser(u.id, { isActive: e.target.checked })}
                          />
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                          <button
                            type="button"
                            onClick={() => updateUser(u.id, { isActive: !u.isActive })}
                            className="text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-300"
                          >
                            Toggle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

