import { createHash } from 'node:crypto';

export function generateRedirectionId(url: string): string {
  const hash = createHash('md5');
  hash.update(url);

  return hash.digest().toString('hex');
}