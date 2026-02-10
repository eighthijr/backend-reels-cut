import { getJob, updateJob } from '../jobs/jobStore.js';
import { renderFinalAssets, splitIntoClips } from './ffmpeg.js';
import { transcribeVideo } from './whisper.js';

const processingJobs = new Set<string>();

export function enqueueJobProcessing(jobId: string): void {
  if (processingJobs.has(jobId)) {
    return;
  }

  const job = getJob(jobId);
  if (!job || !job.uploadPath) {
    return;
  }

  processingJobs.add(jobId);

  void processJob(jobId).finally(() => {
    processingJobs.delete(jobId);
  });
}

async function processJob(jobId: string): Promise<void> {
  try {
    updateJob(jobId, { status: 'transcribing', progress: 25, error: undefined });
    const subtitlesPath = await transcribeVideo(jobId);

    updateJob(jobId, { status: 'splitting', progress: 60 });
    const clips = await splitIntoClips(jobId);

    updateJob(jobId, { status: 'rendering', progress: 85 });
    await renderFinalAssets(jobId);

    updateJob(jobId, {
      status: 'done',
      progress: 100,
      result: {
        clips,
        subtitlesPath,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown processing error';
    updateJob(jobId, {
      status: 'error',
      error: message,
    });
  }
}
