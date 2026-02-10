# Video Processing Backend (Fastify)

A Node.js + Fastify backend API that accepts video uploads and asynchronously processes them with a job queue in memory.

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
- `GET /status/:jobId` - check progress/status
- `GET /result/:jobId` - read clip/subtitle output when complete
- `GET /health` - health check

## Example `curl` upload

```bash
curl -X POST http://localhost:3000/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/absolute/path/to/video.mp4"
```

Expected response:

```json
{
  "jobId": "9f5df4cd-6cf8-4bc6-a50f-c68777ba24e6",
  "status": "uploading",
  "uploadPath": "/workspace/backend-reels-cut/backend/storage/uploads/video-...mp4"
}
```

Then enqueue processing:

```bash
curl -X POST http://localhost:3000/process \
  -H "Content-Type: application/json" \
  -d '{"jobId":"9f5df4cd-6cf8-4bc6-a50f-c68777ba24e6"}'
```

And poll:

```bash
curl http://localhost:3000/status/9f5df4cd-6cf8-4bc6-a50f-c68777ba24e6
curl http://localhost:3000/result/9f5df4cd-6cf8-4bc6-a50f-c68777ba24e6
```

## Postman tip

In Postman, create a `POST /upload` request, choose `Body -> form-data`, add key `file` with type `File`, and select your video file.
