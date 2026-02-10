import { promises as fs } from 'node:fs';
import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { processRoutes } from './routes/process.js';
import { resultRoutes } from './routes/result.js';
import { statusRoutes } from './routes/status.js';
import { uploadRoutes } from './routes/upload.js';
import { OUTPUTS_DIR, UPLOADS_DIR } from './utils/paths.js';

const app = Fastify({
  logger: true,
});

async function buildServer() {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.mkdir(OUTPUTS_DIR, { recursive: true });

  await app.register(multipart, {
    limits: {
      fileSize: 1024 * 1024 * 1024, // 1GB
      files: 1,
    },
  });

  await uploadRoutes(app);
  await processRoutes(app);
  await statusRoutes(app);
  await resultRoutes(app);

  app.get('/health', async () => ({ ok: true }));

  return app;
}

const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? '0.0.0.0';

buildServer()
  .then((server) => server.listen({ port: PORT, host: HOST }))
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
