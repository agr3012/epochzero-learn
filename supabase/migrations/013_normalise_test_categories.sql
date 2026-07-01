-- Normalise all non-comprehensive tests to "Unit Assessment".
-- "Knowledge Check" is retired; REMA domain-tag rows get a real type label.
-- Run in Supabase SQL Editor.

update public.tests
set category = 'Unit Assessment'
where category in ('Knowledge Check', 'rema')
  and is_published = true;
