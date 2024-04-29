export function isTimeoutError(err: unknown): err is DOMException {
  return err instanceof DOMException && ['AbortError', 'TimeoutError'].includes(err.name);
}