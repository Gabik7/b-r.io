import { bestEffortSupabaseAdmin, supabaseAdmin } from "./supabase-admin";
import { redisCommands } from "./api";

export type AIUsage = {
  userId: string;
  requestId: string;
  provider: "gemini" | "replicate";
  operation: string;
  model: string;
  inputUnits?: number;
  outputUnits?: number;
  estimatedCostMicros: number;
};

export async function recordAIUsage(usage: AIUsage): Promise<void> {
  const cost = Math.max(0, Math.round(usage.estimatedCostMicros));
  await bestEffortSupabaseAdmin("ai_usage_events?on_conflict=provider,request_id,operation", {
    method: "POST",
    prefer: "resolution=ignore-duplicates,return=minimal",
    body: {
      user_id: usage.userId,
      request_id: usage.requestId,
      provider: usage.provider,
      operation: usage.operation,
      model: usage.model,
      input_units: Math.max(0, Math.round(usage.inputUnits || 0)),
      output_units: Math.max(0, Math.round(usage.outputUnits || 0)),
      estimated_cost_micros: cost,
    },
  });
  try {
    const day = new Date().toISOString().slice(0, 10);
    const costKey = `enselora:cost:${day}:micros`;
    const result = await redisCommands([["INCRBY", costKey, cost], ["EXPIRE", costKey, 172800]]);
    const total = Number(result[0]?.result || 0);
    const threshold = Math.max(0, Number(process.env.ENSELORA_DAILY_COST_ALERT_MICROS || 0));
    const webhook = process.env.ENSELORA_COST_ALERT_WEBHOOK_URL || "";
    if (threshold > 0 && webhook && total >= threshold) {
      const marker = `enselora:cost-alert:${day}`;
      const claimed = await redisCommands([["SET", marker, "sent", "EX", 172800, "NX"]]);
      if (claimed[0]?.result === "OK") {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ app: "ENSELORA", day, estimatedCostMicros: total, thresholdMicros: threshold }),
          signal: AbortSignal.timeout(8_000),
        }).catch(() => undefined);
      }
    }
  } catch (error) {
    console.error("ENSELORA cost counter failed", { message: error instanceof Error ? error.message : "unknown" });
  }
}

export async function costSummary(days: number): Promise<{
  days: number;
  totalCostMicros: number;
  byProvider: Record<string, number>;
  byOperation: Record<string, number>;
  events: number;
}> {
  const safeDays = Math.min(90, Math.max(1, Math.round(days)));
  const since = new Date(Date.now() - safeDays * 86_400_000).toISOString();
  const rows = await supabaseAdmin<Array<{ provider: string; operation: string; estimated_cost_micros: number }>>(
    `ai_usage_events?created_at=gte.${encodeURIComponent(since)}&select=provider,operation,estimated_cost_micros&limit=50000`,
  );
  const byProvider: Record<string, number> = {};
  const byOperation: Record<string, number> = {};
  let totalCostMicros = 0;
  for (const row of rows) {
    const cost = Number(row.estimated_cost_micros || 0);
    totalCostMicros += cost;
    byProvider[row.provider] = (byProvider[row.provider] || 0) + cost;
    byOperation[row.operation] = (byOperation[row.operation] || 0) + cost;
  }
  return { days: safeDays, totalCostMicros, byProvider, byOperation, events: rows.length };
}
