import type { FastifyInstance } from 'fastify';
import { getJob, updateJob } from '../jobs/jobStore.js';
import { enqueueJobProcessing } from '../worker/index.js';

interface ProcessBody {
  jobId: string;
}

export async function processRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: ProcessBody }>('/process', async (request, reply) => {
    try {
      const { jobId } = request.body ?? {};

      if (!jobId) {
        return reply.code(400).send({
          success: false,
          error: 'jobId is required.',
        });
      }

      const job = getJob(jobId);
      if (!job || !job.uploadPath) {
        return reply.code(404).send({
          success: false,
          error: 'Job not found or upload is missing.',
        });
      }

      if (job.status === 'completed') {
        return reply.code(200).send({
          success: true,
          data: {
            jobId,
            status: job.status,
            progress: job.progress,
            message: 'Job already completed.',
          },
        });
      }

      if (job.status === 'processing') {
        return reply.code(200).send({
          success: true,
          data: {
            jobId,
            status: job.status,
            progress: job.progress,
            message: 'Job is already processing.',
          },
        });
      }

      updateJob(jobId, { status: 'queued', progress: Math.max(job.progress, 10), error: undefined });
      enqueueJobProcessing(jobId);

      const queued = getJob(jobId);
      return reply.code(200).send({
        success: true,
        data: {
          jobId,
          status: queued?.status ?? 'queued',
          progress: queued?.progress ?? 10,
          message: 'Video processing job enqueued.',
        },
      });
    } catch (error) {
      request.log.error({ error }, 'Process request failed');
      return reply.code(500).send({
        success: false,
        error: 'Unable to enqueue video processing.',
      });
    }
  });
}
