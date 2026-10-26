export type QuestionId =
  | 'amount'
  | 'purpose'
  | 'industry'
  | 'usBased'
  | 'forProfit'
  | 'owners'
  | 'years'
  | 'size'
  | 'credit'
  | 'federalDebt'
  | 'bankruptcy'
  | 'equity';

export interface Option {
  value: string;
  label: string;
}

export interface Question {
  id: QuestionId;
  title: string;
  help?: string;
  options: Option[];
}

export const questions: Question[] = [
  {
    id: 'amount',
    title: 'How much would you like to borrow?',
    help: 'Choose the closest range. SBA 7(a) loans go up to $5 million.',
    options: [
      { value: 'under50k', label: 'Under $50,000' },
      { value: '50k-150k', label: '$50,000 to $150,000' },
      { value: '150k-350k', label: '$150,001 to $350,000' },
      { value: '350k-1m', label: '$350,001 to $1 million' },
      { value: '1m-5m', label: '$1 million to $5 million' },
      { value: 'over5m', label: 'More than $5 million' },
    ],
  },
  {
    id: 'purpose',
    title: 'What will the loan be used for?',
    help: 'Pick the main use.',
    options: [
      { value: 'working_capital', label: 'Working capital (payroll, inventory, operating costs)' },
      { value: 'equipment', label: 'Buy equipment or machinery' },
      { value: 'real_estate', label: 'Buy, build, or renovate commercial real estate I will occupy' },
      { value: 'acquisition', label: 'Buy an existing business or buy out a partner' },
      { value: 'startup', label: 'Start a new business' },
      { value: 'refinance', label: 'Refinance existing business debt' },
      { value: 'personal', label: 'Personal expenses or owner distributions' },
      { value: 'speculative', label: 'Investment, speculation, or rental property I will not occupy' },
    ],
  },
  {
    id: 'industry',
    title: 'What industry is your business in?',
    options: [
      { value: 'food', label: 'Restaurant, food, or beverage' },
      { value: 'retail', label: 'Retail or e-commerce' },
      { value: 'professional', label: 'Professional or business services' },
      { value: 'health', label: 'Healthcare or wellness' },
      { value: 'construction', label: 'Construction or skilled trades' },
      { value: 'manufacturing', label: 'Manufacturing or wholesale' },
      { value: 'transport', label: 'Transportation or logistics' },
      { value: 'hospitality', label: 'Hospitality, lodging, or entertainment' },
      { value: 'agriculture', label: 'Agriculture' },
      { value: 'technology', label: 'Technology or software' },
      { value: 'personal_services', label: 'Personal services (salon, fitness, childcare, etc.)' },
      { value: 'other_eligible', label: 'Other operating business' },
      { value: 'lending', label: 'Lending, financial services, or investing' },
      { value: 'passive_re', label: 'Passive real estate (owning property to rent to others)' },
      { value: 'gambling', label: 'Gambling' },
      { value: 'cannabis', label: 'Cannabis or marijuana-related' },
      { value: 'adult', label: 'Adult entertainment' },
      { value: 'nonprofit', label: 'Nonprofit, religious, or government organization' },
    ],
  },
  {
    id: 'usBased',
    title: 'Is your business physically located and operating in the United States?',
    options: [
      { value: 'yes', label: 'Yes, in the U.S. or a U.S. territory' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'forProfit',
    title: 'Is your business operated for profit?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No (nonprofit or similar)' },
    ],
  },
  {
    id: 'owners',
    title: 'Is everyone who owns the business a U.S. citizen, U.S. national, or lawful permanent resident?',
    help: 'Current SBA rules generally require this for all owners.',
    options: [
      { value: 'yes', label: 'Yes, all owners' },
      { value: 'no', label: 'No, at least one owner is not' },
      { value: 'unsure', label: 'I am not sure' },
    ],
  },
  {
    id: 'years',
    title: 'How long has your business been operating?',
    options: [
      { value: 'planning', label: 'Not started yet' },
      { value: 'under2', label: 'Less than 2 years' },
      { value: '2to5', label: '2 to 5 years' },
      { value: 'over5', label: 'More than 5 years' },
    ],
  },
  {
    id: 'size',
    title: 'About how many people does your business employ (including part-time)?',
    help: 'SBA size limits vary by industry; most small businesses are well within them.',
    options: [
      { value: 'under100', label: 'Fewer than 100' },
      { value: '100to500', label: '100 to 500' },
      { value: 'over500', label: 'More than 500' },
    ],
  },
  {
    id: 'credit',
    title: 'What is the approximate personal credit score of the main owner?',
    options: [
      { value: '720plus', label: '720 or higher' },
      { value: '680to719', label: '680 to 719' },
      { value: '640to679', label: '640 to 679' },
      { value: 'under640', label: 'Below 640' },
      { value: 'unknown', label: 'I do not know' },
    ],
  },
  {
    id: 'federalDebt',
    title: 'Does any owner or the business have a delinquent or defaulted federal debt (such as unpaid federal taxes or a defaulted SBA or student loan)?',
    options: [
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Yes' },
    ],
  },
  {
    id: 'bankruptcy',
    title: 'Has any owner or the business filed for bankruptcy?',
    options: [
      { value: 'no', label: 'No' },
      { value: 'over7', label: 'Yes, more than 7 years ago' },
      { value: 'recent', label: 'Yes, within the last 7 years' },
    ],
  },
  {
    id: 'equity',
    title: 'Could the owner(s) invest at least 10% of the project cost in cash?',
    help: 'Required mainly for startups and business purchases, but lenders like to see owner investment in any loan.',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
];

export const labelFor = (questionId: QuestionId, value: string): string => {
  const q = questions.find((x) => x.id === questionId);
  return q?.options.find((o) => o.value === value)?.label ?? value;
};
