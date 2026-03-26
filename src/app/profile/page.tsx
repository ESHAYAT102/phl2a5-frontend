"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/api";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch<{ user: any }>("/api/me", { auth: true });
        setUser(res.user);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="mx-auto max-w-md px-4 py-10">Loading...</div>;
  if (error) return <div className="mx-auto max-w-md px-4 py-10 text-sm text-red-600">{error}</div>;

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">My Profile</h1>
      <div className="mt-6 space-y-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
        <div className="text-sm text-zinc-600 dark:text-zinc-300">
          Email: <span className="font-medium text-zinc-900 dark:text-zinc-100">{user?.email}</span>
        </div>
        <div className="text-sm text-zinc-600 dark:text-zinc-300">
          Role: <span className="font-medium text-zinc-900 dark:text-zinc-100">{user?.role}</span>
        </div>
        <div className="text-sm text-zinc-600 dark:text-zinc-300">
          Active: <span className="font-medium text-zinc-900 dark:text-zinc-100">{String(user?.isActive)}</span>
        </div>
      </div>
    </div>
  );
}

