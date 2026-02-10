import path from 'node:path';
import { getJob, updateJob } from '../jobs/jobStore.js';
import { renderFinalAssets, splitIntoClips } from './ffmpeg.js';
import { transcribeVideo } from './whisper.js';
import { toOutputUrl } from '../utils/paths.js';

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
  updateJob(jobId, { status: 'queued', progress: Math.max(job.progress, 10), error: undefined });

  // keep processing asynchronous so the main server remains responsive
  setImmediate(() => {
    void processJob(jobId).finally(() => {
      processingJobs.delete(jobId);
    });
  });
}

async function processJob(jobId: string): Promise<void> {
  try {
    updateJob(jobId, { status: 'processing', progress: 20, error: undefined });

    const subtitleResult = await transcribeVideo(jobId);
    updateJob(jobId, { status: 'processing', progress: 50 });

    const clipPaths = await splitIntoClips(jobId);
    updateJob(jobId, { status: 'processing', progress: 80 });

    await renderFinalAssets(jobId);

    const clips = clipPaths.map((clipPath) => toOutputUrl(jobId, path.basename(clipPath)));
    const subtitlesPath = toOutputUrl(jobId, path.basename(subtitleResult.srtPath));
    const subtitlesVttPath = subtitleResult.vttPath
      ? toOutputUrl(jobId, path.basename(subtitleResult.vttPath))
      : undefined;

    updateJob(jobId, {
      status: 'completed',
      progress: 100,
      result: {
        clips,
        subtitlesPath,
        subtitlesVttPath,
      },
      error: undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Video processing failed.';
    updateJob(jobId, {
      status: 'failed',
      error: `Processing pipeline failed: ${message}`,
    });
  }
}
