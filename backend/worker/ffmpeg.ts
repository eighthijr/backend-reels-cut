import { spawn } from 'node:child_process';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { OUTPUTS_DIR } from '../utils/paths.js';

export async function splitIntoClips(jobId: string): Promise<string[]> {
  try {
    // In real integration, replace this stub spawn with an FFmpeg invocation, e.g.:
    // ffmpeg -i <input> -ss <start> -to <end> -c copy <outputClip>
    await runProcess('ffmpeg split simulation');

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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown FFmpeg split error';
    throw new Error(`FFmpeg split step failed: ${message}`);
  }
}

export async function renderFinalAssets(jobId: string): Promise<void> {
  try {
    // In production, this is where you'd call FFmpeg for final rendering/compositing.
    await runProcess('ffmpeg render simulation');

    const renderMarker = path.join(OUTPUTS_DIR, jobId, 'render.done');
    await fs.writeFile(renderMarker, 'done');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown FFmpeg render error';
    throw new Error(`FFmpeg render step failed: ${message}`);
  }
}

function runProcess(label: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['-e', `setTimeout(() => console.log(${JSON.stringify(label)}), 300);`], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (chunk) => {
      console.log(`[worker][stdout] ${chunk.toString().trim()}`);
    });

    child.stderr.on('data', (chunk) => {
      console.error(`[worker][stderr] ${chunk.toString().trim()}`);
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${label} failed with code ${code}`));
      }
    });
  });
}
