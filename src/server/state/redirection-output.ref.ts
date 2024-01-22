import { MutableRef } from 'kyrielle';
import { bind$, produce$, var$ } from 'kyrielle/refs';

// Types
export interface RedirectionOutput {
  readonly name: string;
  readonly target: string;
  readonly enabled: boolean;
  readonly changeOrigin: boolean;
  readonly secure: boolean;
  readonly ws: boolean;
}

export interface RedirectionOutputRef extends MutableRef<RedirectionOutput> {
  enable(): RedirectionOutput;
  disable(): RedirectionOutput;
}

// Reference
export function redirectionOutput$(initial: RedirectionOutput): RedirectionOutputRef {
  return bind$(var$(initial), {
    enable() {
      return produce$(this, (draft) => {
        draft.enabled = true;
      });
    },
    disable() {
      return produce$(this, (draft) => {
        draft.enabled = false;
      });
    },
  });
}