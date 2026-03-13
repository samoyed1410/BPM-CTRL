
-- Radio tracks table for prerecorded transmissions
CREATE TABLE public.radio_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL DEFAULT '',
  description text DEFAULT '',
  cover_image_url text DEFAULT '',
  audio_url text NOT NULL,
  storage_path text NOT NULL DEFAULT '',
  duration_seconds integer DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.radio_tracks ENABLE ROW LEVEL SECURITY;

-- Public can read active tracks
CREATE POLICY "Radio tracks are publicly readable"
  ON public.radio_tracks FOR SELECT TO public
  USING (is_active = true);

-- Admins can manage
CREATE POLICY "Admins can manage radio tracks"
  ON public.radio_tracks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_radio_tracks_updated_at
  BEFORE UPDATE ON public.radio_tracks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed radio state into site_content
INSERT INTO public.site_content (section, content_key, content_value, content_type, sort_order) VALUES
  ('radio', 'radio_mode', 'off', 'text', 0),
  ('radio', 'radio_stream_url', '', 'text', 1),
  ('radio', 'radio_live_title', '', 'text', 2),
  ('radio', 'radio_live_description', '', 'text', 3),
  ('radio', 'radio_live_image', '', 'text', 4)
ON CONFLICT DO NOTHING;

-- Enable realtime for radio state changes
ALTER PUBLICATION supabase_realtime ADD TABLE public.radio_tracks;
