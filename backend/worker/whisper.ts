import { spawn } from 'node:child_process';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { OUTPUTS_DIR } from '../utils/paths.js';

export interface SubtitleOutput {
  srtPath: string;
  vttPath?: string;
}

export async function transcribeVideo(jobId: string): Promise<SubtitleOutput> {
  try {
    // In real integration, replace this with a Whisper invocation, e.g.:
    // python whisper_runner.py --input <videoPath> --output <subtitlePath>
    await runProcess('whisper transcription simulation');

    const jobDir = path.join(OUTPUTS_DIR, jobId);
    await fs.mkdir(jobDir, { recursive: true });

    const subtitlePath = path.join(jobDir, 'subtitles.srt');
    const srtContent = '1\n00:00:00,000 --> 00:00:02,000\nStub subtitle\n';
    await fs.writeFile(subtitlePath, srtContent);

    const vttPath = path.join(jobDir, 'subtitles.vtt');
    await fs.writeFile(vttPath, srtToVtt(srtContent));

    return {
      srtPath: subtitlePath,
      vttPath,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Whisper transcription error';
    throw new Error(`Whisper transcription failed: ${message}`);
  }
}

function srtToVtt(srt: string): string {
  const body = srt.replaceAll(',', '.');
  return `WEBVTT\n\n${body}`;
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
