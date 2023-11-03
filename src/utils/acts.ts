import { SyncMutableRef } from '@jujulego/aegis';
import { produce } from 'immer';

// Types
export type ActReducer<A extends unknown[] = unknown[], T = unknown> = (...args: A) => (state: T) => void;
export type Act<A extends unknown[] = unknown[], T = unknown> = (...args: A) => T;

export type ActRef<T, A extends Record<string, ActReducer<unknown[], T>>> = {
  [K in keyof A]: A[K] extends ActReducer<infer Args, T> ? Act<Args, T> : never;
} & SyncMutableRef<T>;

export function acts<T, A extends Record<string, ActReducer<any[], T>>>(ref: SyncMutableRef<T>, acts: A): ActRef<T, A> {
  const result: SyncMutableRef<T> = {
    next: ref.next,
    read: ref.read,
    mutate: ref.mutate,
    subscribe: ref.subscribe,
    unsubscribe: ref.unsubscribe,
    clear: ref.clear,
  };

  for (const [key, act] of Object.entries(acts)) {
    Object.assign(result, {
      [key]: (...args: any[]) => ref.mutate(produce(ref.read(), act(...args))),
    });
  }

  return result as ActRef<T, A>;
}