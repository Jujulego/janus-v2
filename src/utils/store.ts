import {
  type Mutable,
  type Observable,
  observable$,
  type ObservedValue,
  type PipeStep,
  type Readable,
  resource$,
  Awaitable, type ReadValue
} from 'kyrielle';
import { useSyncExternalStore } from 'react';

// Types
export interface StoreOrigin<in out D = unknown> extends Observable<D>, Partial<Readable<Awaitable<D>>> {}
export interface StoreReference<in out D = unknown> extends Readable<D | undefined>, Mutable<D, D> {}

export interface StoredResource<out D = unknown> extends Readable<D | undefined>, Observable<D> {}

/**
 * Stores loaded data within given reference.
 */
export function store$<O extends Observable & Readable>(ref: StoreReference<ObservedValue<O>>): PipeStep<O, StoredResource<ObservedValue<O>> & { refresh: () => ReadValue<O> }>;
export function store$<O extends Observable>(ref: StoreReference<ObservedValue<O>>): PipeStep<O, StoredResource<ObservedValue<O>>>;
export function store$<O extends StoreOrigin>(ref: StoreReference<ObservedValue<O>>): PipeStep<O, StoredResource<ObservedValue<O>>> {
  return (origin: O) => {
    const result = resource$()
      .add(observable$<ObservedValue<O>>((obs, signal) => {
        const sub = origin.subscribe({
          next(data: ObservedValue<O>) {
            ref.mutate(data);
            obs.next(data);
          },
          error: obs.error,
          complete: obs.complete,
        });

        signal.addEventListener('abort', () => sub.unsubscribe());
      }))
      .add({ read: ref.read })
      .build();

    if (typeof origin.read === 'function') {
      Object.assign(result, {
        refresh: () => origin.read!()
      });
    }

    return result;
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