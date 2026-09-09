import Link from "next/link";
import { readCategories, readCases } from "@/lib/admin-data";

export default async function AdminWorkPage() {
  const [categories, cases] = await Promise.all([readCategories(), readCases()]);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-medium">Work</h1>
      <p className="mb-8 text-sm text-ink/50">
        Los 6 tipos de trabajo que se muestran en Home y en /work. Elegí uno para editar su
        nombre, imagen y los casos/marcas que tiene.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((cat) => {
          const count = cases.filter((c) => c.category === cat.slug).length;
          return (
            <Link
              key={cat.slug}
              href={`/admin/work/${cat.slug}`}
              className="rounded-lg border border-black/10 bg-white p-5 transition hover:border-black/25"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-ink/40">[{cat.index}]</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    cat.enabled
                      ? "bg-green-100 text-green-700"
                      : "bg-black/5 text-ink/40"
                  }`}
                >
                  {cat.enabled ? "Activa" : "Oculta"}
                </span>
              </div>
              <h2 className="mb-1 text-base font-medium">{cat.name.es}</h2>
              <p className="text-xs text-ink/50">
                {cat.clients.length} marcas
                {(cat.kind ?? "listing") === "listing"
                  ? ` · ${count} ${count === 1 ? "caso" : "casos"} con página`
                  : ""}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
