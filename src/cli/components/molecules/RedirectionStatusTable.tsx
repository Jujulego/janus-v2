import { Box } from 'ink';
import type { StoredResource } from 'kyrielle';

import { FragmentType, unmask } from '../../gql/index.js';
import { useStore$ } from '../../../utils/store.js';
import RedirectionStatus, { RedirectionStatusItem } from '../atoms/RedirectionStatus.jsx';

// Component
export interface RedirectionStatusTableProps {
  readonly redirections$: StoredResource<FragmentType<typeof RedirectionStatusItem>[]>;
}

export default function RedirectionStatusTable(props: RedirectionStatusTableProps) {
  const redirections = useStore$(props.redirections$);

  return (
    <Box flexDirection="column">
      { redirections.map((redirection) => (
        <Box key={unmask(RedirectionStatusItem, redirection).id}>
          <RedirectionStatus redirection={redirection} />
        </Box>
      )) }
    </Box>
  );
}
