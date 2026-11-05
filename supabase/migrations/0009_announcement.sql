-- Announcement bar at the very top of the store, edited at /admin/announcement.
-- Lives in site_settings, so the existing rules apply: everyone can read it, only owners and managers can change it.
insert into public.site_settings (key, value) values ('announcement', jsonb_build_object(
  'on', true,
  'text', 'Delivery & pickup every Friday · Nationwide shipping',
  'link', '',
  'linkLabel', '',
  'tone', 'deep'
)) on conflict (key) do nothing;
