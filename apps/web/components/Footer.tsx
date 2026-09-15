"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-zinc-500 sm:px-6">
      © {new Date().getFullYear()} Portfolio. Built with Next.js + NestJS.
    </footer>
  );
}
