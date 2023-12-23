import { Logger, withLabel } from '@jujulego/logger';
import { SyncMutableRef } from 'kyrielle';
import { RefMap } from 'kyrielle/collections';
import { createHash } from 'node:crypto';

import { Config } from '../config/type.ts';
import { Redirection, redirection$ } from './redirection.ref.ts';

// Repository
export class RedirectionStore {
  // Attributes
  private readonly _logger: Logger;
  private readonly _redirections = new RefMap((_: string, value: Redirection) => redirection$(value));

  // Constructor
  constructor(logger: Logger) {
    this._logger = logger.child(withLabel('redirections'));
  }

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
    this._logger.verbose`Registered ${redirection.url} with ${gates.length} gates (#${id})`;

    return ref;
  }

  fromConfig(config: Config): void {
    let count = 0;

    for (const [url, { outputs }] of Object.entries(config.redirections)) {
      this.register({
        url,
        outputs: Object.entries(outputs).map(([name, output]) => ({ ...output, name }))
      });

      ++count;
    }

    this._logger.verbose`Loaded ${count} redirections from config`;
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
