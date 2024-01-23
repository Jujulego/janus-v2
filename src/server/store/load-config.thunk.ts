import { createHash } from 'node:crypto';

import { Config } from '../../config/type.ts';
import { putRedirection } from './redirections.slice.ts';
import { OutputState, putOutputs } from './outputs.slice.ts';
import { ServerDispatch } from './types.ts';

// Thunk
export function loadConfig(config: Config) {
  return (dispatch: ServerDispatch) => {
    for (const [url, redirection] of Object.entries(config.redirections)) {
      const id = generateRedirectionId(url);
      const outputs: OutputState[] = [];

      for (const [name, output] of Object.entries(redirection.outputs)) {
        outputs.push({
          ...output,
          id: `${id}-${name}`,
          name,
        });
      }

      dispatch(putOutputs(outputs));
      dispatch(putRedirection({
        id, url,
        outputs: outputs.map(({ id }) => id),
      }));
    }
  };
}

// Utils
function generateRedirectionId(url: string): string {
  const hash = createHash('md5');
  hash.update(url);

  return hash.digest().toString('base64url');
}