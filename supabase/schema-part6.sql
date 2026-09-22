-- Adds per-category "manifesto" content (video + title/description/closing
-- line for kind="manifesto" categories, e.g. Estrategia, Campañas,
-- Contenido, Web, Eventos) — same jsonb-column pattern as image/seo_title.
alter table categories add column if not exists manifesto jsonb;
