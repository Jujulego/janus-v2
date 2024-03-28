import { Box } from 'ink';

import { FragmentType, unmask } from '../../../gql/index.js';
import { type StoredResource, useStore$ } from '../../../utils/store.js';
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
