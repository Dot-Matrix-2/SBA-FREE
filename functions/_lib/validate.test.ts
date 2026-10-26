import { describe, expect, it } from 'vitest';
import { validateLead } from './validate';
import { CONSENT_VERSION } from '../../src/lib/consent';

const good = {
  name: 'Pat Smith',
  businessName: 'Smith Plumbing',
  email: 'pat@example.com',
  phone: '(555) 123-4567',
  state: 'TX',
  consent: true,
  consentVersion: CONSENT_VERSION,
  quiz: { amount: { value: '50k-150k', label: '$50,000 to $150,000' } },
};

describe('validateLead', () => {
  it('accepts a complete lead', () => {
    expect(validateLead(good).ok).toBe(true);
  });

  it.each([
    ['name', ''],
    ['email', 'not-an-email'],
    ['phone', '123'],
    ['state', 'ZZ'],
    ['consent', false],
    ['consentVersion', 'old'],
    ['quiz', {}],
  ])('rejects bad %s', (key, value) => {
    expect(validateLead({ ...good, [key]: value }).ok).toBe(false);
  });

  it('rejects non-object bodies', () => {
    expect(validateLead(null).ok).toBe(false);
    expect(validateLead('x').ok).toBe(false);
  });
});
