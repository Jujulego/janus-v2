import { Readable, readable$ } from 'kyrielle';

export interface FetchOpts extends Omit<RequestInit, 'signal'> {
  onFetch?: (url: string | URL) => void;
}

export class FetchError extends Error {
  // Constructor
  constructor(readonly response: Response) {
    super(response.statusText);
  }

  // Properties
  get status(): number {
    return this.response.status;
  }
}

export function fetch$(url: string | URL, opts: FetchOpts = {}): Readable<Promise<unknown>> {
  return readable$(async (signal): Promise<unknown> => {
    if (opts.onFetch) opts.onFetch(url);
    const res = await fetch(url, { ...opts, signal });

    if (!res.ok) {
      throw new FetchError(res);
    }

    return res.json();
  });
}
