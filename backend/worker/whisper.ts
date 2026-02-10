import { spawn } from 'node:child_process';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { OUTPUTS_DIR } from '../utils/paths.js';

export async function transcribeVideo(jobId: string): Promise<string> {
  // In real integration, replace this with a Whisper invocation, e.g.:
  // python whisper_runner.py --input <videoPath> --output <subtitlePath>
  await runStubProcess('whisper transcription simulation');

  const jobDir = path.join(OUTPUTS_DIR, jobId);
  await fs.mkdir(jobDir, { recursive: true });

  const subtitlePath = path.join(jobDir, 'subtitles.srt');
  await fs.writeFile(subtitlePath, '1\n00:00:00,000 --> 00:00:02,000\nStub subtitle\n');

  return subtitlePath;
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
