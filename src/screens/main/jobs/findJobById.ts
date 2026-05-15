import type { HomeJob } from '../home/components/homeMockData';
import { ALL_LISTED_JOBS } from '../home/components/homeMockData';
import { SAVED_JOBS_SEED } from '../saved/savedJobsMockData';

export function findJobById(id: string): HomeJob | undefined {
  return ALL_LISTED_JOBS.find(j => j.id === id) ?? SAVED_JOBS_SEED.find(j => j.id === id);
}
