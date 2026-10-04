import { NextResponse } from "next/server";
import { APPLICATIONS_TABLE, getSupabaseAdmin } from "@/lib/supabase/server";
import { fieldsForTeam, submissionSchema, toRow, validateFields, type AppValues } from "@/lib/validation/application";
import { clientIp, createLimiter } from "@/lib/utils/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 60_000;
const MIN_FILL_MS = 4_000; // a person cannot complete the form faster than this

// generous per-IP ceiling: a whole campus Wi-Fi can share one address during recruitment
const perIp = createLimiter({ limit: 40, windowMs: 10 * 60_000 });
const perEmail = createLimiter({ limit: 3, windowMs: 10 * 60_000 });

type Fail = { ok: false; code: string; message: string; fieldErrors?: Record<string, string> };
const fail = (status: number, body: Omit<Fail, "ok">, headers?: HeadersInit) =>
  NextResponse.json({ ok: false, ...body } satisfies Fail, { status, headers });

/** Optional Cloudflare Turnstile check. Only enforced when TURNSTILE_SECRET_KEY is configured. */
async function turnstileOk(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const ip = clientIp(req.headers);

  const ipLimit = perIp.check(ip);
  if (!ipLimit.ok) {
    return fail(
      429,
      { code: "rate_limited", message: "Too many attempts. Wait a few minutes and try again." },
      { "Retry-After": String(ipLimit.retryAfter) },
    );
  }

  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_BODY_BYTES) return fail(413, { code: "too_large", message: "That submission is too large." });

  let json: unknown;
  try {
    json = JSON.parse(await req.text());
  } catch {
    return fail(400, { code: "bad_json", message: "We couldn't read that submission." });
  }

  const parsed = submissionSchema.safeParse(json);
  if (!parsed.success) return fail(400, { code: "bad_shape", message: "That submission looks incomplete." });
  const { team, fields, meta } = parsed.data;

  // Spam: bots fill the hidden field. Pretend it worked, store nothing.
  if (meta.website && meta.website.trim() !== "") return NextResponse.json({ ok: true });
  if (meta.startedAt && Date.now() - meta.startedAt < MIN_FILL_MS) {
    return fail(400, { code: "too_fast", message: "That was quick. Take a moment, then submit again." });
  }

  if (!(await turnstileOk(meta.turnstileToken, ip))) {
    return fail(400, { code: "challenge_failed", message: "We couldn't verify you're human. Please try again." });
  }

  // Server-side validation: the browser's checks are a convenience, these are the real ones.
  const values = fields as AppValues;
  const errors = validateFields(team, values, fieldsForTeam(team));
  if (Object.keys(errors).length) {
    return fail(400, { code: "invalid", message: "Some answers need fixing.", fieldErrors: errors as Record<string, string> });
  }

  const emailLimit = perEmail.check(values.email.trim().toLowerCase());
  if (!emailLimit.ok) {
    return fail(
      429,
      { code: "rate_limited", message: "Too many attempts with this email. Try again in a few minutes." },
      { "Retry-After": String(emailLimit.retryAfter) },
    );
  }

  const row = toRow(team, values, meta.nonce);

  if (process.env.AURA_DRY_RUN === "true" && process.env.NODE_ENV !== "production") {
    return NextResponse.json({ ok: true, dryRun: true });
  }

  const db = getSupabaseAdmin();
  if (!db) {
    return fail(503, {
      code: "not_configured",
      message: "Applications can't be received right now. Your answers are saved in this browser — try again soon.",
    });
  }

  const { error } = await db.from(APPLICATIONS_TABLE).insert(row);
  if (error) {
    // 23505 = unique violation: the same person/team (or the same click) was already stored.
    // Report success so repeat submissions are harmless and nobody can probe who has applied.
    if (error.code === "23505") return NextResponse.json({ ok: true, duplicate: true });
    console.error("[apply] insert failed", error.code, error.message);
    return fail(500, { code: "storage_failed", message: "We couldn't save your application. Please try again." });
  }

  return NextResponse.json({ ok: true });
}

export function GET() {
  return new NextResponse(null, { status: 405, headers: { Allow: "POST" } });
}
