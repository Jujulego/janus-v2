import { Store } from '@reduxjs/toolkit';
import { each$, Observable, pipe$, Readable, resource$ } from 'kyrielle';

// Utils
export function selector$<S, D>(store: Store<S>, selector: (state: S) => D): Readable<D> & Observable<D> {
  return pipe$(
    resource$<S>()
      .add(store)
      .add({ read: () => store.getState() })
      .build(),
    each$(selector)
  ) as Readable<D> & Observable<D>;
}
