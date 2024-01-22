import { MutableRef } from 'kyrielle';
import { bind$, ref$, var$ } from 'kyrielle/refs';

import { RedirectionOutput, redirectionOutput$ } from './redirection-output.ref.ts';

// Types
export interface Redirection {
  readonly id: string;
  readonly url: string;
  readonly outputs: readonly RedirectionOutput[];
}

export interface RedirectionRef extends MutableRef<Redirection> {
  enableOutput(name: string): Redirection;
  disableOutput(name: string): Redirection;
}

// Reference
export function redirection$(initial: Redirection): RedirectionRef {
  const state$ = var$({ id: initial.id, url: initial.url });
  const outputs$ = initial.outputs.map((output) => redirectionOutput$(output));

  const ref = ref$({
    read(): Redirection {
      return {
        ...state$.read(),
        outputs: outputs$.map((r) => r.read()),
      };
    },
    mutate(arg: Redirection): Redirection {
      state$.mutate({ id: arg.id, url: arg.url });

      for (let i = 0; i < arg.outputs.length; ++i) {
        if (outputs$.length > i) {
          outputs$[i]!.mutate(arg.outputs[i]!);
        } else {
          const r = redirectionOutput$(arg.outputs[i]!);

          outputs$.push(r);
          r.subscribe(() => ref.next(ref.read()));
        }
      }

      outputs$.splice(arg.outputs.length, outputs$.length);

      return arg;
    }
  });

  state$.subscribe(() => ref.next(ref.read()));
  outputs$.forEach((r) => r.subscribe(() => ref.next(ref.read())));

  return bind$(ref, {
    enableOutput(name: string) {
      for (const output$ of outputs$) {
        if (output$.read().name === name) {
          output$.enable();
        }
      }

      return this.read();
    },
    disableOutput(name: string) {
      for (const output$ of outputs$) {
        if (output$.read().name === name) {
          output$.disable();
        }
      }

      return this.read();
    }
  });
}
