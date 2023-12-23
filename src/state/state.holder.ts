import { Logger } from '@jujulego/logger';

import { RedirectionStore } from './redirection.store.ts';

// Service
export class StateHolder {
  // Attributes
  readonly redirections: RedirectionStore;

  // Constructor
  constructor(logger: Logger) {
    this.redirections = new RedirectionStore(logger);
  }
}