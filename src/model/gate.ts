import { Logger } from '@jujulego/logger';
import { AsyncSymmetricRef, SymmetricRef, SyncSymmetricRef } from 'kyrielle';
import { bind$, produce$ } from 'kyrielle/refs';

/**
 * Possible redirection output
 */
export interface Gate {
  readonly name: string;
  readonly target: string;
  readonly enabled: boolean;
  readonly changeOrigin: boolean;
  readonly secure: boolean;
  readonly ws: boolean;
}

/**
 * Gate methods.
 */
export interface GateMethods<Async extends true | false = false> {
  /**
   * Enables gate.
   */
  enable(): Async extends true ? Promise<Gate> : Gate;

  /**
   * Disables gate.
   */
  enable(): Async extends true ? Promise<Gate> : Gate;
}

// Reference
export function gate$<R extends SyncSymmetricRef<Gate>>(ref: R, logger?: Logger): R & GateMethods;
export function gate$<R extends AsyncSymmetricRef<Gate>>(ref: R, logger?: Logger): R & GateMethods<true>;
export function gate$(ref: SymmetricRef<Gate>, logger?: Logger) {
  return bind$(ref, {
    enable() {
      return produce$<Gate>(this, (draft) => {
        if (!draft.enabled) {
          draft.enabled = true;

          if (logger) {
            logger.info`Output ${draft.name} enabled`;
          }
        }
      });
    },
    disable() {
      return produce$<Gate>(this, (draft) => {
        if (draft.enabled) {
          draft.enabled = false;

          if (logger) {
            logger.info`Output ${draft.name} disabled`;
          }
        }
      });
    }
  });
}
