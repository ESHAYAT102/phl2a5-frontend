"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clearToken, decodeJwt, getToken } from "../lib/auth";

export default function Navbar() {
  // Render consistently during SSR/hydration (token unknown on server),
  // then load from localStorage after mount.
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(getToken());
  }, []);

  const payload = useMemo(() => (token ? decodeJwt(token) : null), [token]);
  const role = payload?.role ?? null;

  const logout = () => {
    clearToken();
    window.location.href = "/";
  };

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          EcoSpark Hub
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" href="/">
            Home
          </Link>
          <Link className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" href="/ideas">
            Ideas
          </Link>
          <Link className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" href="/dashboard">
            Dashboard
          </Link>
          {token ? (
            <Link className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" href="/profile">
              My Profile
            </Link>
          ) : null}
          <Link className="hidden text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white sm:inline-flex" href="/about">
            About Us
          </Link>
          <Link className="hidden text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white sm:inline-flex" href="/blog">
            Blog
          </Link>

          {token ? (
            <button
              onClick={logout}
              className="rounded-md bg-zinc-900 px-3 py-2 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black"
              type="button"
              title={role ? `Role: ${role}` : "Logged in"}
            >
              Logout
            </button>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-zinc-900 px-3 py-2 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

