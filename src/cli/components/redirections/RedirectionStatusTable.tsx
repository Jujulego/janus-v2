import { useApp, useInput } from 'ink';
import type { StoredResource } from 'kyrielle';
import { useCallback } from 'react';

import { FragmentType, unmask } from '../../../gql/index.js';
import { useStore$ } from '../../../utils/store.js';
import Table from '../table/Table.jsx';
import RedirectionStatus, { RedirectionStatusItem } from './RedirectionStatus.jsx';

// Component
export interface RedirectionStatusTableProps {
  readonly redirections$: StoredResource<FragmentType<typeof RedirectionStatusItem>[]>;
}

export default function RedirectionStatusTable(props: RedirectionStatusTableProps) {
  const redirections = useStore$(props.redirections$);

  const app = useApp();
  useInput(useCallback((input) => {
    if (input === 'q') {
      app.exit();
    }
  }, [app]));

  return (
    <Table>
      { redirections.map((redirection) => (
         <RedirectionStatus key={unmask(RedirectionStatusItem, redirection).id} redirection={redirection} />
      )) }
    </Table>
  );
}
