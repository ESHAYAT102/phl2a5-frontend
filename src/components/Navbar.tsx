"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clearToken, decodeJwt, getToken } from "../lib/auth";

export default function Navbar() {
  // Render consistently during SSR/hydration (token unknown on server),
  // then load from localStorage after mount.
  const [token, setToken] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToken(getToken());

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "ecospark_token") {
        setToken(e.newValue);
      }
    };

    const handleFocus = () => {
      setToken(getToken());
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const payload = useMemo(() => (token ? decodeJwt(token) : null), [token]);
  const role = payload?.role ?? null;

  const logout = () => {
    clearToken();
    window.location.href = "/";
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-black/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          EcoSpark Hub
        </Link>

        <nav className="hidden items-center gap-4 text-sm md:flex">
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
          <Link className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" href="/about">
            About Us
          </Link>
          <Link className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white" href="/blog">
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

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-md border border-zinc-200 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-800 dark:text-zinc-100 md:hidden"
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? "Close" : "Menu"}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800 md:hidden">
          <div className="flex flex-col gap-2 text-sm">
            <Link onClick={closeMobile} className="rounded-md px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900" href="/">
              Home
            </Link>
            <Link onClick={closeMobile} className="rounded-md px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900" href="/ideas">
              Ideas
            </Link>
            <Link onClick={closeMobile} className="rounded-md px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900" href="/dashboard">
              Dashboard
            </Link>
            <Link onClick={closeMobile} className="rounded-md px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900" href="/about">
              About Us
            </Link>
            <Link onClick={closeMobile} className="rounded-md px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900" href="/blog">
              Blog
            </Link>
            {token ? (
              <Link onClick={closeMobile} className="rounded-md px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900" href="/profile">
                My Profile
              </Link>
            ) : null}
            <div className="mt-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
              {token ? (
                <button
                  onClick={logout}
                  className="w-full rounded-md bg-zinc-900 px-3 py-2 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black"
                  type="button"
                  title={role ? `Role: ${role}` : "Logged in"}
                >
                  Logout
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    onClick={closeMobile}
                    href="/login"
                    className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-center text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-100"
                  >
                    Login
                  </Link>
                  <Link
                    onClick={closeMobile}
                    href="/register"
                    className="rounded-md bg-zinc-900 px-3 py-2 text-center text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

