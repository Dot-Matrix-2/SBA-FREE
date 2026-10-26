export interface Env {
  DB: D1Database;
  TURNSTILE_SECRET?: string;
  // Lender integrations: LENDER_<n>_NAME / _URL / _KEY for n = 1..5
  [key: string]: unknown;
}

export interface Lead {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  state: string;
  quiz: Record<string, { value: string; label: string }>;
  consentVersion: string;
  consentText: string;
  consentAt: string;
}

export interface DeliveryResult {
  lender: string;
  status: 'delivered' | 'failed' | 'skipped';
  httpStatus?: number;
  error?: string;
}

export interface LenderAdapter {
  /** Stable name stored with each delivery record. */
  name: string;
  submit(lead: Lead): Promise<DeliveryResult>;
}
