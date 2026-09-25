"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-zinc-500 sm:px-6">
      © {new Date().getFullYear()} Azmi Abiyyu Sakha. All rights reserved
      <Link
        href="/admin/login"
        className="cursor-pointer select-none text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
      >
        .
      </Link>
    </footer>
  );
}
