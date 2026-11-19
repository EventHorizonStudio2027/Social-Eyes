-- Reject ASCII control characters in profile names and bios; preserve bio line feeds.
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_display_name_no_controls;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_display_name_no_controls
  CHECK (display_name !~ '[[:cntrl:]]');
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_bio_no_controls;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_bio_no_controls
  CHECK (translate(bio, chr(10), '') !~ '[[:cntrl:]]');
