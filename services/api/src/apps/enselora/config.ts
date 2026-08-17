type ConfigStatus = { ready: boolean; missing: string[]; invalid: string[] };

function httpsURL(value: string | undefined): boolean {
  try { return new URL(value || "").protocol === "https:"; } catch { return false; }
}

export function runtimeConfigStatus(): ConfigStatus {
  const required = [
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
  ];
  const missing = required.filter((key) => !(process.env[key] || "").trim());
  const invalid: string[] = [];
  if (process.env.ENSELORA_SUPABASE_URL && !httpsURL(process.env.ENSELORA_SUPABASE_URL)) {
    invalid.push("ENSELORA_SUPABASE_URL");
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
