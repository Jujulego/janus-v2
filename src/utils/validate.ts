import { each$, EachOrigin, EachOriginValue, EachResult, PipeStep } from 'kyrielle';

export type Assertion<in D, out R extends D> = (data: D) => asserts data is R;
export type Predicate<in D, out R extends D> = (data: D) => data is R;

export interface PredicateOpts<in D = unknown> {
  readonly onMiss?: (value: D) => never;
}

export function validate$<O extends EachOrigin, R extends EachOriginValue<O>>(assert: Assertion<EachOriginValue<O>, R>): PipeStep<O, EachResult<O, R>>;
export function validate$<O extends EachOrigin, R extends EachOriginValue<O>>(predicate: Predicate<EachOriginValue<O>, R>, opts?: PredicateOpts<EachOriginValue<O>>): PipeStep<O, EachResult<O, R>>;

export function validate$(fn: (value: unknown) => boolean | void, opts: PredicateOpts = {}) {
  return each$((value) => {
    if (fn(value) === false) {
      if (opts.onMiss) {
        opts!.onMiss(value);
      } else {
        throw new Error('Predicate validation failed');
      }
    }

    return value;
  });
}
