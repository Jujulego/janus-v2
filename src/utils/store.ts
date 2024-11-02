import type { Observable, Ref } from 'kyrielle';
import { waitFor$ } from 'kyrielle';
import { useCallback, useSyncExternalStore } from 'react';

export type Stored<D> = Observable<D> & Ref<D>;

export function useStore$<D>(res: Stored<D>): D {
  const data = useSyncExternalStore(
    useCallback((cb) => {
      const sub = res.subscribe(cb);
      return () => sub.unsubscribe();
    }, [res]),
    () => res.defer(),
  );

  if (data === undefined) {
    // TODO: use "use" once React 19 is out
    throw waitFor$(res); // eslint-disable-line @typescript-eslint/only-throw-error
  }

  return data;
}
