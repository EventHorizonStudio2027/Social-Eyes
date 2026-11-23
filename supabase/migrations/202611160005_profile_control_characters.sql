alter table public.profiles
 add constraint profiles_display_name_no_controls check (display_name !~ '[[:cntrl:]]'),
 add constraint profiles_bio_no_controls check (translate(bio, chr(10), '') !~ '[[:cntrl:]]');
