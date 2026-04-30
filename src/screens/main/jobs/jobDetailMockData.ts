import type { HomeJob } from '../home/homeMockData';

export type JobDetailExtras = {
  description: string;
  requirements: string[];
  /** Digits / E.164 for `tel:` (no spaces). */
  employerPhoneDigits: string;
};

function buildDefault(job: HomeJob): JobDetailExtras {
  return {
    description: `${job.title} at ${job.company}: we’re looking for motivated candidates who want to grow with the team. You’ll collaborate with peers, follow process, and contribute to day-to-day operations in ${job.location}.`,
    requirements: [
      `Relevant interest or experience for ${job.title}`,
      'Clear communication and reliability',
      'Eligibility to work as per company policy',
    ],
    employerPhoneDigits: '+918000112233',
  };
}

const OVERRIDES: Record<string, JobDetailExtras> = {
  t1: {
    description:
      'Join TechNova India to build consumer-facing mobile apps used by millions. You will work with product and design in an agile squad, ship features on a two-week cadence, and help improve app performance and reliability.',
    requirements: [
      '2+ years with React Native and TypeScript',
      'Experience with REST APIs and state management (Redux or similar)',
      'Comfortable with native builds (Android / iOS) and release process',
      'Good communication in English for stand-ups and code review',
    ],
    employerPhoneDigits: '+918067445512',
  },
  n1: {
    description:
      'QuickLogistics is hiring warehouse associates for inbound, picking, and dispatch. Morning and rotating shifts available near Indiranagar.',
    requirements: [
      'Ability to lift up to 20 kg safely',
      'Basic reading and counting skills',
      'Punctual and comfortable standing for long periods',
    ],
    employerPhoneDigits: '+919876543210',
  },
  s2: {
    description:
      'PixelCraft designs products for global SaaS clients. Remote-first team across India time zones. Strong portfolio and Figma workflow expected.',
    requirements: [
      'Portfolio with web or mobile UI work',
      'Figma and design systems experience',
      'Understanding of handoff to engineering',
    ],
    employerPhoneDigits: '+918030112233',
  },
};

export function getJobDetailExtras(job: HomeJob): JobDetailExtras {
  return OVERRIDES[job.id] ?? buildDefault(job);
}
