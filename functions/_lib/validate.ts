import { CONSENT_TEXT, CONSENT_VERSION, US_STATES } from '../../src/lib/consent';

export interface ValidLead {
  name: string;
  email: string;
  phone: string;
  businessName: string;
  state: string;
  quiz: Record<string, { value: string; label: string }>;
  consentVersion: string;
  consentText: string;
  turnstileToken: string;
}

export type Validation = { ok: true; value: ValidLead } | { ok: false; error: string };

const str = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function validateLead(body: unknown): Validation {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid request.' };
  const b = body as Record<string, unknown>;

  const name = str(b.name, 100);
  const businessName = str(b.businessName, 150);
  const email = str(b.email, 150);
  const phone = str(b.phone, 30);
  const state = str(b.state, 2);

  if (name.length < 2) return { ok: false, error: 'Please enter your name.' };
  if (businessName.length < 2) return { ok: false, error: 'Please enter your business name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Please enter a valid email address.' };
  if (phone.replace(/\D/g, '').length < 10) return { ok: false, error: 'Please enter a valid phone number.' };
  if (!(state in US_STATES)) return { ok: false, error: 'Please choose a state.' };
  if (b.consent !== true) return { ok: false, error: 'Your consent is required to share your information.' };
  if (b.consentVersion !== CONSENT_VERSION) {
    return { ok: false, error: 'This page is out of date. Please refresh and try again.' };
  }

  const quiz: ValidLead['quiz'] = {};
  if (b.quiz && typeof b.quiz === 'object') {
    for (const [k, v] of Object.entries(b.quiz as Record<string, unknown>).slice(0, 30)) {
      const item = v as { value?: unknown; label?: unknown };
      quiz[str(k, 40)] = { value: str(item?.value, 60), label: str(item?.label, 200) };
    }
  }
  if (Object.keys(quiz).length === 0) return { ok: false, error: 'Please complete the quiz first.' };

  return {
    ok: true,
    value: {
      name,
      email,
      phone,
      businessName,
      state,
      quiz,
      consentVersion: CONSENT_VERSION,
      consentText: CONSENT_TEXT,
      turnstileToken: str(b.turnstileToken, 2048),
    },
  };
}
