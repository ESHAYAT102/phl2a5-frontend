"use client";

import type { ReactNode } from "react";

export default function AuthCard(props: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{props.title}</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{props.subtitle}</p>
      <div className="mt-6 space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black">
        {props.children}
      </div>
    </div>
  );
}

