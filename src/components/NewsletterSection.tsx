"use client";

import { useState } from "react";
import { apiFetch } from "../lib/api";

export default function NewsletterSection() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterStatus("loading");
    try {
      await apiFetch("/api/newsletter/subscribe", {
        method: "POST",
        auth: false,
        body: { email: newsletterEmail },
      });
      setNewsletterStatus("success");
      setNewsletterEmail("");
    } catch {
      setNewsletterStatus("error");
    }
  };

  return (
    <section className="border-t bg-white/60 dark:border-zinc-800 dark:bg-black/30">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Newsletter</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">Get updates about new ideas, top voted projects, and announcements.</p>
          </div>
        </div>

        <form onSubmit={subscribe} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="w-full flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
            type="email"
            required
            placeholder="you@example.com"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
          />
          <button
            disabled={newsletterStatus === "loading"}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-100 dark:text-black"
            type="submit"
          >
            {newsletterStatus === "loading" ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        {newsletterStatus === "success" && (
          <div className="mt-3 text-sm text-emerald-700 dark:text-emerald-300">Subscribed!</div>
        )}
        {newsletterStatus === "error" && (
          <div className="mt-3 text-sm text-red-600">Subscription failed. Check your email.</div>
        )}
      </div>
    </section>
  );
}

