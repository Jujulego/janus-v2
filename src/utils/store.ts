import { StoredResource, waitFor$ } from 'kyrielle';
import { useCallback, useSyncExternalStore } from 'react';

export function useStore$<D>(res: StoredResource<D>): D {
  const data = useSyncExternalStore(
    useCallback((cb) => {
      const sub = res.subscribe(cb);
      return () => sub.unsubscribe();
    }, [res]),
    () => res.defer(),
  );

  if (data === undefined) {
    // TODO: use "use" once React 19 is out
    throw waitFor$(res);
  }

  return data;
}