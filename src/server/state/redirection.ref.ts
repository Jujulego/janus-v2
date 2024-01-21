import { Logger } from '@jujulego/logger';
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
export function redirection$(state: Redirection, logger: Logger): RedirectionRef {
  return bind$(var$(state), {
    enableOutput(name: string) {
      return produce$(this, (draft) => {
        const output = draft.outputs.find((out) => out.name === name);

        if (output && !output.enabled) {
          output.enabled = true;
          logger.info`Output ${name} enabled`;
        }
      });
    },
    disableOutput(name: string) {
      return produce$(this, (draft) => {
        const output = draft.outputs.find((out) => out.name === name);

        if (output?.enabled) {
          output.enabled = false;
          logger.info`Output ${name} disabled`;
        }
      });
    }
  });
}
