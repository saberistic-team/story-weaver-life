CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  status text NOT NULL DEFAULT 'incomplete',
  tier text NOT NULL DEFAULT 'free',
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE public.creator_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (creator_id, period)
);

GRANT SELECT, INSERT, UPDATE ON public.creator_earnings TO authenticated;
GRANT ALL ON public.creator_earnings TO service_role;

ALTER TABLE public.creator_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view their own earnings"
  ON public.creator_earnings
  FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "Service role can manage creator earnings"
  ON public.creator_earnings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS subscription_tier text NOT NULL DEFAULT 'free';

ALTER TABLE public.series
  ADD COLUMN IF NOT EXISTS required_tier text NOT NULL DEFAULT 'free';

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;

CREATE TRIGGER subscriptions_updated
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER creator_earnings_updated
  BEFORE UPDATE ON public.creator_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
