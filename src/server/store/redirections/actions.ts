import { createAction } from '@reduxjs/toolkit';

// Types
export interface RedirectionOutputIds {
  readonly redirectionId: string;
  readonly outputName: string;
}

/**
 * Enables a redirection's output
 */
export const enableRedirectionOutput = createAction<RedirectionOutputIds>('redirections/enable-redirection-output');


/**
 * Disables a redirection's output
 */
export const disableRedirectionOutput = createAction<RedirectionOutputIds>('redirections/disable-redirection-output');
