import { RefMap, SyncMutableRef } from '@jujulego/aegis';
import { inject$, Service } from '@jujulego/injector';
import { createHash } from 'node:crypto';

import { Config } from '../config/loader.ts';
import { LabelledLogger } from '../logger.config.ts';
import { Redirection, redirection$ } from './redirection.ts';

// Repository
@Service()
export class RedirectionStore {
  // Attributes
  private readonly _logger = inject$(LabelledLogger('redirections'));
  private readonly _redirections = new RefMap((_: string, value: Redirection) => redirection$(value));

  // Methods
  private _generateId(url: string) {
    const hash = createHash('md5');
    hash.update(url);

    return hash.digest().toString('base64url');
  }

  register(redirection: Omit<Redirection, 'id'>): SyncMutableRef<Redirection> {
    const id = this._generateId(redirection.url);
    const ref = this._redirections.set(id, { ...redirection, id });

    const gates = Object.values(redirection.outputs);
    this._logger.verbose(`Registered ${redirection.url} with ${gates.length} gates (#${id})`);

    return ref;
  }

  async loadConfig(): Promise<void> {
    const config = await inject$(Config);
    let count = 0;

    for (const [url, { outputs }] of Object.entries(config.redirections)) {
      this.register({
        url,
        outputs: Object.entries(outputs).map(([name, output]) => ({ ...output, name }))
      });

      ++count;
    }

    this._logger.verbose(`Loaded ${count} redirections from config`);
  }

  find() {
    return this._redirections.references();
  }

  get(id: string) {
    return this._redirections.get(id) ?? null;
  }

  resolve(url: string) {
    for (const ref of this.find()) {
      if (url.startsWith(ref.read().url)) {
        return ref;
      }
    }

    return null;
  }
}
