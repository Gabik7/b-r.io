import { isIP } from "node:net";

type ConfigStatus = { ready: boolean; missing: string[]; invalid: string[] };

function httpsURL(value: string | undefined): boolean {
  try { return new URL(value || "").protocol === "https:"; } catch { return false; }
}

function validHostname(value: string): boolean {
  return /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(value);
}

export function runtimeConfigStatus(): ConfigStatus {
  const required = [
    "REDIS_URL",
    "ENSELORA_GEMINI_API_KEY",
    "ENSELORA_REPLICATE_API_TOKEN",
    "ENSELORA_REPLICATE_BACKGROUND_MODEL",
    "ENSELORA_REVENUECAT_SECRET_API_KEY",
    "ENSELORA_REVENUECAT_WEBHOOK_AUTHORIZATION",
    "ENSELORA_REVENUECAT_WEBHOOK_SIGNING_SECRET",
    "ENSELORA_SUPABASE_URL",
    "ENSELORA_SUPABASE_PUBLISHABLE_KEY",
    "ENSELORA_SUPABASE_SECRET_KEY",
    "ENSELORA_ADMIN_API_KEY",
    "ENSELORA_GEMINI_INPUT_MICROS_PER_MILLION",
    "ENSELORA_GEMINI_OUTPUT_MICROS_PER_MILLION",
    "ENSELORA_GEMINI_REQUEST_RESERVE_COST_MICROS",
    "ENSELORA_REPLICATE_BACKGROUND_COST_MICROS",
    "ENSELORA_REPLICATE_TRYON_COST_MICROS",
    "ENSELORA_DAILY_COST_HARD_LIMIT_MICROS",
    "ENSELORA_AUTH_RATE_LIMIT_PER_MINUTE",
  ];
  const missing = required.filter((key) => !(process.env[key] || "").trim());
  const invalid: string[] = [];
  if (process.env.ENSELORA_SUPABASE_URL && !httpsURL(process.env.ENSELORA_SUPABASE_URL)) {
    invalid.push("ENSELORA_SUPABASE_URL");
  }
  try {
    const redisURL = new URL(process.env.REDIS_URL || "");
    if (!['redis:', 'rediss:'].includes(redisURL.protocol)) invalid.push("REDIS_URL");
  } catch {
    if (process.env.REDIS_URL) invalid.push("REDIS_URL");
  }
  const positiveIntegerKeys = [
    "ENSELORA_GEMINI_INPUT_MICROS_PER_MILLION",
    "ENSELORA_GEMINI_OUTPUT_MICROS_PER_MILLION",
    "ENSELORA_GEMINI_REQUEST_RESERVE_COST_MICROS",
    "ENSELORA_REPLICATE_BACKGROUND_COST_MICROS",
    "ENSELORA_REPLICATE_TRYON_COST_MICROS",
    "ENSELORA_DAILY_COST_HARD_LIMIT_MICROS",
    "ENSELORA_GLOBAL_AI_RATE_LIMIT_PER_MINUTE",
    "ENSELORA_IP_AI_RATE_LIMIT_PER_MINUTE",
    "ENSELORA_GEMINI_MAX_CONCURRENCY",
    "ENSELORA_REPLICATE_MAX_CONCURRENCY",
    "ENSELORA_ADMIN_RATE_LIMIT_PER_MINUTE",
    "ENSELORA_AUTH_RATE_LIMIT_PER_MINUTE",
  ];
  for (const key of positiveIntegerKeys) {
    if (!process.env[key]) continue;
    const value = Number(process.env[key]);
    if (!Number.isSafeInteger(value) || value <= 0) invalid.push(key);
  }
  if (process.env.ENSELORA_DAILY_COST_ALERT_MICROS) {
    const value = Number(process.env.ENSELORA_DAILY_COST_ALERT_MICROS);
    if (!Number.isSafeInteger(value) || value < 0) invalid.push("ENSELORA_DAILY_COST_ALERT_MICROS");
  }
  if (process.env.ENSELORA_COST_ALERT_WEBHOOK_URL && !httpsURL(process.env.ENSELORA_COST_ALERT_WEBHOOK_URL)) {
    invalid.push("ENSELORA_COST_ALERT_WEBHOOK_URL");
  }
  for (const address of (process.env.ENSELORA_ADMIN_ALLOWED_IPS || "").split(",").map((item) => item.trim()).filter(Boolean)) {
    if (isIP(address.replace(/^::ffff:/i, "")) === 0) invalid.push("ENSELORA_ADMIN_ALLOWED_IPS");
  }
  for (const hostname of (process.env.ENSELORA_ALLOWED_REMOTE_IMAGE_HOSTS || "replicate.delivery").split(",").map((item) => item.trim()).filter(Boolean)) {
    if (!validHostname(hostname) || isIP(hostname) !== 0) invalid.push("ENSELORA_ALLOWED_REMOTE_IMAGE_HOSTS");
  }
  const mode = (process.env.ENSELORA_APP_ATTEST_MODE || "off").toLowerCase();
  if (!["off", "observe", "enforce"].includes(mode)) invalid.push("ENSELORA_APP_ATTEST_MODE");
  if (mode !== "off" && !/^[A-Z0-9]{10}\.com\.gabriel\.[A-Za-z0-9.-]+$/.test(process.env.ENSELORA_APP_ATTEST_APP_ID || "")) {
    invalid.push("ENSELORA_APP_ATTEST_APP_ID");
  }
  try {
    const products = JSON.parse(process.env.ENSELORA_TRYON_CREDIT_PRODUCTS_JSON || "{}");
    if (!products || Array.isArray(products) || typeof products !== "object") invalid.push("ENSELORA_TRYON_CREDIT_PRODUCTS_JSON");
  } catch {
    invalid.push("ENSELORA_TRYON_CREDIT_PRODUCTS_JSON");
  }
  return { ready: missing.length === 0 && invalid.length === 0, missing, invalid };
}
