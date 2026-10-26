export interface Topic {
  title: string;
  summary: string;
  href: string;
}

export const topics: Topic[] = [
  {
    title: 'What is an SBA 7(a) loan?',
    summary: 'The SBA’s most common loan program: how it works and who it is for.',
    href: '/learn/what-is-a-7a-loan/',
  },
  {
    title: 'Who is eligible?',
    summary: 'The basic requirements a business and its owners must meet.',
    href: '/learn/eligibility/',
  },
  {
    title: 'How can I use the money?',
    summary: 'Approved uses of proceeds, and uses that are not allowed.',
    href: '/learn/uses-of-proceeds/',
  },
  {
    title: 'Rates, fees, and terms',
    summary: 'Maximum interest rates, guarantee fees, and repayment terms.',
    href: '/learn/rates-fees-and-terms/',
  },
  {
    title: 'Collateral and guarantees',
    summary: 'What lenders may require to secure a 7(a) loan.',
    href: '/learn/collateral-and-guarantees/',
  },
  {
    title: 'How to apply',
    summary: 'A step-by-step overview and document checklist.',
    href: '/learn/how-to-apply/',
  },
  {
    title: 'Other SBA loan programs',
    summary: 'Alternatives such as 504, Microloans, and Express loans.',
    href: '/learn/other-sba-programs/',
  },
  {
    title: 'Frequently asked questions',
    summary: 'Quick answers to common questions.',
    href: '/learn/faq/',
  },
  {
    title: 'Glossary',
    summary: 'Plain-English definitions of common lending terms.',
    href: '/learn/glossary/',
  },
];
