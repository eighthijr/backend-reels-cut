import type { FastifyInstance } from 'fastify';
import { getJob } from '../jobs/jobStore.js';

export async function resultRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Params: { jobId: string } }>('/result/:jobId', async (request, reply) => {
    try {
      const job = getJob(request.params.jobId);

      if (!job) {
        return reply.code(404).send({
          success: false,
          error: 'Job not found.',
        });
      }

      if (job.status !== 'completed' || !job.result) {
        return reply.code(400).send({
          success: false,
          error: `Result not available. Current status: ${job.status}`,
        });
      }

      return reply.code(200).send({
        success: true,
        data: {
          jobId: job.id,
          clips: job.result.clips,
          subtitlesPath: job.result.subtitlesPath,
          subtitlesVttPath: job.result.subtitlesVttPath ?? null,
        },
      });
    } catch (error) {
      request.log.error({ error }, 'Result request failed');
      return reply.code(500).send({
        success: false,
        error: 'Unable to fetch result.',
      });
    }
  });
}
