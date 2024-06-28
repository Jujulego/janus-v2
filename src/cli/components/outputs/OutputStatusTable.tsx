import { Text, useApp, useInput } from 'ink';
import type { StoredResource } from 'kyrielle';
import { useCallback } from 'react';

import { FragmentType, graphql, unmask } from '../../../gql/index.js';
import { useStore$ } from '../../../utils/store.js';
import ClientHelp from '../client/ClientHelp.jsx';
import Table from '../table/Table.jsx';
import OutputStatus from './OutputStatus.jsx';

// Fragment
export const RedirectionWithOutputs = graphql(/* GraphQL */ `
  fragment RedirectionWithOutputs on Redirection {
    id
    url
    outputs {
      id
      ...OutputStatusItem
    }
  }
`);

// Component
export interface OutputStatusTableProps {
  readonly redirection$: StoredResource<FragmentType<typeof RedirectionWithOutputs> | null>;
}

export default function OutputStatusTable(props: OutputStatusTableProps) {
  const redirection = unmask(RedirectionWithOutputs, useStore$(props.redirection$));

  const app = useApp();
  useInput(useCallback((input) => {
    if (input === 'q') {
      app.exit();
    }
  }, [app]));

  if (!redirection) {
    return <Text>Redirection not found</Text>;
  }

  return (
    <>
      <Text>{ redirection.url }</Text>
      <Table>
        { redirection.outputs.map((output) => (
          <OutputStatus key={output.id} output={output} />
        ))}
      </Table>
      <ClientHelp>Press &apos;q&apos; to quit.</ClientHelp>
    </>
  );
}