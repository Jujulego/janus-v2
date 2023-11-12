import { actions$, RefMap, SyncMutableRef, var$ } from '@jujulego/aegis';
import { inject$, Service } from '@jujulego/injector';
import { nanoid } from 'nanoid';

import { Redirection } from './redirection.ts';
import { LabelledLogger } from '../logger.config.ts';

// Repository
@Service()
export class RedirectionStore {
  // Attributes
  private readonly _logger = inject$(LabelledLogger('redirections'));

  private readonly _redirections = new RefMap((key: string, state: Redirection) => actions$(var$(state), {
    enableOutput: (name: string) => (draft) => {
      const output = draft.outputs[name];

      if (output) {
        output.enabled = true;
      }
    },
    disableOutput: (name: string) => (draft) => {
      const output = draft.outputs[name];

      if (output) {
        output.enabled = false;
        this._logger.info(`Output #${draft.id}.${name} disabled`);
      }
    }
  }));

  // Methods
  register(redirection: Omit<Redirection, 'id'>): SyncMutableRef<Redirection> {
    const id = nanoid(6);
    const ref = this._redirections.set(id, { ...redirection, id });

    const gates = Object.values(redirection.outputs);
    this._logger.verbose(`Registered ${redirection.url} with ${gates.length} gates (#${id})`);

    return ref;
  }

  get(id: string) {
    return this._redirections.get(id) ?? null;
  }

  resolve(url: string) {
    for (const ref of this._redirections.references()) {
      if (url.startsWith(ref.read().url)) {
        return ref;
      }
    }

    return null;
  }
}