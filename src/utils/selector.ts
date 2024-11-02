import type { Store } from '@reduxjs/toolkit';
import type { Observable, Deferrable} from 'kyrielle';
import { each$, pipe$, resource$ } from 'kyrielle';

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
