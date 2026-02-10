export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface JobResult {
  clips: string[];
  subtitlesPath: string;
  subtitlesVttPath?: string;
}

export interface Job {
  id: string;
  status: JobStatus;
  uploadPath?: string;
  progress: number;
  result?: JobResult;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

const jobStore = new Map<string, Job>();

const nowIso = () => new Date().toISOString();

function clampProgress(value: number): number {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

export function createJob(initial?: Partial<Job>): Job {
  const id = initial?.id ?? crypto.randomUUID();
  const timestamp = nowIso();
  const job: Job = {
    id,
    status: initial?.status ?? 'queued',
    progress: clampProgress(initial?.progress ?? 0),
    createdAt: timestamp,
    updatedAt: timestamp,
    ...initial,
  };

  job.progress = clampProgress(job.progress);

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

  const nextProgress = patch.progress === undefined ? existing.progress : clampProgress(patch.progress);

  const updated: Job = {
    ...existing,
    ...patch,
    progress: nextProgress,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: nowIso(),
  };

  jobStore.set(jobId, updated);
  return updated;
}
