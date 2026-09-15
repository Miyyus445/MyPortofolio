"use client";

import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { AuthProvider } from "../lib/auth-context";
import { ReactNode } from "react";

export default function ClientLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <AuthProvider>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </AuthProvider>
    </>
  );
}