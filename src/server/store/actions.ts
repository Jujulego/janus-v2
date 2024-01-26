import { createAction } from '@reduxjs/toolkit';

import { Config } from '../../config/type.js';

/**
 * Loads config into store
 */
export const loadConfig = createAction<Config>('load-config');
