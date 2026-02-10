import type { FastifyInstance } from 'fastify';
import { getJob } from '../jobs/jobStore.js';

export async function resultRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Params: { jobId: string } }>('/result/:jobId', async (request, reply) => {
    const job = getJob(request.params.jobId);

    if (!job) {
      return reply.code(404).send({ error: 'Job not found.' });
    }

    if (job.status !== 'done' || !job.result) {
      return reply.code(409).send({
        error: 'Result not available yet.',
        status: job.status,
      });
    }

    return reply.code(200).send({
      jobId: job.id,
      ...job.result,
    });
  });
}
