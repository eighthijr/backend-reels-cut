import { spawn } from 'node:child_process';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { OUTPUTS_DIR } from '../utils/paths.js';

export async function splitIntoClips(jobId: string): Promise<string[]> {
  // In real integration, replace this stub spawn with an FFmpeg invocation, e.g.:
  // ffmpeg -i <input> -ss <start> -to <end> -c copy <outputClip>
  await runStubProcess('ffmpeg split simulation');

  const jobDir = path.join(OUTPUTS_DIR, jobId);
  await fs.mkdir(jobDir, { recursive: true });

  const clips = [
    path.join(jobDir, 'clip-1.mp4'),
    path.join(jobDir, 'clip-2.mp4'),
  ];

  for (const clipPath of clips) {
    await fs.writeFile(clipPath, 'stub clip content');
  }

  return clips;
}

export async function renderFinalAssets(jobId: string): Promise<void> {
  // In production, this is where you'd call FFmpeg for final rendering/compositing.
  await runStubProcess('ffmpeg render simulation');

  const renderMarker = path.join(OUTPUTS_DIR, jobId, 'render.done');
  await fs.writeFile(renderMarker, 'done');
}

function runStubProcess(label: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['-e', `setTimeout(() => console.log(${JSON.stringify(label)}), 300);`], {
      stdio: 'ignore',
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${label} failed with code ${code}`));
      }
    });
  });
}
