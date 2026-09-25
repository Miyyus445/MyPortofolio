import Link from "next/link";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pt-24">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Azmi Abiyyu Sakha — Photographer & Software Engineer</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
        Capturing light, shipping software.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
        Portofolio fotografi dan proyek IT — jelajahi galeri foto pilihan, project terbaru, dan riwayat pengalaman.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/gallery" className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-black">
          Lihat Galeri
        </Link>
        <Link href="/projects" className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800">
          Lihat Projects
        </Link>
      </div>
    </section>
  );
}
