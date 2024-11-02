import { useApp, useInput } from 'ink';
import { useCallback } from 'react';
import type { FragmentType } from '../../../gql/index.js';
import { unmask } from '../../../gql/index.js';
import { type Stored, useStore$ } from '../../../utils/store.js';
import ClientHelp from '../client/ClientHelp.jsx';
import Table from '../table/Table.jsx';
import RedirectionStatus, { RedirectionStatusItem } from './RedirectionStatus.jsx';

// Component
export interface RedirectionStatusTableProps {
  readonly redirections$: Stored<FragmentType<typeof RedirectionStatusItem>[]>;
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
      <ClientHelp>Press &apos;q&apos; to quit.</ClientHelp>
    </Table>
  );
}
