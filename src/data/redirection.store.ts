import { SyncMutableRef, var$ } from '@jujulego/aegis';
import { inject$, Service } from '@jujulego/injector';
import { nanoid } from 'nanoid';

import { Redirection } from './redirection.ts';
import { LabelledLogger } from '../logger.config.ts';

// Repository
@Service()
export class RedirectionStore {
  // Attributes
  private readonly _logger = inject$(LabelledLogger('redirections'));
  private readonly _redirections = new Map<string, SyncMutableRef<Redirection>>();

  // Methods
  register(redirection: Omit<Redirection, 'id'>): SyncMutableRef<Redirection> {
    const id = nanoid(6);
    const ref = var$({ ...redirection, id });
    this._redirections.set(id, ref);

    const gates = Object.values(redirection.outputs);
    this._logger.verbose(`Registered ${redirection.url} with ${gates.length} gates (#${id})`);

    return ref;
  }

  get(id: string): SyncMutableRef<Redirection> | null {
    return this._redirections.get(id) ?? null;
  }

  resolve(url: string): Redirection | null {
    for (const ref of this._redirections.values()) {
      const redirection = ref.read();

      if (url.startsWith(redirection.url)) {
        return redirection;
      }
    }

    return null;
  }
}