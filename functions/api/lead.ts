import { getLenders } from '../_lib/lenders';
import { validateLead } from '../_lib/validate';
import type { DeliveryResult, Env, Lead } from '../_lib/types';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

async function verifyTurnstile(secret: string, token: string, ip: string | null): Promise<boolean> {
  const form = new FormData();
  form.set('secret', secret);
  form.set('response', token);
  if (ip) form.set('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const out = (await res.json()) as { success?: boolean };
  return out.success === true;
}

async function recordDelivery(db: D1Database, leadId: string, r: DeliveryResult) {
  await db
    .prepare('INSERT INTO deliveries (lead_id, lender, status, http_status, error, attempted_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(leadId, r.lender, r.status, r.httpStatus ?? null, r.error ?? null, new Date().toISOString())
    .run();
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  // Honeypot: bots fill the hidden field. Pretend success.
  if (body && typeof body === 'object' && (body as Record<string, unknown>).website) {
    return json({ ok: true });
  }

  const parsed = validateLead(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);
  const v = parsed.value;

  if (env.TURNSTILE_SECRET) {
    const ok = v.turnstileToken && (await verifyTurnstile(env.TURNSTILE_SECRET, v.turnstileToken, request.headers.get('CF-Connecting-IP')));
    if (!ok) return json({ error: 'Spam check failed. Please try again.' }, 400);
  }

  const now = new Date().toISOString();
  const lead: Lead = {
    id: crypto.randomUUID(),
    createdAt: now,
    name: v.name,
    email: v.email,
    phone: v.phone,
    businessName: v.businessName,
    state: v.state,
    quiz: v.quiz,
    consentVersion: v.consentVersion,
    consentText: v.consentText,
    consentAt: now,
  };

  try {
    await env.DB.prepare(
      `INSERT INTO leads (id, created_at, name, email, phone, business_name, state, quiz_json, consent_version, consent_text, consent_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(lead.id, lead.createdAt, lead.name, lead.email, lead.phone, lead.businessName, lead.state, JSON.stringify(lead.quiz), lead.consentVersion, lead.consentText, lead.consentAt)
      .run();
  } catch (err) {
    console.error('lead insert failed', err);
    return json({ error: 'We could not save your request. Please try again later.' }, 500);
  }

  // Deliver to lenders after responding; every outcome is recorded for retry.
  waitUntil(
    Promise.all(
      getLenders(env).map(async (lender) => {
        const result = await lender.submit(lead);
        await recordDelivery(env.DB, lead.id, result);
      }),
    ).catch((err) => console.error('delivery failed', err)),
  );

  return json({ ok: true });
};
