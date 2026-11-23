alter table public.profiles
 add constraint profiles_display_name_canonical check (display_name = btrim(display_name)),
 add constraint profiles_bio_canonical check (bio = btrim(bio));
