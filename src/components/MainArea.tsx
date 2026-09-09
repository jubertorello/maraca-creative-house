"use client";

import { usePathname } from "next/navigation";

/** Wraps page content with the top padding that clears the fixed public
 * Navbar — skipped on /admin, which has no Navbar and manages its own
 * layout. Keeping this in one place (instead of duplicating the check
 * in every layout) mirrors how Navbar/Footer opt themselves out. */
export default function MainArea({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <main className={`flex flex-1 flex-col ${isAdmin ? "" : "pt-20 md:pt-[120px]"}`}>
      {children}
    </main>
  );
}
