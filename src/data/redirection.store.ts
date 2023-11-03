import { SyncMutableRef, var$ } from '@jujulego/aegis';
import { inject$, Service } from '@jujulego/injector';
import { nanoid } from 'nanoid';

import { Redirection } from './redirection.ts';
import { LabelledLogger } from '../logger.config.ts';
import { acts } from '../utils/acts.ts';
import { registry } from '../utils/registry.ts';

// Repository
@Service()
export class RedirectionStore {
  // Attributes
  private readonly _logger = inject$(LabelledLogger('redirections'));

  private readonly _redirections = registry((state: Redirection) => acts(var$(state), {
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
        this._logger.info(`Output #${draft.id}.${output} disabled`);
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
    for (const ref of this._redirections.refs.values()) {
      if (url.startsWith(ref.read().url)) {
        return ref;
      }
    }

    return null;
  }
}