import path from 'node:path';

const SAFE_CHARS_REGEX = /[^a-zA-Z0-9._-]/g;

export function sanitizeFilename(filename: string): string {
  const base = path.basename(filename).replace(SAFE_CHARS_REGEX, '_');
  return base.length > 0 ? base : 'video';
}

export function buildUniqueFilename(originalFilename: string): string {
  const safe = sanitizeFilename(originalFilename);
  const ext = path.extname(safe);
  const name = path.basename(safe, ext);
  return `${name}-${Date.now()}-${crypto.randomUUID()}${ext}`;
}
