import { Store } from '@reduxjs/toolkit';
import { each$, Observable, pipe$, Deferrable, resource$ } from 'kyrielle';

// Utils
export function selector$<S, D>(store: Store<S>, selector: (state: S) => D): Deferrable<D> & Observable<D> {
  return pipe$(
    resource$<S>()
      .add(store)
      .add({ defer: () => store.getState() })
      .build(),
    each$(selector)
  ) as Deferrable<D> & Observable<D>;
}
