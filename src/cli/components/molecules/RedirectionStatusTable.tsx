import { Box } from 'ink';
import { FragmentType, unmask } from '../../../gql/index.js';

import RedirectionStatus, { RedirectionStatusItem } from '../atoms/RedirectionStatus.jsx';

// Component
export interface RedirectionStatusTableProps {
  readonly redirections: FragmentType<typeof RedirectionStatusItem>[];
}

export default function RedirectionStatusTable({ redirections }: RedirectionStatusTableProps) {
  return (
    <Box flexDirection={'column'}>
      { redirections.map((redirection) => (
        <Box justifyContent="space-between" key={unmask(RedirectionStatusItem, redirection).id}>
          <RedirectionStatus redirection={redirection} />
        </Box>
      )) }
    </Box>
  );
}
