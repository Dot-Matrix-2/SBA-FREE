import type { Env, LenderAdapter, Lead, DeliveryResult } from '../types';

const MAX_LENDERS = 5;

/**
 * Generic JSON webhook adapter, configured with env vars:
 *   LENDER_<n>_NAME, LENDER_<n>_URL, LENDER_<n>_KEY
 * Each lender's real CRM API will likely need its own field mapping and auth
 * scheme. When you receive a lender's API docs, add a dedicated adapter file in
 * this folder and register it in `getLenders` below instead of using this one.
 */
function webhookAdapter(name: string, url: string, key: string): LenderAdapter {
  return {
    name,
    async submit(lead: Lead): Promise<DeliveryResult> {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
          body: JSON.stringify({
            referenceId: lead.id,
            submittedAt: lead.createdAt,
            source: 'freesbainfo.com',
            contact: { name: lead.name, email: lead.email, phone: lead.phone },
            business: { name: lead.businessName, state: lead.state },
            qualification: Object.fromEntries(Object.entries(lead.quiz).map(([k, v]) => [k, v.label])),
            consent: { version: lead.consentVersion, text: lead.consentText, at: lead.consentAt },
          }),
        });
        return res.ok
          ? { lender: name, status: 'delivered', httpStatus: res.status }
          : { lender: name, status: 'failed', httpStatus: res.status, error: `HTTP ${res.status}` };
      } catch (err) {
        return { lender: name, status: 'failed', error: err instanceof Error ? err.message : String(err) };
      }
    },
  };
}

/** Used when no lenders are configured (local dev): records the lead but sends nothing. */
const stubAdapter: LenderAdapter = {
  name: 'stub',
  async submit(lead) {
    console.log(`[stub lender] would submit lead ${lead.id}`);
    return { lender: 'stub', status: 'skipped' };
  },
};

export function getLenders(env: Env): LenderAdapter[] {
  const lenders: LenderAdapter[] = [];
  for (let n = 1; n <= MAX_LENDERS; n++) {
    const url = env[`LENDER_${n}_URL`];
    const key = env[`LENDER_${n}_KEY`];
    if (typeof url === 'string' && url && typeof key === 'string' && key) {
      const name = typeof env[`LENDER_${n}_NAME`] === 'string' ? (env[`LENDER_${n}_NAME`] as string) : `lender-${n}`;
      lenders.push(webhookAdapter(name, url, key));
    }
  }
  return lenders.length ? lenders : [stubAdapter];
}
