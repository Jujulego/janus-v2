import { MutableRef } from '@jujulego/aegis';

export function registry<K, T, R extends MutableRef<T> = MutableRef<T>>(fn: (val: T) => R) {
  const refs = new Map<K, R>();

  return {
    refs,
    get: (key: K): R | null => refs.get(key) ?? null,
    set(key: K, value: T): R {
      let ref = refs.get(key);

      if (!ref) {
        ref = fn(value);
        refs.set(key, ref);
      } else {
        ref.mutate(value);
      }

      return ref;
    }
  };
}