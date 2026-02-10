# Video Processing Backend (Fastify)

A Node.js + Fastify backend API that accepts video uploads and asynchronously processes them with an in-memory job queue.

## Run

```bash
npm install
npm run dev
```

Build and run production:

```bash
npm run build
npm run start
```

## API Endpoints

- `POST /upload` - upload a video file to `storage/uploads`
- `POST /process` - enqueue processing for an uploaded `jobId`
- `GET /status/:jobId` - check job status/progress
- `GET /result/:jobId` - read clip/subtitle URLs when complete
- `GET /health` - health check

## Job lifecycle

`queued -> processing -> completed | failed`

## Response shape

All endpoints return JSON:

```json
{
  "success": true,
  "data": {},
  "error": "optional error"
}
```

## Example `curl` upload

```bash
curl -X POST http://localhost:3000/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/absolute/path/to/video.mp4"
```

Then enqueue processing:

```bash
curl -X POST http://localhost:3000/process \
  -H "Content-Type: application/json" \
  -d '{"jobId":"<job-id-from-upload>"}'
```

And poll:

```bash
curl http://localhost:3000/status/<job-id>
curl http://localhost:3000/result/<job-id>
```

## Postman tip

For `POST /upload`, choose `Body -> form-data`, add key `file` with type `File`, and select your video file.
