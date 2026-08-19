DROP TABLE IF EXISTS public.subscriptions;

CREATE TABLE public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  paddle_subscription_id text not null unique,
  paddle_customer_id text not null,
  product_id text not null,
  price_id text not null,
  status text not null default 'active',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  environment text not null default 'sandbox',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_paddle_id ON public.subscriptions(paddle_subscription_id);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.creator_earnings
  ADD COLUMN IF NOT EXISTS paddle_transaction_id text,
  ADD COLUMN IF NOT EXISTS paddle_subscription_id text,
  ADD COLUMN IF NOT EXISTS environment text not null default 'sandbox';

CREATE OR REPLACE FUNCTION public.has_active_subscription(
  user_uuid uuid,
  check_env text default 'live'
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
      AND environment = check_env
      AND (
        (status IN ('active', 'trialing') AND (current_period_end IS NULL OR current_period_end > now()))
        OR (status = 'canceled' AND current_period_end > now())
      )
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO service_role;