import { createWriteStream } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import type { FastifyInstance } from 'fastify';
import { createJob, updateJob } from '../jobs/jobStore.js';
import { UPLOADS_DIR } from '../utils/paths.js';
import { buildUniqueFilename } from '../utils/sanitize.js';

export async function uploadRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/upload', async (request, reply) => {
    try {
      const part = await request.file();

      if (!part) {
        return reply.code(400).send({
          success: false,
          error: 'Missing file field in multipart form-data.',
        });
      }

      await fs.mkdir(UPLOADS_DIR, { recursive: true });

      const filename = buildUniqueFilename(part.filename ?? 'video.mp4');
      const destination = path.join(UPLOADS_DIR, filename);
      const job = createJob({ status: 'queued', progress: 0 });

      await pipeline(part.file, createWriteStream(destination));

      const updated = updateJob(job.id, {
        uploadPath: destination,
        progress: 10,
      });

      return reply.code(200).send({
        success: true,
        data: {
          jobId: job.id,
          status: updated?.status ?? 'queued',
          progress: updated?.progress ?? 10,
        },
      });
    } catch (error) {
      request.log.error({ error }, 'Upload failed');
      return reply.code(500).send({
        success: false,
        error: 'Unable to upload video file.',
      });
    }
  });
}
