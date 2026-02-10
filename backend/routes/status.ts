import type { FastifyInstance } from 'fastify';
import { getJob } from '../jobs/jobStore.js';

export async function statusRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Params: { jobId: string } }>('/status/:jobId', async (request, reply) => {
    const job = getJob(request.params.jobId);

    if (!job) {
      return reply.code(404).send({ error: 'Job not found.' });
    }

    return reply.code(200).send({
      jobId: job.id,
      status: job.status,
      progress: job.progress ?? null,
      error: job.error ?? null,
      updatedAt: job.updatedAt,
    });
  });
}
