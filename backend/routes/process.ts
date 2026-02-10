import type { FastifyInstance } from 'fastify';
import { getJob, updateJob } from '../jobs/jobStore.js';
import { enqueueJobProcessing } from '../worker/index.js';

interface ProcessBody {
  jobId: string;
}

export async function processRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post<{ Body: ProcessBody }>('/process', async (request, reply) => {
    const { jobId } = request.body ?? {};

    if (!jobId) {
      return reply.code(400).send({ error: 'jobId is required.' });
    }

    const job = getJob(jobId);
    if (!job || !job.uploadPath) {
      return reply.code(404).send({ error: 'Job not found or upload is missing.' });
    }

    if (job.status === 'done') {
      return reply.code(200).send({ jobId, status: job.status, message: 'Job already completed.' });
    }

    if (job.status === 'transcribing' || job.status === 'splitting' || job.status === 'rendering') {
      return reply.code(202).send({ jobId, status: job.status, message: 'Job is already processing.' });
    }

    updateJob(jobId, { status: 'transcribing', progress: 15, error: undefined });
    enqueueJobProcessing(jobId);

    return reply.code(202).send({
      jobId,
      status: 'transcribing',
      message: 'Video processing job enqueued.',
    });
  });
}
