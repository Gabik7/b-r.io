const required = [
  "API_PUBLIC_URL",
  "REDIS_URL",
  "ENSELORA_GEMINI_API_KEY",
  "ENSELORA_REPLICATE_API_TOKEN",
  "ENSELORA_REVENUECAT_SECRET_API_KEY",
  "ENSELORA_SUPABASE_URL",
  "ENSELORA_SUPABASE_PUBLISHABLE_KEY",
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
