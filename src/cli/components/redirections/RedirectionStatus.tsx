import { Text } from 'ink';
import { useMemo } from 'react';

import { FragmentType, graphql, unmask } from '../../../gql/index.js';
import TableCell from '../table/TableCell.jsx';
import TableRow from '../table/TableRow.jsx';

// Fragment
export const RedirectionStatusItem = graphql(/* GraphQL */ `
    fragment RedirectionStatusItem on Redirection {
        id
        url
        outputs {
            id
            name
            target
            enabled
        }
    }
`);

// Component
export interface RedirectionStatusProps {
  readonly redirection: FragmentType<typeof RedirectionStatusItem>;
}

export default function RedirectionStatus(props: RedirectionStatusProps) {
  const redirection = unmask(RedirectionStatusItem, props.redirection);
  const enabledOutput = useMemo(() => redirection.outputs.find((out) => out.enabled), [redirection]);

  if (enabledOutput) {
    return (
      <TableRow>
        <TableCell>
          <Text>{ redirection.url }</Text>
        </TableCell>
        <TableCell>
          <Text>{ '->' }</Text>
        </TableCell>
        <TableCell>
          <Text>{ enabledOutput.name } ({ enabledOutput.target })</Text>
        </TableCell>
      </TableRow>
    );
  } else {
    return (
      <TableRow>
        <TableCell>
          <Text color="grey">{ redirection.url }</Text>
        </TableCell>
        <TableCell>
          <Text color="grey">{ '--' }</Text>
        </TableCell>
        <TableCell>
          <Text color="grey" italic>all outputs are disabled</Text>
        </TableCell>
      </TableRow>
    );
  }
}
