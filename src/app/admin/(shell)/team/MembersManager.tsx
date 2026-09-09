"use client";

import { useState } from "react";
import type { Member } from "@/lib/team";
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

export default function MembersManager({ initial }: { initial: Member[] }) {
  const [team, setTeam] = useState(initial);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function save(member: Member) {
    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(member),
    });
    return res.ok;
  }

  function update(slug: string, patch: Partial<Member>) {
    const prev = team;
    setTeam((list) => {
      const next = list.map((m) => (m.slug === slug ? { ...m, ...patch } : m));
      const updated = next.find((m) => m.slug === slug);
      if (updated) {
        save(updated).then((ok) => {
          if (!ok) {
            setTeam(prev);
            setError("No se pudo guardar el cambio. Probá de nuevo.");
          }
        });
      }
      return next;
    });
  }

  async function remove(slug: string) {
    if (!confirm("¿Eliminar a esta persona del equipo?")) return;
    const prev = team;
    setTeam((list) => list.filter((m) => m.slug !== slug));
    const res = await fetch(`/api/admin/team/${slug}`, { method: "DELETE" });
    if (!res.ok) {
      setTeam(prev);
      setError("No se pudo eliminar. Probá de nuevo.");
    }
  }

  async function reorder(from: number, to: number) {
    const prev = team;
    const next = move(team, from, to);
    setTeam(next);
    const res = await fetch("/api/admin/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: next.map((m) => m.slug) }),
    });
    if (!res.ok) {
      setTeam(prev);
      setError("No se pudo reordenar. Probá de nuevo.");
    }
  }

  async function addMember() {
    const name = newName.trim();
    if (!name) return;
    const slug = slugify(name);
    if (team.some((m) => m.slug === slug)) {
      alert("Ya existe alguien con ese nombre.");
      return;
    }
    const member: Member = { name, slug, role: { es: "", en: "" } };
    setTeam((list) => [...list, member]);
    setNewName("");
    const ok = await save(member);
    if (!ok) {
      setTeam((list) => list.filter((m) => m.slug !== slug));
      setError("No se pudo agregar. Probá de nuevo.");
    }
  }

  return (
    <div>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <ul className="mb-6 divide-y divide-black/10 rounded-lg border border-black/10 bg-white">
        {team.map((m, i) => (
          <li key={m.slug} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
            <div className="grid flex-1 gap-2 sm:grid-cols-3">
              <input
                value={m.name}
                onChange={(e) => update(m.slug, { name: e.target.value })}
                placeholder="Nombre"
                className="rounded-md border border-black/15 px-2 py-1.5 text-sm outline-none focus:border-ink/40"
              />
              <input
                value={m.role.es}
                onChange={(e) => update(m.slug, { role: { ...m.role, es: e.target.value } })}
                placeholder="Cargo (ES)"
                className="rounded-md border border-black/15 px-2 py-1.5 text-sm outline-none focus:border-ink/40"
              />
              <input
                value={m.role.en}
                onChange={(e) => update(m.slug, { role: { ...m.role, en: e.target.value } })}
                placeholder="Cargo (EN)"
                className="rounded-md border border-black/15 px-2 py-1.5 text-sm outline-none focus:border-ink/40"
              />
            </div>
            <div className="w-full sm:w-56">
              <MediaUrlInput
                value={m.photoUrl ?? ""}
                onChange={(url) => update(m.slug, { photoUrl: url || undefined })}
                placeholder="URL de la foto"
                accept="image/*"
              />
            </div>
            <div className="flex shrink-0 items-center gap-1">
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
                disabled={i === team.length - 1}
                className="rounded px-2 py-1 text-xs text-ink/40 hover:text-ink disabled:opacity-20"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => remove(m.slug)}
                className="rounded-md px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre de la nueva persona"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addMember();
            }
          }}
          className="flex-1 rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-ink/40"
        />
        <button
          type="button"
          onClick={addMember}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white"
        >
          + Agregar
        </button>
      </div>
    </div>
  );
}
