import type { HomeJob } from '../home/homeMockData';
import { ALL_LISTED_JOBS } from '../home/homeMockData';
import { SAVED_JOBS_SEED } from '../saved/savedJobsMockData';

export function findJobById(id: string): HomeJob | undefined {
  return ALL_LISTED_JOBS.find(j => j.id === id) ?? SAVED_JOBS_SEED.find(j => j.id === id);
}
