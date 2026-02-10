export type JobStatus =
  | 'uploading'
  | 'transcribing'
  | 'splitting'
  | 'rendering'
  | 'done'
  | 'error';

export interface JobResult {
  clips: string[];
  subtitlesPath: string;
}

export interface Job {
  id: string;
  status: JobStatus;
  uploadPath?: string;
  progress?: number;
  result?: JobResult;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

const jobStore = new Map<string, Job>();

const nowIso = () => new Date().toISOString();

export function createJob(initial?: Partial<Job>): Job {
  const id = initial?.id ?? crypto.randomUUID();
  const timestamp = nowIso();
  const job: Job = {
    id,
    status: initial?.status ?? 'uploading',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...initial,
  };

  jobStore.set(id, job);
  return job;
}

export function getJob(jobId: string): Job | undefined {
  return jobStore.get(jobId);
}

export function updateJob(jobId: string, patch: Partial<Omit<Job, 'id' | 'createdAt'>>): Job | undefined {
  const existing = jobStore.get(jobId);
  if (!existing) {
    return undefined;
  }

  const updated: Job = {
    ...existing,
    ...patch,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: nowIso(),
  };

  jobStore.set(jobId, updated);
  return updated;
}
