import { inject$ } from '@jujulego/injector';
import { actions$, SyncMutableRef } from 'kyrielle';
import { var$ } from 'kyrielle/refs';

import { LabelledLogger } from '../logger.config.ts';

// Types
export interface RedirectionOutput {
  readonly name: string;
  readonly target: string;
  readonly enabled: boolean;
  readonly changeOrigin: boolean;
  readonly secure: boolean;
  readonly ws: boolean;
}

export interface Redirection {
  readonly id: string;
  readonly url: string;
  readonly outputs: readonly RedirectionOutput[];
}

export interface RedirectionRef extends SyncMutableRef<Redirection> {
  enableOutput(name: string): Redirection;
  disableOutput(name: string): Redirection;
}

// Reference
export function redirection$(state: Redirection): RedirectionRef {
  const logger = inject$(LabelledLogger(`#${state.id}`));

  return actions$(var$(state), {
    enableOutput: (name: string) => (draft) => {
      const output = draft.outputs.find((out) => out.name === name);

      if (output && !output.enabled) {
        output.enabled = true;
        logger.info(`Output ${name} enabled`);
      }
    },
    disableOutput: (name: string) => (draft) => {
      const output = draft.outputs.find((out) => out.name === name);

      if (output && output.enabled) {
        output.enabled = false;
        logger.info(`Output ${name} disabled`);
      }
    }
  });
}
