export type HomeJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  employmentType: string;
  postedLabel: string;
};

export type HomeCategory = {
  id: string;
  label: string;
  icon: string;
};

export const HOME_CATEGORIES: HomeCategory[] = [
  { id: 'it', label: 'IT', icon: 'laptop' },
  { id: 'sales', label: 'Sales', icon: 'line-chart' },
  { id: 'hr', label: 'HR', icon: 'users' },
  { id: 'finance', label: 'Finance', icon: 'money' },
  { id: 'ops', label: 'Operations', icon: 'cogs' },
  { id: 'health', label: 'Healthcare', icon: 'heartbeat' },
  { id: 'edu', label: 'Education', icon: 'book' },
  { id: 'more', label: 'More', icon: 'th-large' },
];

export const TRENDING_JOBS: HomeJob[] = [
  {
    id: 't1',
    title: 'React Native Developer',
    company: 'TechNova India',
    location: 'Bengaluru',
    salary: '₹8 – 12 LPA',
    employmentType: 'Full-time',
    postedLabel: '2d ago',
  },
  {
    id: 't2',
    title: 'Field Sales Executive',
    company: 'RetailOne',
    location: 'Hyderabad',
    salary: '₹3.5 – 5 LPA',
    employmentType: 'Full-time',
    postedLabel: 'Today',
  },
  {
    id: 't3',
    title: 'Accounts Executive',
    company: 'FinEdge',
    location: 'Mumbai',
    salary: '₹4 – 6 LPA',
    employmentType: 'Full-time',
    postedLabel: '1d ago',
  },
  {
    id: 't4',
    title: 'Customer Support Lead',
    company: 'HelpDesk Pro',
    location: 'Pune',
    salary: '₹5 – 7 LPA',
    employmentType: 'Full-time',
    postedLabel: '3d ago',
  },
];

export const NEARBY_JOBS: HomeJob[] = [
  {
    id: 'n1',
    title: 'Warehouse Associate',
    company: 'QuickLogistics',
    location: 'Indiranagar · 2 km',
    salary: '₹18k – 22k / mo',
    employmentType: 'Full-time',
    postedLabel: '5h ago',
  },
  {
    id: 'n2',
    title: 'Delivery Partner',
    company: 'CityFleet',
    location: 'HSR Layout · 4 km',
    salary: '₹25k – 35k / mo',
    employmentType: 'Contract',
    postedLabel: '1d ago',
  },
  {
    id: 'n3',
    title: 'Retail Store Manager',
    company: 'UrbanMart',
    location: 'Koramangala · 1 km',
    salary: '₹35k – 45k / mo',
    employmentType: 'Full-time',
    postedLabel: '2d ago',
  },
];

export const RECOMMENDED_JOBS: HomeJob[] = [
  {
    id: 'r1',
    title: 'UI Designer',
    company: 'PixelCraft',
    location: 'Remote · India',
    salary: '₹6 – 9 LPA',
    employmentType: 'Full-time',
    postedLabel: 'Matches your profile',
  },
  {
    id: 'r2',
    title: 'Business Analyst',
    company: 'DataStride',
    location: 'Bengaluru',
    salary: '₹9 – 14 LPA',
    employmentType: 'Full-time',
    postedLabel: 'Matches your profile',
  },
  {
    id: 'r3',
    title: 'Content Writer',
    company: 'MediaWave',
    location: 'Remote',
    salary: '₹4 – 6 LPA',
    employmentType: 'Contract',
    postedLabel: 'New for you',
  },
];

/** All jobs shown on Home lists (trending, nearby, recommended). */
export const ALL_LISTED_JOBS: HomeJob[] = [
  ...TRENDING_JOBS,
  ...NEARBY_JOBS,
  ...RECOMMENDED_JOBS,
];
