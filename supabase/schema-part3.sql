-- Run this too — adds the tile-image field to categories (Home /
-- /work index images, now editable per category).
alter table categories add column if not exists image text;
