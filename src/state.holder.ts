import { Logger } from '@jujulego/logger';

import { RedirectionStore } from './state/redirection.store.ts';

// Service
export class StateHolder {
  // Attributes
  readonly redirections: RedirectionStore;

  // Constructor
  constructor(logger: Logger) {
    this.redirections = new RedirectionStore(logger);
  }
}