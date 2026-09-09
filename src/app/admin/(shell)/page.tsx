import Link from "next/link";

const PAGES: {
  href: string;
  name: string;
  description: string;
  ready: boolean;
}[] = [
  {
    href: "/admin/home",
    name: "Home",
    description: "Video principal, texto \"Quiénes somos\", video de abajo.",
    ready: true,
  },
  {
    href: "/admin/about",
    name: "About us",
    description: "Video del hero y las marcas del carrusel/grilla de logos.",
    ready: true,
  },
  {
    href: "/admin/work",
    name: "Work",
    description: "Los 6 tipos de trabajo, sus marcas y casos con página propia.",
    ready: true,
  },
  {
    href: "/admin/team",
    name: "Team",
    description: "Video del hero, el equipo y el bloque de \"únete\".",
    ready: true,
  },
  {
    href: "/admin/contact",
    name: "Contacto",
    description: "Textos y datos de contacto.",
    ready: true,
  },
  {
    href: "/admin/privacy-policy",
    name: "Política de privacidad",
    description: "El texto legal completo, sección por sección.",
    ready: true,
  },
  {
    href: "/admin/seo",
    name: "SEO",
    description: "Configuración general del sitio y título/descripción de cada página.",
    ready: true,
  },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-medium">Páginas</h1>
      <p className="mb-8 text-sm text-ink/50">
        Elegí una página para editar el contenido que le pertenece.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {PAGES.map((p) =>
          p.ready ? (
            <Link
              key={p.href}
              href={p.href}
              className="rounded-lg border border-black/10 bg-white p-5 transition hover:border-black/25"
            >
              <h2 className="mb-1 text-base font-medium">{p.name}</h2>
              <p className="text-xs text-ink/50">{p.description}</p>
            </Link>
          ) : (
            <div
              key={p.href}
              className="rounded-lg border border-dashed border-black/10 bg-transparent p-5 opacity-50"
            >
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-base font-medium">{p.name}</h2>
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] text-ink/40">
                  Próximamente
                </span>
              </div>
              <p className="text-xs text-ink/50">{p.description}</p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
