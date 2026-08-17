import { isIP } from "node:net";

const required = [
  "API_PUBLIC_URL",
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

const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  console.error(`Missing production environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const invalidPlaceholder = /(xxxxxxxx|replace[_-]?(me|with)|presný názov|úplná adresa|example\.com)/i;
const placeholders = required.filter((key) => invalidPlaceholder.test(process.env[key] || ""));
if (placeholders.length) {
  console.error(`Replace placeholder values before production build: ${placeholders.join(", ")}`);
  process.exit(1);
}

for (const key of ["API_PUBLIC_URL", "ENSELORA_SUPABASE_URL"]) {
  try {
    const url = new URL(process.env[key]);
    if (url.protocol !== "https:") throw new Error("HTTPS is required");
  } catch {
    console.error(`${key} must be a valid HTTPS URL.`);
    process.exit(1);
  }
}

try {
  const redisURL = new URL(process.env.REDIS_URL);
  if (!["redis:", "rediss:"].includes(redisURL.protocol)) throw new Error("Redis URL is required");
} catch {
  console.error("REDIS_URL must be a valid redis:// or rediss:// URL.");
  process.exit(1);
}

if (!process.env.ENSELORA_REVENUECAT_SECRET_API_KEY.startsWith("sk_")) {
  console.error("ENSELORA_REVENUECAT_SECRET_API_KEY must be the server-side RevenueCat secret key (sk_...).");
  process.exit(1);
}

if (!process.env.ENSELORA_REPLICATE_API_TOKEN.startsWith("r8_")) {
  console.error("ENSELORA_REPLICATE_API_TOKEN must be a Replicate API token (r8_...).");
  process.exit(1);
}

for (const key of [
  "ENSELORA_GEMINI_INPUT_MICROS_PER_MILLION",
  "ENSELORA_GEMINI_OUTPUT_MICROS_PER_MILLION",
  "ENSELORA_GEMINI_REQUEST_RESERVE_COST_MICROS",
  "ENSELORA_REPLICATE_BACKGROUND_COST_MICROS",
  "ENSELORA_REPLICATE_TRYON_COST_MICROS",
  "ENSELORA_DAILY_COST_HARD_LIMIT_MICROS",
]) {
  const value = Number(process.env[key]);
  if (!Number.isSafeInteger(value) || value <= 0) {
    console.error(`${key} must be a positive integer expressed in millionths of USD.`);
    process.exit(1);
  }
}

for (const key of [
  "ENSELORA_GLOBAL_AI_RATE_LIMIT_PER_MINUTE",
  "ENSELORA_IP_AI_RATE_LIMIT_PER_MINUTE",
  "ENSELORA_GEMINI_MAX_CONCURRENCY",
  "ENSELORA_REPLICATE_MAX_CONCURRENCY",
  "ENSELORA_ADMIN_RATE_LIMIT_PER_MINUTE",
  "ENSELORA_AUTH_RATE_LIMIT_PER_MINUTE",
]) {
  if (!process.env[key]) continue;
  const value = Number(process.env[key]);
  if (!Number.isSafeInteger(value) || value <= 0) {
    console.error(`${key} must be a positive integer.`);
    process.exit(1);
  }
}

for (const address of (process.env.ENSELORA_ADMIN_ALLOWED_IPS || "").split(",").map((item) => item.trim()).filter(Boolean)) {
  if (isIP(address.replace(/^::ffff:/i, "")) === 0) {
    console.error("ENSELORA_ADMIN_ALLOWED_IPS must contain only exact IPv4/IPv6 addresses.");
    process.exit(1);
  }
}

for (const hostname of (process.env.ENSELORA_ALLOWED_REMOTE_IMAGE_HOSTS || "replicate.delivery").split(",").map((item) => item.trim()).filter(Boolean)) {
  if (isIP(hostname) !== 0 || !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(hostname)) {
    console.error("ENSELORA_ALLOWED_REMOTE_IMAGE_HOSTS must contain only DNS hostnames.");
    process.exit(1);
  }
}
