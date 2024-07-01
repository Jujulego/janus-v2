import { Text } from 'ink';
import symbols from 'log-symbols';

import { type FragmentType, graphql, unmask } from '../../../gql/index.js';
import TableCell from '../table/TableCell.jsx';
import TableRow from '../table/TableRow.jsx';

// Fragment
export const OutputStatusItem = graphql(/* GraphQL */ `
  fragment OutputStatusItem on RedirectionOutput {
    id
    name
    target
    enabled
  }
`);

// Component
export interface OutputStatusProps {
  readonly output: FragmentType<typeof OutputStatusItem>;
}

export default function OutputStatus(props: OutputStatusProps) {
  const output = unmask(OutputStatusItem, props.output);
  const color = output.enabled ? '' : 'grey';

  return (
    <TableRow>
      <TableCell>
        { output.enabled ? (
          <Text color="green">{ symbols.success }</Text>
        ) : (
          <Text>{'  '}</Text>
        ) }
      </TableCell>
      <TableCell>
        <Text color={color}>{ output.name }</Text>
      </TableCell>
      <TableCell>
        <Text color={color}>{ '->' }</Text>
      </TableCell>
      <TableCell>
        <Text color={color}>{ output.target }</Text>
      </TableCell>
    </TableRow>
  );
}