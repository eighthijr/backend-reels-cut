import type { FastifyInstance } from 'fastify';
import { getJob } from '../jobs/jobStore.js';

export async function statusRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Params: { jobId: string } }>('/status/:jobId', async (request, reply) => {
    try {
      const job = getJob(request.params.jobId);

      if (!job) {
        return reply.code(404).send({
          success: false,
          error: 'Job not found.',
        });
      }

      return reply.code(200).send({
        success: true,
        data: {
          jobId: job.id,
          status: job.status,
          progress: job.progress,
          error: job.error ?? null,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        },
      });
    } catch (error) {
      request.log.error({ error }, 'Status request failed');
      return reply.code(500).send({
        success: false,
        error: 'Unable to fetch job status.',
      });
    }
  });
}
