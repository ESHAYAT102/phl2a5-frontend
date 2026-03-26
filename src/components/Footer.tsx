export default function Footer() {
  return (
    <footer className="mt-auto border-t bg-white/80 dark:border-zinc-800 dark:bg-black/40">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="space-y-2">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">EcoSpark Hub</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-300">Together for a cleaner planet.</div>
          </div>
          <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">Contact</div>
            <div>Email: hello@ecospark.example</div>
            <div>Phone: +1 (555) 010-2030</div>
            <div className="flex gap-3">
              <a className="hover:underline" href="#">
                Twitter
              </a>
              <a className="hover:underline" href="#">
                GitHub
              </a>
            </div>
          </div>
          <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">Additional Links</div>
            <a className="block hover:underline" href="#">
              Terms of Use
            </a>
            <a className="block hover:underline" href="#">
              Privacy Policy
            </a>
            <a className="block hover:underline" href="/about">
              FAQ
            </a>
          </div>
        </div>
        <div className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} EcoSpark Hub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

