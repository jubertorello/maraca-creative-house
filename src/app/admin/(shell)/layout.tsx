import Link from "next/link";
import Script from "next/script";
import LogoutButton from "./LogoutButton";

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f4ef] text-ink">
      {/* Loaded once here (not per upload button) — every
          CloudinaryUploadButton just polls for window.cloudinary. */}
      <Script src="https://upload-widget.cloudinary.com/global/all.js" strategy="afterInteractive" />
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/10 bg-[#f4f4ef]/95 px-6 py-3 backdrop-blur">
        <Link href="/admin" className="text-sm font-semibold tracking-tight">
          MARACA · Backoffice
        </Link>
        <nav className="flex items-center gap-4 text-sm text-ink/60">
          <Link href="/admin" className="hover:text-ink">
            Páginas
          </Link>
          <Link href="/admin/home" className="hover:text-ink">
            Home
          </Link>
          <Link href="/admin/about" className="hover:text-ink">
            About
          </Link>
          <Link href="/admin/work" className="hover:text-ink">
            Work
          </Link>
          <Link href="/admin/team" className="hover:text-ink">
            Team
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink"
          >
            Ver web ↗
          </a>
          <LogoutButton />
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
