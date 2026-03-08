
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  content_key text NOT NULL,
  content_value text NOT NULL DEFAULT '',
  content_type text NOT NULL DEFAULT 'text',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(section, content_key)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Public can read active content
CREATE POLICY "Site content is publicly readable"
ON public.site_content FOR SELECT
USING (is_active = true);

-- Admins can do everything
CREATE POLICY "Admins can manage site content"
ON public.site_content FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default content
INSERT INTO public.site_content (section, content_key, content_value, content_type, sort_order) VALUES
-- Event section
('event', 'event_name', 'FREQUENCY 001', 'text', 0),
('event', 'event_tagline', 'Incoming Transmission', 'text', 1),
('event', 'event_description', 'The first transmission. An underground convergence of sound, movement, and collective energy. This is not just an event — it''s a signal activation.', 'text', 2),
('event', 'event_date', 'TBA 2026', 'text', 3),
('event', 'event_location', 'Classified', 'text', 4),
('event', 'event_capacity', 'Limited', 'text', 5),
('event', 'event_lineup', 'Incoming...', 'text', 6),
('event', 'event_cta_primary', 'Enter the Frequency', 'text', 7),
('event', 'event_cta_secondary', 'Get Notified', 'text', 8),
-- Hero section
('hero', 'hero_tagline', 'Transmitting Signal', 'text', 0),
('hero', 'hero_title', 'BPM CTRL', 'text', 1),
('hero', 'hero_subtitle_1', 'Dance is the language.', 'text', 2),
('hero', 'hero_subtitle_2', 'Fashion is the expression.', 'text', 3),
('hero', 'hero_cta_primary', 'Enter the Signal', 'text', 4),
('hero', 'hero_cta_secondary', 'Access Tickets', 'text', 5),
-- Broadcast section
('broadcast', 'broadcast_tagline', 'Live Transmissions', 'text', 0),
('broadcast', 'broadcast_title', 'BPM CTRL BROADCAST', 'text', 1),
('broadcast', 'broadcast_description', 'DJ sets, crowd moments, dance clips, and artist interviews — the signal never stops.', 'text', 2),
-- Broadcast items as JSON
('broadcast', 'broadcast_items', '[{"type":"DJ Set","title":"AFRO FREQUENCY — Live Set","description":"Full DJ set from the last underground transmission.","icon":"Play","tag":"VIDEO"},{"type":"Crowd Moment","title":"THE FLOOR SPEAKS","description":"Raw crowd energy captured in motion.","icon":"Users","tag":"MOMENT"},{"type":"Dance Clip","title":"BODY SIGNAL 003","description":"Movement is the message. Watch the language.","icon":"Radio","tag":"DANCE"},{"type":"Interview","title":"SIGNAL CARRIER — DJ ÌFÉ","description":"In conversation with the sound architect.","icon":"Mic","tag":"INTERVIEW"}]', 'json', 3),
-- Style section
('style', 'style_tagline', 'Fashion × Frequency', 'text', 0),
('style', 'style_title', 'BPM CTRL STYLE INDEX', 'text', 1),
('style', 'style_description', 'Rave culture is fashion culture. Explore the looks that define the movement.', 'text', 2),
('style', 'style_items', '[{"title":"NEON ARMOUR","category":"Streetwear","description":"Reflective layers meet underground attitude."},{"title":"PULSE DRIP","category":"Rave Fashion","description":"When the outfit speaks louder than the bass."},{"title":"FREQUENCY FIT","category":"Creative","description":"Art meets movement. Fashion as signal."},{"title":"SIGNAL WEAR","category":"Best Dressed","description":"Community pick — the look that stopped the floor."},{"title":"GLOW PROTOCOL","category":"Accessories","description":"Details that light up the dark."},{"title":"BASS COUTURE","category":"Editorial","description":"Where high fashion meets low frequencies."}]', 'json', 3),
-- Archive section
('archive', 'archive_tagline', 'Decoded Memories', 'text', 0),
('archive', 'archive_title', 'TRANSMISSION ARCHIVE', 'text', 1),
('archive', 'archive_description', 'Open past rave memories. Every signal leaves a trace.', 'text', 2),
('archive', 'archive_items', '[{"type":"video","title":"FREQUENCY 000 — Recap","description":"The genesis transmission. Relive the origin.","icon":"Play","link":"#"},{"type":"gallery","title":"Photo Transmission","description":"Visual signals from the underground.","icon":"Image","link":"#"},{"type":"external","title":"Community Signals","description":"Social transmissions from the collective.","icon":"ExternalLink","link":"#"}]', 'json', 3),
-- Community section
('community', 'community_title_1', 'We don''t just throw raves.', 'text', 0),
('community', 'community_title_2', 'We build culture.', 'text', 1),
('community', 'community_body_1', 'BPM CTRL is a Nigerian-born movement rooted in Afro house, underground dance energy, and fashion expression. We transmit a signal that connects those who move to the same frequency.', 'text', 2),
('community', 'community_body_2', 'Dance is spiritual release. Fashion is personal expression. Together they form the language of our community — a space where every body belongs and the bass hits different.', 'text', 3),
('community', 'community_body_3', 'No hierarchy. No ego. Just pulse.', 'text', 4),
-- Email signup
('email', 'email_title', 'STAY ON THE FREQUENCY', 'text', 0),
('email', 'email_description', 'Get early event access, secret drops, and community updates. No spam — only signal.', 'text', 1),
('email', 'email_cta', 'Join Signal', 'text', 2);
