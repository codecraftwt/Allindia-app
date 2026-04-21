import type { HomeJob } from './homeMockData';

/** Saved jobs use the same shape as home job cards (UI mock). */
export const SAVED_JOBS_SEED: HomeJob[] = [
  {
    id: 's1',
    title: 'React Native Developer',
    company: 'TechNova India',
    location: 'Bengaluru',
    salary: '₹8 – 12 LPA',
    employmentType: 'Full-time',
    postedLabel: '2d ago',
  },
  {
    id: 's2',
    title: 'UI Designer',
    company: 'PixelCraft',
    location: 'Remote · India',
    salary: '₹6 – 9 LPA',
    employmentType: 'Full-time',
    postedLabel: 'Saved today',
  },
  {
    id: 's3',
    title: 'Data Analyst',
    company: 'Insight Labs',
    location: 'Hyderabad',
    salary: '₹5 – 8 LPA',
    employmentType: 'Full-time',
    postedLabel: '1w ago',
  },
  {
    id: 's4',
    title: 'Content Writer',
    company: 'MediaWave',
    location: 'Remote',
    salary: '₹4 – 6 LPA',
    employmentType: 'Contract',
    postedLabel: 'Saved',
  },
];
