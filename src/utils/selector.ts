import { Store } from '@reduxjs/toolkit';
import { Observable, Readable } from 'kyrielle';
import { source$ } from 'kyrielle/events';

// Utils
export function selector$<S, D>(store: Store<S>, selector: (state: S) => D): Readable<D> & Observable<D> {
  const src = source$<D>();

  function read(): D {
    const data = selector(store.getState());
    src.next(data);

    return data;
  }

  store.subscribe(() => {
    read();
  });

  return {
    read,
    subscribe: src.subscribe,
    unsubscribe: src.unsubscribe,
    clear: src.clear,
  };
}