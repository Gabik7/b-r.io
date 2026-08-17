import { bestEffortSupabaseAdmin, supabaseAdmin } from "./supabase-admin";
import { ApiError, redisCommands, redisEval } from "./api";

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

export type AICostReservation = {
  key: string;
  operation: string;
  reservedMicros: number;
};

function dailyCostKey(date = new Date()): string {
  return `enselora:cost:${date.toISOString().slice(0, 10)}:micros`;
}

function positiveCostEnv(name: string): number {
  const value = Number(process.env[name] || 0);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new ApiError(503, "Finančný limit AI služby nie je bezpečne nakonfigurovaný.");
  }
  return value;
}

export async function reserveAICost(
  estimatedCostMicros: number,
  operation: string,
): Promise<AICostReservation> {
  const reservedMicros = Math.round(estimatedCostMicros);
  if (!Number.isSafeInteger(reservedMicros) || reservedMicros <= 0) {
    throw new ApiError(503, "Odhad ceny AI požiadavky nie je bezpečne nakonfigurovaný.");
  }
  const hardLimitMicros = positiveCostEnv("ENSELORA_DAILY_COST_HARD_LIMIT_MICROS");
  const key = dailyCostKey();
  const script = `
    local next = redis.call('INCRBY', KEYS[1], ARGV[1])
    redis.call('EXPIRE', KEYS[1], ARGV[3])
    if next > tonumber(ARGV[2]) then
      redis.call('DECRBY', KEYS[1], ARGV[1])
      return -1
    end
    return next
  `;
  const total = Number(await redisEval(script, [key], [reservedMicros, hardLimitMicros, 172800]));
  if (total < 0) {
    console.error("ENSELORA daily AI cost limit reached", { operation, hardLimitMicros });
    throw new ApiError(429, "Denný limit AI služby bol dosiahnutý. Skús to znova zajtra.");
  }
  return { key, operation, reservedMicros };
}

export async function releaseAICost(reservation: AICostReservation): Promise<void> {
  const script = `
    local current = tonumber(redis.call('GET', KEYS[1]) or '0')
    local next = math.max(0, current - tonumber(ARGV[1]))
    if next == 0 then
      redis.call('DEL', KEYS[1])
    else
      redis.call('SET', KEYS[1], next, 'EX', ARGV[2])
    end
    return next
  `;
  try {
    await redisEval(script, [reservation.key], [reservation.reservedMicros, 172800]);
  } catch (error) {
    console.error("ENSELORA cost reservation release failed", {
      operation: reservation.operation,
      message: error instanceof Error ? error.message : "unknown",
    });
  }
}

async function settleAICost(reservation: AICostReservation, actualCostMicros: number): Promise<number> {
  const cost = Math.max(1, Math.round(actualCostMicros));
  const script = `
    local current = tonumber(redis.call('GET', KEYS[1]) or '0')
    local next = math.max(0, current - tonumber(ARGV[1]) + tonumber(ARGV[2]))
    redis.call('SET', KEYS[1], next, 'EX', ARGV[3])
    return next
  `;
  return Number(await redisEval(script, [reservation.key], [reservation.reservedMicros, cost, 172800]));
}

async function maybeSendCostAlert(total: number): Promise<void> {
  const day = new Date().toISOString().slice(0, 10);
  const threshold = Math.max(0, Number(process.env.ENSELORA_DAILY_COST_ALERT_MICROS || 0));
  const webhook = process.env.ENSELORA_COST_ALERT_WEBHOOK_URL || "";
  if (!(threshold > 0 && webhook && total >= threshold)) return;
  const marker = `enselora:cost-alert:${day}`;
  const claimed = await redisCommands([["SET", marker, "sent", "EX", 172800, "NX"]]);
  if (claimed[0]?.result !== "OK") return;
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app: "ENSELORA", day, estimatedCostMicros: total, thresholdMicros: threshold }),
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    // Allow the next completed request to retry the alert instead of suppressing it for the whole day.
    await redisCommands([["DEL", marker]]).catch(() => undefined);
    console.error("ENSELORA cost alert failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
  }
}

export async function recordAIUsage(usage: AIUsage, reservation?: AICostReservation): Promise<void> {
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
    const total = reservation
      ? await settleAICost(reservation, cost)
      : Number((await redisCommands([["INCRBY", dailyCostKey(), cost], ["EXPIRE", dailyCostKey(), 172800]]))[0]?.result || 0);
    await maybeSendCostAlert(total);
  } catch (error) {
    // A failed settlement intentionally leaves the conservative reservation in Redis.
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
