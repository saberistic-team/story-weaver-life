-- Enums for Milestone 2
CREATE TYPE public.bible_entry_state AS ENUM ('draft', 'canon', 'deprecated', 'spoiler');
CREATE TYPE public.bible_entry_visibility AS ENUM ('public', 'players_only', 'spoiler_gated');
CREATE TYPE public.canon_status AS ENUM ('canon', 'alternate', 'apocryphal', 'draft');

-- Story Bible entries: editorial state + visibility + spoiler gate + approval
ALTER TABLE public.story_bible_entries
  ADD COLUMN state public.bible_entry_state NOT NULL DEFAULT 'canon',
  ADD COLUMN visibility public.bible_entry_visibility NOT NULL DEFAULT 'public',
  ADD COLUMN spoiler_chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  ADD COLUMN approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Fork lineage: chapters and games can branch from earlier chapters/games
ALTER TABLE public.chapters
  ADD COLUMN forked_from_chapter_id uuid REFERENCES public.chapters(id) ON DELETE SET NULL,
  ADD COLUMN forked_from_game_id uuid REFERENCES public.games(id) ON DELETE SET NULL;

ALTER TABLE public.games
  ADD COLUMN forked_from_game_id uuid REFERENCES public.games(id) ON DELETE SET NULL;

-- Editorial status on individual contributions
ALTER TABLE public.contributions
  ADD COLUMN canon_status public.canon_status NOT NULL DEFAULT 'draft';

-- Streak / activity tracking
ALTER TABLE public.profiles
  ADD COLUMN last_active_at timestamp with time zone;

-- Achievement definitions in config (UI + logic source of truth)
INSERT INTO public.app_config (key, value, updated_at) VALUES
  ('achievements', '[
    {"code":"first_contribution","name":"First Words","description":"Submit your first turn in a live game.","icon":"PenLine","story_points":25,"kind":"contribution"},
    {"code":"chapter_published","name":"Published Hand","description":"One of your games became a published chapter.","icon":"BookOpen","story_points":60,"kind":"contribution"},
    {"code":"five_games","name":"Regular","description":"Play in 5 completed or published games.","icon":"Users","story_points":100,"kind":"games","threshold":5},
    {"code":"streak_7","name":"On Fire","description":"Read or write on StoryPass 7 days in a row.","icon":"Flame","story_points":75,"kind":"streak","threshold":7},
    {"code":"streak_30","name":"Unbroken","description":"Keep a 30-day activity streak alive.","icon":"Flame","story_points":250,"kind":"streak","threshold":30},
    {"code":"bible_scholar","name":"Bible Scholar","description":"Add or approve a Story Bible entry.","icon":"Library","story_points":40,"kind":"bible"},
    {"code":"canon_guardian","name":"Canon Guardian","description":"Approve a contribution into canon.","icon":"ShieldCheck","story_points":50,"kind":"canon"},
    {"code":"reader_10","name":"Chapter Hopper","description":"Finish 10 chapters.","icon":"BookOpenCheck","story_points":50,"kind":"reading","threshold":10},
    {"code":"reader_50","name":"Lost in the Stacks","description":"Finish 50 chapters.","icon":"BookOpenCheck","story_points":250,"kind":"reading","threshold":50},
    {"code":"creator_badge","name":"Creator","description":"Create your first series or universe.","icon":"Sparkles","story_points":100,"kind":"creator"}
  ]'::jsonb, now())
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

-- RLS: bible entries need visibility-aware reads.
-- Public entries visible to anon/authenticated; players_only visible to authenticated; spoiler_gated hidden unless user has read the spoiler chapter.
-- Keep existing owner/creator policies intact. Add owner read for draft/deprecated rows.

-- Ensure grants exist (story_bible_entries already created, but re-affirm for new policies)
GRANT SELECT ON public.story_bible_entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.story_bible_entries TO authenticated;
GRANT ALL ON public.story_bible_entries TO service_role;

-- Drop any overly broad existing bible policies and recreate narrow ones
DROP POLICY IF EXISTS "Public bible entries are readable" ON public.story_bible_entries;
DROP POLICY IF EXISTS "Series creators can manage bible" ON public.story_bible_entries;
DROP POLICY IF EXISTS "story_bible_entries_select" ON public.story_bible_entries;
DROP POLICY IF EXISTS "story_bible_entries_insert" ON public.story_bible_entries;
DROP POLICY IF EXISTS "story_bible_entries_update" ON public.story_bible_entries;
DROP POLICY IF EXISTS "story_bible_entries_delete" ON public.story_bible_entries;

CREATE POLICY "Public can read public bible entries"
ON public.story_bible_entries
FOR SELECT
TO anon
USING (visibility = 'public' AND state IN ('canon', 'spoiler'));

CREATE POLICY "Players can read non-draft bible entries"
ON public.story_bible_entries
FOR SELECT
TO authenticated
USING (state != 'draft' OR EXISTS (
  SELECT 1 FROM public.series s WHERE s.id = story_bible_entries.series_id AND s.creator_id = auth.uid()
));

CREATE POLICY "Series creators can manage their bible"
ON public.story_bible_entries
FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.series s WHERE s.id = story_bible_entries.series_id AND s.creator_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.series s WHERE s.id = story_bible_entries.series_id AND s.creator_id = auth.uid()
));

-- Updated_at trigger for story_bible_entries
CREATE TRIGGER story_bible_entries_updated
BEFORE UPDATE ON public.story_bible_entries
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Ensure profiles has owner-side read for last_active_at
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- Ensure contributions has owner-side update for canon_status
GRANT SELECT, INSERT, UPDATE ON public.contributions TO authenticated;
GRANT ALL ON public.contributions TO service_role;

-- Ensure chapters/games grants for lineage columns
GRANT SELECT ON public.chapters TO anon;
GRANT SELECT, INSERT, UPDATE ON public.chapters TO authenticated;
GRANT ALL ON public.chapters TO service_role;

GRANT SELECT ON public.games TO anon;
GRANT SELECT, INSERT, UPDATE ON public.games TO authenticated;
GRANT ALL ON public.games TO service_role;
