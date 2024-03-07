import { Text } from 'ink';
import { useMemo } from 'react';

import { FragmentType, graphql, unmask } from '../../../gql/index.js';

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
      <>
        <Text>{ redirection.url }</Text>
        <Text>{'->'} { enabledOutput.name } ({ enabledOutput.target })</Text>
      </>
    );
  } else {
    return (
      <>
        <Text color="grey">{ redirection.url }</Text>
        <Text color="grey">{'|>'} <Text bold>all outputs are disabled</Text></Text>
      </>
    );
  }
}
