"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="mb-3 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
        />
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
