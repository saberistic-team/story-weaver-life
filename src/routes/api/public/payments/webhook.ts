import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { verifyWebhook, EventName, type PaddleEnv } from "@/lib/paddle.server";

type SupabaseClient = ReturnType<typeof createClient<Database>>;

type WebhookData = Record<string, unknown>;

let _supabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env["SUPABASE_URL"]!,
      process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
    );
  }
  return _supabase;
}

function asRecord(value: unknown): WebhookData {
  return (value as WebhookData) ?? {};
}

async function handleSubscriptionCreated(data: WebhookData, env: PaddleEnv) {
  const customData = asRecord(data["customData"]);
  const userId = customData["userId"] as string | undefined;
  if (!userId) {
    console.error("No userId in customData");
    return;
  }

  const items = (data["items"] as unknown[]) ?? [];
  const firstItem = asRecord(items[0]);
  const price = asRecord(firstItem["price"]);
  const product = asRecord(firstItem["product"]);
  const priceMeta = asRecord(price["importMeta"]);
  const productMeta = asRecord(product["importMeta"]);
  const priceId = priceMeta["externalId"] as string | undefined;
  const productId = productMeta["externalId"] as string | undefined;
  if (!priceId || !productId) {
    console.warn("Skipping subscription: missing importMeta.externalId", {
      rawPriceId: price["id"],
      rawProductId: product["id"],
    });
    return;
  }

  const currentBillingPeriod = asRecord(data["currentBillingPeriod"]);

  await getSupabase()
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        paddle_subscription_id: data["id"] as string,
        paddle_customer_id: data["customerId"] as string,
        product_id: productId,
        price_id: priceId,
        status: data["status"] as string,
        current_period_start: (currentBillingPeriod["startsAt"] as string | undefined) ?? null,
        current_period_end: (currentBillingPeriod["endsAt"] as string | undefined) ?? null,
        environment: env,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "paddle_subscription_id" },
    );
}

async function handleSubscriptionUpdated(data: WebhookData, env: PaddleEnv) {
  const currentBillingPeriod = asRecord(data["currentBillingPeriod"]);
  const scheduledChange = asRecord(data["scheduledChange"]);

  await getSupabase()
    .from("subscriptions")
    .update({
      status: data["status"] as string,
      current_period_start: (currentBillingPeriod["startsAt"] as string | undefined) ?? null,
      current_period_end: (currentBillingPeriod["endsAt"] as string | undefined) ?? null,
      cancel_at_period_end: scheduledChange["action"] === "cancel",
      updated_at: new Date().toISOString(),
    })
    .eq("paddle_subscription_id", data["id"] as string)
    .eq("environment", env);
}

async function handleSubscriptionCanceled(data: WebhookData, env: PaddleEnv) {
  await getSupabase()
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("paddle_subscription_id", data["id"] as string)
    .eq("environment", env);
}

async function handleTransactionCompleted(data: WebhookData, env: PaddleEnv) {
  const customData = asRecord(data["customData"]);
  const creatorId = customData["creatorId"] as string | undefined;
  if (!creatorId) return;

  const items = (data["items"] as unknown[]) ?? [];
  const firstItem = asRecord(items[0]);
  const price = asRecord(firstItem["price"]);
  const priceMeta = asRecord(price["importMeta"]);
  const priceId = priceMeta["externalId"] as string | undefined;
  const productId = price["productId"] as string | undefined;
  const totals = asRecord(firstItem["totals"]);
  const amountCents = Math.round(Number(totals["total"] || 0));

  await getSupabase()
    .from("creator_earnings")
    .insert({
      creator_id: creatorId,
      period: new Date().toISOString().slice(0, 7),
      amount_cents: amountCents,
      status: "pending",
      paddle_transaction_id: data["id"] as string,
      paddle_subscription_id: (data["subscriptionId"] as string) || null,
      environment: env,
    });
}

async function handleWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);

  switch (event.eventType) {
    case EventName.SubscriptionCreated:
      await handleSubscriptionCreated(event.data as unknown as WebhookData, env);
      break;
    case EventName.SubscriptionUpdated:
      await handleSubscriptionUpdated(event.data as unknown as WebhookData, env);
      break;
    case EventName.SubscriptionCanceled:
      await handleSubscriptionCanceled(event.data as unknown as WebhookData, env);
      break;
    case EventName.TransactionCompleted:
      await handleTransactionCompleted(event.data as unknown as WebhookData, env);
      break;
    default:
      console.log("Unhandled event:", event.eventType);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const env = (url.searchParams.get("env") || "sandbox") as PaddleEnv;
        try {
          await handleWebhook(request, env);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
