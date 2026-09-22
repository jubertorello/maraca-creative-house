"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c7 0 10.5 7 10.5 7a13.5 13.5 0 0 1-3.1 3.9M6.6 6.6C3.5 8.6 1.5 12 1.5 12S5 19 12 19a10.6 10.6 0 0 0 5.4-1.5" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Contraseña incorrecta.");
      return;
    }
    router.push(params.get("from") || "/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f4ef] px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-xl border border-black/10 bg-white p-8 shadow-sm"
      >
        <h1 className="mb-1 text-lg font-medium text-ink">Backoffice MARACA</h1>
        <p className="mb-6 text-sm text-ink/50">Ingresá la contraseña para continuar.</p>
        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-md border border-black/15 py-2 pl-3 pr-9 text-sm outline-none focus:border-ink/40"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full rounded-md bg-ink px-3 py-2 text-sm font-medium text-white transition disabled:opacity-40"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
