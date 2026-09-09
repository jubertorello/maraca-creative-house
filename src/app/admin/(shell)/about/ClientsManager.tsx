"use client";

import { useState } from "react";
import type { Client } from "@/lib/clients";
import MediaUrlInput from "../MediaUrlInput";

function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const copy = [...arr];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ClientsManager({ initial }: { initial: Client[] }) {
  const [clients, setClients] = useState(initial);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function save(client: Client) {
    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(client),
    });
    return res.ok;
  }

  function update(slug: string, patch: Partial<Client>) {
    const prev = clients;
    setClients((list) => {
      const next = list.map((c) => (c.slug === slug ? { ...c, ...patch } : c));
      const updated = next.find((c) => c.slug === slug);
      if (updated) {
        save(updated).then((ok) => {
          if (!ok) {
            setClients(prev);
            setError("No se pudo guardar el cambio. Probá de nuevo.");
          }
        });
      }
      return next;
    });
  }

  async function remove(slug: string) {
    if (!confirm("¿Eliminar esta marca?")) return;
    const prev = clients;
    setClients((list) => list.filter((c) => c.slug !== slug));
    const res = await fetch(`/api/admin/clients/${slug}`, { method: "DELETE" });
    if (!res.ok) {
      setClients(prev);
      setError("No se pudo eliminar la marca. Probá de nuevo.");
    }
  }

  async function reorder(from: number, to: number) {
    const prev = clients;
    const next = move(clients, from, to);
    setClients(next);
    const res = await fetch("/api/admin/clients", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: next.map((c) => c.slug) }),
    });
    if (!res.ok) {
      setClients(prev);
      setError("No se pudo reordenar. Probá de nuevo.");
    }
  }

  async function addClient() {
    const name = newName.trim();
    if (!name) return;
    const slug = slugify(name);
    if (clients.some((c) => c.slug === slug)) {
      alert("Ya existe una marca con ese nombre.");
      return;
    }
    const client: Client = { name, slug };
    setClients((list) => [...list, client]);
    setNewName("");
    const ok = await save(client);
    if (!ok) {
      setClients((list) => list.filter((c) => c.slug !== slug));
      setError("No se pudo agregar la marca. Probá de nuevo.");
    }
  }

  return (
    <div>
      <p className="mb-4 text-sm text-ink/50">
        Alimenta el carrusel de la Home y esta grilla de logos. Una marca sin logo se
        muestra como texto.
      </p>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <ul className="mb-6 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {clients.map((c, i) => (
          <li key={c.slug} className="flex items-center gap-3 px-4 py-3">
            <input
              value={c.name}
              onChange={(e) => update(c.slug, { name: e.target.value })}
              className="w-40 shrink-0 rounded-md border border-black/15 px-2 py-1.5 text-sm outline-none focus:border-ink/40"
            />
            <div className="min-w-0 flex-1">
              <MediaUrlInput
                value={c.logoUrl ?? ""}
                onChange={(url) => update(c.slug, { logoUrl: url || undefined })}
                placeholder="URL del logo (o vacío = solo texto)"
                accept="image/*"
              />
            </div>
            <button
              type="button"
              onClick={() => reorder(i, i - 1)}
              disabled={i === 0}
              className="rounded px-2 py-1 text-xs text-ink/40 hover:text-ink disabled:opacity-20"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => reorder(i, i + 1)}
              disabled={i === clients.length - 1}
              className="rounded px-2 py-1 text-xs text-ink/40 hover:text-ink disabled:opacity-20"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => remove(c.slug)}
              className="rounded-md px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre de la marca nueva"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addClient();
            }
          }}
          className="flex-1 rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
        />
        <button
          type="button"
          onClick={addClient}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white"
        >
          + Agregar marca
        </button>
      </div>
    </div>
  );
}
