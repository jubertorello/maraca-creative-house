import Link from "next/link";

type Item = { href: string; name: string; description: string };

/** Content tied to one specific public route — /home, /about, /work, etc. */
const PAGES: Item[] = [
  {
    href: "/admin/home",
    name: "Home",
    description: "Video principal, texto \"Quiénes somos\", video de abajo.",
  },
  {
    href: "/admin/about",
    name: "About us",
    description: "Video del hero y las marcas del carrusel/grilla de logos.",
  },
  {
    href: "/admin/work",
    name: "Work",
    description: "Los 6 tipos de trabajo, sus marcas y casos con página propia.",
  },
  {
    href: "/admin/team",
    name: "Team",
    description: "Video del hero, el equipo y el bloque de \"únete\".",
  },
  {
    href: "/admin/contact",
    name: "Contacto",
    description: "Textos y datos de contacto.",
  },
  {
    href: "/admin/privacy-policy",
    name: "Política de privacidad",
    description: "El texto legal completo, sección por sección.",
  },
];

/** Site-wide config/tools — not content that belongs to any one page. */
const SETTINGS: Item[] = [
  {
    href: "/admin/seo",
    name: "SEO",
    description: "Configuración general del sitio y título/descripción de cada página.",
  },
  {
    href: "/admin/footer",
    name: "Footer",
    description: "Mail de contacto y links a redes sociales, igual en todas las páginas.",
  },
  {
    href: "/admin/media",
    name: "Galería de archivos",
    description: "Todo lo subido a Cloudinary — qué se usa, dónde, y qué se puede borrar.",
  },
];

function ItemGrid({ items }: { items: Item[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((p) => (
        <Link
          key={p.href}
          href={p.href}
          className="rounded-lg border border-black/10 bg-white p-5 transition hover:border-black/25"
        >
          <h2 className="mb-1 text-base font-medium">{p.name}</h2>
          <p className="text-xs text-ink/50">{p.description}</p>
        </Link>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-medium">Páginas</h1>
      <p className="mb-8 text-sm text-ink/50">
        Elegí una página para editar el contenido que le pertenece.
      </p>
      <ItemGrid items={PAGES} />

      <h2 className="mb-1 mt-12 text-lg font-medium">Configuración</h2>
      <p className="mb-8 text-sm text-ink/50">
        Ajustes generales del sitio — no pertenecen a ninguna página en particular.
      </p>
      <ItemGrid items={SETTINGS} />
    </div>
  );
}
