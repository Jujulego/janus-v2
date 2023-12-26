import { Logger } from '@jujulego/logger';
import { actions$, SyncMutableRef } from 'kyrielle';
import { var$ } from 'kyrielle/refs';

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
export function redirection$(state: Redirection, logger: Logger): RedirectionRef {
  return actions$(var$(state), {
    enableOutput: (name: string) => (draft) => {
      const output = draft.outputs.find((out) => out.name === name);

      if (output && !output.enabled) {
        output.enabled = true;
        logger.info`Output ${name} enabled`;
      }
    },
    disableOutput: (name: string) => (draft) => {
      const output = draft.outputs.find((out) => out.name === name);

      if (output?.enabled) {
        output.enabled = false;
        logger.info`Output ${name} disabled`;
      }
    }
  });
}
