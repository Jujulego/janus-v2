import type { Store } from '@reduxjs/toolkit';
import type { Observable, Ref } from 'kyrielle';
import { map$, pipe$, resource$ } from 'kyrielle';

// Utils
export function selector$<S, D>(store: Store<S>, selector: (state: S) => D): Ref<D> & Observable<D> {
  return pipe$(
    resource$()
      .add(store)
      .add({ defer: () => store.getState() })
      .build(),
    map$(selector)
  ) as Ref<D> & Observable<D>;
}
