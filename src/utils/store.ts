import { type Mutable, type Observable, observable$, type PipeStep, type Readable, resource$ } from 'kyrielle';
import { useSyncExternalStore } from 'react';

// Types
export interface StoreReference<in out D> extends Readable<D | undefined>, Mutable<D, D> {}

export interface StoredResource<out D> extends Readable<D | undefined>, Observable<D> {}

/**
 * Stores loaded data within given reference.
 */
export function store$<D>(ref: StoreReference<D>): PipeStep<Observable<D>, StoredResource<D>> {
  return (origin: Observable<D> & Partial<Readable<D>>) => {
    return resource$<D>()
      .add(observable$((obs, signal) => {
        const sub = origin.subscribe({
          next(data: D) {
            ref.mutate(data);
            setTimeout(() => obs.next(data), 5000);
          },
          error: obs.error,
          complete: obs.complete,
        });

        signal.addEventListener('abort', () => sub.unsubscribe());
      }))
      .add({ read: ref.read })
      .build();
  };
}

export function useStore$<D>(res: StoredResource<D>): D {
  const data = useSyncExternalStore(
    (cb) => {
      const sub = res.subscribe(cb);
      return () => sub.unsubscribe();
    },
    () => res.read(),
  );

  if (data === undefined) {
    // TODO: use "use" once React 19 is out
    // TODO: replace promise creation by waitFor$
    throw new Promise((resolve, reject) => res.subscribe(resolve, reject));
  }

  return data;
}