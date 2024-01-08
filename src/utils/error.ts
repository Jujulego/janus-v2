export function isTimeoutError(err: unknown): err is DOMException {
  return err instanceof DOMException && err.name === 'TimeoutError';
}