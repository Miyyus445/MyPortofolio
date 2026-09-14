import type { Metadata } from "next";
import localFont from "next/font/local";
import { Navbar } from "../components/Navbar";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Portfolio — Photography & Engineering",
  description: "Photography gallery, IT projects, and experience.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-zinc-500 sm:px-6">
          © {new Date().getFullYear()} Portfolio. Built with Next.js + NestJS.
        </footer>
      </body>
    </html>
  );
}
