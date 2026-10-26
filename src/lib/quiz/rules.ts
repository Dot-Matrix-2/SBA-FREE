import type { QuestionId } from './questions';

export type Answers = Partial<Record<QuestionId, string>>;
export type Status = 'eligible' | 'review' | 'ineligible';

export interface Alternative {
  name: string;
  description: string;
  href: string;
}

export interface Result {
  status: Status;
  /** Reasons the business appears not to qualify. */
  blockers: string[];
  /** Items a lender will scrutinize; may still qualify. */
  cautions: string[];
  alternatives: Alternative[];
}

const ALT = {
  sba504: {
    name: 'SBA 504 loan',
    description: 'Long-term, fixed-rate financing for real estate and major equipment, including larger amounts.',
    href: 'https://www.sba.gov/funding-programs/loans/504-loans',
  },
  micro: {
    name: 'SBA Microloan',
    description: 'Loans up to $50,000 through nonprofit lenders, often with free training. A good fit for startups and thinner credit.',
    href: 'https://www.sba.gov/funding-programs/loans/microloans',
  },
  counseling: {
    name: 'Free counseling (SBDC and SCORE)',
    description: 'Free or low-cost advisors who can help you strengthen your application or find the right program.',
    href: 'https://www.sba.gov/local-assistance',
  },
  programs: {
    name: 'Other SBA loan programs',
    description: 'Explore every SBA loan program, including Express and disaster loans.',
    href: 'https://www.sba.gov/funding-programs/loans',
  },
} satisfies Record<string, Alternative>;

const INELIGIBLE_INDUSTRY: Record<string, string> = {
  lending: 'Businesses primarily engaged in lending or investing are not eligible for SBA 7(a) loans.',
  passive_re: 'Passive real estate investment (owning property to rent to others) is not eligible.',
  gambling: 'Gambling businesses are not eligible.',
  cannabis: 'Cannabis and marijuana-related businesses are not eligible because the activity remains illegal under federal law.',
  adult: 'Businesses of a prurient sexual nature are not eligible.',
  nonprofit: 'Nonprofit, religious, and government-owned organizations are not eligible for 7(a) loans.',
};

export function evaluate(a: Answers): Result {
  const blockers: string[] = [];
  const cautions: string[] = [];
  const alts = new Set<keyof typeof ALT>();

  if (a.amount === 'over5m') {
    blockers.push('The maximum SBA 7(a) loan amount is $5 million.');
    alts.add('sba504');
  }

  if (a.purpose === 'personal') {
    blockers.push('7(a) funds cannot be used for personal expenses or owner distributions.');
  } else if (a.purpose === 'speculative') {
    blockers.push('7(a) funds cannot be used for speculation or passive real estate investment.');
  }

  if (a.industry && INELIGIBLE_INDUSTRY[a.industry]) {
    blockers.push(INELIGIBLE_INDUSTRY[a.industry]);
  }

  if (a.usBased === 'no') {
    blockers.push('The business must operate in the United States or its territories.');
  }
  if (a.forProfit === 'no') {
    blockers.push('The business must be operated for profit.');
  }
  if (a.owners === 'no') {
    blockers.push('Current SBA rules generally require all owners to be U.S. citizens, nationals, or lawful permanent residents.');
  }
  if (a.federalDebt === 'yes') {
    blockers.push('Delinquent or defaulted federal debt must typically be resolved before applying.');
  }

  if (blockers.length > 0) {
    alts.add('counseling');
    alts.add('programs');
    return { status: 'ineligible', blockers, cautions, alternatives: [...alts].map((k) => ALT[k]) };
  }

  if (a.owners === 'unsure') {
    cautions.push('Confirm the citizenship or residency status of every owner; the SBA generally requires all owners to be U.S. citizens, nationals, or lawful permanent residents.');
  }
  if (a.size === 'over500') {
    cautions.push('With more than 500 employees, your business may exceed the SBA size standard for your industry. Size limits vary by industry.');
  }
  if (a.credit === 'under640') {
    cautions.push('Many lenders look for personal credit scores in the high 600s or higher. A lower score makes approval harder.');
    alts.add('micro');
  } else if (a.credit === '640to679') {
    cautions.push('Your credit score is on the lower end of what many SBA lenders prefer; strong cash flow can help.');
  } else if (a.credit === 'unknown') {
    cautions.push('Check your credit score before applying; it is one of the first things a lender reviews.');
  }
  if (a.bankruptcy === 'recent') {
    cautions.push('A bankruptcy within the last 7 years can make approval difficult. Lenders will want a clear explanation and recovery history.');
  }

  const needsEquity = a.purpose === 'startup' || a.purpose === 'acquisition' || a.years === 'planning';
  if (needsEquity && a.equity === 'no') {
    cautions.push('Startups and business purchases usually require an owner cash investment of at least 10% of the project cost.');
  }
  if (a.years === 'planning' || a.years === 'under2') {
    cautions.push('Newer businesses face more scrutiny. Lenders look for strong personal credit, relevant experience, and a solid plan.');
    alts.add('micro');
  }
  if (a.purpose === 'refinance') {
    cautions.push('Refinancing must provide a clear benefit to the business, such as a better rate or terms.');
  }
  if (a.amount === 'under50k') {
    cautions.push('Some lenders do not offer very small 7(a) loans. A Microloan may be an easier path.');
    alts.add('micro');
  }

  // Cautions that are real obstacles push us to "review"; softer ones do not.
  const hardCaution =
    a.owners === 'unsure' ||
    a.size === 'over500' ||
    a.credit === 'under640' ||
    a.bankruptcy === 'recent' ||
    (needsEquity && a.equity === 'no');

  if (hardCaution) {
    alts.add('counseling');
    return { status: 'review', blockers, cautions, alternatives: [...alts].map((k) => ALT[k]) };
  }
  return { status: 'eligible', blockers, cautions, alternatives: [...alts].map((k) => ALT[k]) };
}
