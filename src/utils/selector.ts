import { Store } from '@reduxjs/toolkit';
import { each$, Observable, pipe$, Readable, resourceBuilder$ } from 'kyrielle';

// Utils
export function selector$<S, D>(store: Store<S>, selector: (state: S) => D): Readable<D> & Observable<D> {
  return pipe$(
    resourceBuilder$<S>()
      .add(store[Symbol.observable]() as Observable<S>)
      .add({ read: () => store.getState() })
      .build(),
    each$(selector)
  ) as Readable<D> & Observable<D>;
}
