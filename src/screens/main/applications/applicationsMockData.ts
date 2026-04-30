export type ApplicationStatus = 'applied' | 'contacted';

export type AppliedJob = {
  id: string;
  title: string;
  company: string;
  status: ApplicationStatus;
};

export const APPLIED_JOBS: AppliedJob[] = [
  {
    id: 'a1',
    title: 'React Native Developer',
    company: 'TechNova India',
    status: 'contacted',
  },
  {
    id: 'a2',
    title: 'Business Analyst',
    company: 'DataStride',
    status: 'applied',
  },
  {
    id: 'a3',
    title: 'Customer Support Lead',
    company: 'HelpDesk Pro',
    status: 'applied',
  },
  {
    id: 'a4',
    title: 'UI Designer',
    company: 'PixelCraft',
    status: 'contacted',
  },
  {
    id: 'a5',
    title: 'Field Sales Executive',
    company: 'RetailOne',
    status: 'applied',
  },
];
