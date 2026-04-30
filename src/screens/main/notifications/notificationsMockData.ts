export type NotificationKind = 'job_alert' | 'employer_activity';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  timeLabel: string;
};

export const JOB_ALERT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'ja1',
    kind: 'job_alert',
    title: 'New roles match “React Native”',
    body: 'TechNova India and 2 more companies posted jobs in Bengaluru.',
    timeLabel: '2h ago',
  },
  {
    id: 'ja2',
    kind: 'job_alert',
    title: 'Salary band you follow',
    body: '5 new openings in the ₹8–12 LPA range this week.',
    timeLabel: 'Yesterday',
  },
  {
    id: 'ja3',
    kind: 'job_alert',
    title: 'Remote jobs',
    body: 'PixelCraft is hiring a UI Designer — remote within India.',
    timeLabel: '3d ago',
  },
];

export const EMPLOYER_ACTIVITY_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'ea1',
    kind: 'employer_activity',
    title: 'TechNova India',
    body: 'Viewed your profile after you applied for React Native Developer.',
    timeLabel: '1h ago',
  },
  {
    id: 'ea2',
    kind: 'employer_activity',
    title: 'HelpDesk Pro',
    body: 'Marked your application as shortlisted for Customer Support Lead.',
    timeLabel: 'Yesterday',
  },
  {
    id: 'ea3',
    kind: 'employer_activity',
    title: 'DataStride',
    body: 'Sent a message — check your email for next steps.',
    timeLabel: '4d ago',
  },
];
