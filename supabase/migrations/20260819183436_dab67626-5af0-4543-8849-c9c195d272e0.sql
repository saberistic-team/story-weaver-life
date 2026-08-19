-- Drop the unused Stripe billing identifier from public profiles to close the exposed sensitive data finding.
ALTER TABLE public.profiles DROP COLUMN IF EXISTS stripe_customer_id;

-- Replace the public and authenticated bible entry read policies so they only expose entries
-- when the parent series is public and published.
DROP POLICY IF EXISTS "Public can read public bible entries" ON public.story_bible_entries;
DROP POLICY IF EXISTS "Players can read non-draft bible entries" ON public.story_bible_entries;

CREATE POLICY "Public can read public bible entries"
  ON public.story_bible_entries
  FOR SELECT
  TO anon
  USING (
    visibility = 'public'
    AND state != 'draft'
    AND EXISTS (
      SELECT 1 FROM public.series s
      WHERE s.id = story_bible_entries.series_id
        AND s.is_public = true
        AND s.status = 'published'
    )
  );

CREATE POLICY "Players can read non-draft bible entries"
  ON public.story_bible_entries
  FOR SELECT
  TO authenticated
  USING (
    state != 'draft'
    AND EXISTS (
      SELECT 1 FROM public.series s
      WHERE s.id = story_bible_entries.series_id
        AND s.is_public = true
        AND s.status = 'published'
    )
  );