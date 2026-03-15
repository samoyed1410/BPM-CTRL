-- Signal identities for functional Join Signal flow
CREATE TABLE IF NOT EXISTS public.signal_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alias text NOT NULL,
  alias_normalized text NOT NULL UNIQUE,
  xp integer NOT NULL DEFAULT 50,
  join_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT signal_alias_length CHECK (char_length(alias) BETWEEN 3 AND 32),
  CONSTRAINT signal_alias_charset CHECK (alias ~ '^[A-Za-z0-9 _.-]+$')
);

ALTER TABLE public.signal_identities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Signal identities are publicly readable" ON public.signal_identities;
CREATE POLICY "Signal identities are publicly readable"
ON public.signal_identities
FOR SELECT
TO anon, authenticated
USING (true);

GRANT SELECT ON public.signal_identities TO anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_signal_identities_xp ON public.signal_identities (xp DESC, updated_at DESC);

CREATE OR REPLACE FUNCTION public.submit_signal_alias(p_alias text)
RETURNS TABLE (
  id uuid,
  alias text,
  xp integer,
  join_count integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_alias text;
  v_normalized text;
BEGIN
  v_alias := trim(p_alias);

  IF v_alias IS NULL OR char_length(v_alias) < 3 OR char_length(v_alias) > 32 THEN
    RAISE EXCEPTION 'Alias must be between 3 and 32 characters';
  END IF;

  IF v_alias !~ '^[A-Za-z0-9 _.-]+$' THEN
    RAISE EXCEPTION 'Alias contains invalid characters';
  END IF;

  v_normalized := lower(v_alias);

  RETURN QUERY
  INSERT INTO public.signal_identities (alias, alias_normalized, xp, join_count)
  VALUES (v_alias, v_normalized, 50, 1)
  ON CONFLICT (alias_normalized)
  DO UPDATE
    SET alias = EXCLUDED.alias,
        join_count = public.signal_identities.join_count + 1,
        xp = LEAST(public.signal_identities.xp + 50, 5000),
        updated_at = now()
  RETURNING
    public.signal_identities.id,
    public.signal_identities.alias,
    public.signal_identities.xp,
    public.signal_identities.join_count,
    public.signal_identities.created_at,
    public.signal_identities.updated_at;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_signal_alias(text) TO anon, authenticated;

DROP TRIGGER IF EXISTS update_signal_identities_updated_at ON public.signal_identities;
CREATE TRIGGER update_signal_identities_updated_at
BEFORE UPDATE ON public.signal_identities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Keep radio metadata keys available for Transmission Center
INSERT INTO public.site_content (section, content_key, content_value, content_type, sort_order, is_active)
SELECT 'radio', 'radio_mode', 'off', 'text', 0, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_content WHERE section = 'radio' AND content_key = 'radio_mode'
);

INSERT INTO public.site_content (section, content_key, content_value, content_type, sort_order, is_active)
SELECT 'radio', 'radio_stream_url', '', 'text', 1, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_content WHERE section = 'radio' AND content_key = 'radio_stream_url'
);

INSERT INTO public.site_content (section, content_key, content_value, content_type, sort_order, is_active)
SELECT 'radio', 'radio_live_title', '', 'text', 2, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_content WHERE section = 'radio' AND content_key = 'radio_live_title'
);

INSERT INTO public.site_content (section, content_key, content_value, content_type, sort_order, is_active)
SELECT 'radio', 'radio_live_description', '', 'text', 3, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_content WHERE section = 'radio' AND content_key = 'radio_live_description'
);

INSERT INTO public.site_content (section, content_key, content_value, content_type, sort_order, is_active)
SELECT 'radio', 'radio_live_image', '', 'text', 4, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_content WHERE section = 'radio' AND content_key = 'radio_live_image'
);

-- Seed article template + content container
INSERT INTO public.site_content (section, content_key, content_value, content_type, sort_order, is_active)
SELECT 'articles', 'articles_template',
'{"titleMaxWords":12,"introMaxWords":45,"bodyMaxWords":500,"heroWidth":1600,"heroHeight":900,"galleryWidth":1080,"galleryHeight":1080,"galleryCount":2}',
'json', 0, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_content WHERE section = 'articles' AND content_key = 'articles_template'
);

INSERT INTO public.site_content (section, content_key, content_value, content_type, sort_order, is_active)
SELECT 'articles', 'articles_items', '[]', 'json', 1, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_content WHERE section = 'articles' AND content_key = 'articles_items'
);

INSERT INTO public.site_content (section, content_key, content_value, content_type, sort_order, is_active)
SELECT 'articles', 'articles_tagline', 'Field Notes', 'text', 2, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_content WHERE section = 'articles' AND content_key = 'articles_tagline'
);

INSERT INTO public.site_content (section, content_key, content_value, content_type, sort_order, is_active)
SELECT 'articles', 'articles_title', 'TRANSMISSION ARTICLES', 'text', 3, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_content WHERE section = 'articles' AND content_key = 'articles_title'
);

INSERT INTO public.site_content (section, content_key, content_value, content_type, sort_order, is_active)
SELECT 'articles', 'articles_description', 'Long-form signal drops with structured media layouts managed from admin.', 'text', 4, true
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_content WHERE section = 'articles' AND content_key = 'articles_description'
);

-- Realtime sync for radio + signal features
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.radio_tracks;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.signal_identities;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END $$;