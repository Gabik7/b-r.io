import { createHash, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";
import { verifyAssertion, verifyAttestation } from "appattest-checker-node";
import { ApiError, redisCommands } from "./api";
import { supabaseAdmin } from "./supabase-admin";

type Purpose = "attestation" | "assertion";
type ChallengeRecord = { userId: string; purpose: Purpose; challengeBase64: string };
type AttestKeyRow = { public_key_pem: string; sign_count: number; revoked_at: string | null };

function enforcement(): "off" | "observe" | "enforce" {
  const value = (process.env.ENSELORA_APP_ATTEST_MODE || "off").toLowerCase();
  return value === "enforce" || value === "observe" ? value : "off";
}

function appInfo(): { appId: string; developmentEnv: boolean } {
  const appId = process.env.ENSELORA_APP_ATTEST_APP_ID || "";
  if (!/^[A-Z0-9]{10}\.com\.gabriel\.[A-Za-z0-9.-]+$/.test(appId)) {
    throw new ApiError(503, "App Attest ešte nie je nakonfigurovaný.");
  }
  return {
    appId,
    developmentEnv: (process.env.ENSELORA_APP_ATTEST_ENVIRONMENT || "production") === "development",
  };
}

export function appAttestMode(): string { return enforcement(); }

export async function issueAppAttestChallenge(
  userId: string,
  purpose: Purpose,
): Promise<{ challengeId: string; challengeBase64: string; expiresInSeconds: number }> {
  const challengeId = crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const challengeBase64 = Buffer.from(bytes).toString("base64");
  const value: ChallengeRecord = { userId, purpose, challengeBase64 };
  const key = `enselora:app-attest:challenge:${challengeId}`;
  const result = await redisCommands([["SET", key, JSON.stringify(value), "EX", 300, "NX"]]);
  if (result[0]?.result !== "OK") throw new ApiError(503, "Bezpečnostnú výzvu sa nepodarilo vytvoriť.");
  return { challengeId, challengeBase64, expiresInSeconds: 300 };
}

async function consumeChallenge(challengeId: string, userId: string, purpose: Purpose): Promise<Buffer> {
  if (!/^[0-9a-f-]{36}$/i.test(challengeId)) throw new ApiError(401, "Bezpečnostná výzva nie je platná.");
  const key = `enselora:app-attest:challenge:${challengeId}`;
  const result = await redisCommands([["GETDEL", key]]);
  const raw = result[0]?.result;
  if (typeof raw !== "string") throw new ApiError(401, "Bezpečnostná výzva vypršala alebo už bola použitá.");
  let record: ChallengeRecord;
  try { record = JSON.parse(raw) as ChallengeRecord; } catch { throw new ApiError(401, "Bezpečnostná výzva nie je platná."); }
  if (record.userId !== userId || record.purpose !== purpose) throw new ApiError(401, "Bezpečnostná výzva nepatrí tejto požiadavke.");
  return Buffer.from(record.challengeBase64, "base64");
}

export async function registerAppAttestKey(input: {
  userId: string;
  challengeId: string;
  keyId: string;
  attestationObjectBase64: string;
}): Promise<void> {
  const challenge = await consumeChallenge(input.challengeId, input.userId, "attestation");
  if (!input.keyId || input.keyId.length > 256) throw new ApiError(400, "App Attest kľúč nie je platný.");
  const attestation = Buffer.from(input.attestationObjectBase64, "base64");
  if (!attestation.length || attestation.length > 512 * 1024) throw new ApiError(400, "App Attest objekt nie je platný.");
  const info = appInfo();
  const result = await verifyAttestation(info, input.keyId, challenge, attestation);
  if ("verifyError" in result) {
    console.warn("ENSELORA App Attest registration rejected", { userId: input.userId, reason: result.verifyError });
    throw new ApiError(401, "Túto inštaláciu aplikácie sa nepodarilo overiť.");
  }
  await supabaseAdmin("app_attest_keys?on_conflict=user_id,key_id", {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: {
      user_id: input.userId,
      key_id: input.keyId,
      public_key_pem: result.publicKeyPem,
      receipt_base64: result.receipt.toString("base64"),
      sign_count: 0,
      environment: info.developmentEnv ? "development" : "production",
      revoked_at: null,
    },
  });
}

export async function verifyRequestAppAttest(
  request: Request,
  userId: string,
  rawBody: string,
): Promise<void> {
  const mode = enforcement();
  if (mode === "off") return;
  try {
    const keyId = request.headers.get("x-enselora-app-attest-key-id") || "";
    const challengeId = request.headers.get("x-enselora-app-attest-challenge-id") || "";
    const assertionBase64 = request.headers.get("x-enselora-app-attest-assertion") || "";
    if (!keyId || !challengeId || !assertionBase64) throw new ApiError(401, "Chýba App Attest overenie.");
    const challenge = await consumeChallenge(challengeId, userId, "assertion");
    const rows = await supabaseAdmin<AttestKeyRow[]>(
      `app_attest_keys?user_id=eq.${encodeURIComponent(userId)}&key_id=eq.${encodeURIComponent(keyId)}&select=public_key_pem,sign_count,revoked_at&limit=1`,
    );
    const key = rows[0];
    if (!key || key.revoked_at) throw new ApiError(401, "App Attest kľúč nie je zaregistrovaný.");
    const requestBytes = Buffer.from(rawBody, "utf8");
    const hash = createHash("sha256").update(Buffer.concat([challenge, requestBytes])).digest();
    const assertion = Buffer.from(assertionBase64, "base64");
    const result = await verifyAssertion(hash, key.public_key_pem, appInfo().appId, assertion);
    if ("verifyError" in result || result.signCount <= key.sign_count) {
      throw new ApiError(401, "App Attest assertion nie je platný.");
    }
    const updated = await supabaseAdmin<Array<{ sign_count: number }>>(
      `app_attest_keys?user_id=eq.${encodeURIComponent(userId)}&key_id=eq.${encodeURIComponent(keyId)}&sign_count=lt.${result.signCount}`,
      {
        method: "PATCH",
        prefer: "return=representation",
        body: { sign_count: result.signCount, last_asserted_at: new Date().toISOString() },
      },
    );
    if (!updated.length) throw new ApiError(401, "App Attest assertion už bol použitý.");
  } catch (error) {
    if (mode === "observe") {
      const digest = createHash("sha256").update(userId).digest();
      const tag = digest.subarray(0, 8).toString("hex");
      console.warn("ENSELORA App Attest observation", { userTag: tag, message: error instanceof Error ? error.message : "unknown" });
      return;
    }
    throw error;
  }
}

export function constantTimeSecretMatch(actual: string, expected: string): boolean {
  const a = Buffer.from(actual);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
