-- Run this too — adds optional per-category/per-case SEO overrides.
-- (site_content rows for "seo" and "privacyPolicy" don't need a schema
-- change — that table's `data` column is jsonb — they'll just appear the
-- first time they're saved from /admin/seo and /admin/privacy-policy.)
alter table categories add column if not exists seo_title text;
alter table categories add column if not exists seo_description text;
alter table cases add column if not exists seo_title text;
alter table cases add column if not exists seo_description text;
