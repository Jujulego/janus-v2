import { Text } from 'ink';
import symbols from 'log-symbols';

import type { JanusClientStatus } from '../../../client/janus-client.js';
import Loader from '../atoms/Loader.jsx';

// Component
export interface ClientStatusProps {
  readonly status: JanusClientStatus;
}

export default function ClientStatus({ status }: ClientStatusProps) {
  switch (status) {
    case 'connected':
      return (
        <Text>
          <Text color="green">{ symbols.success }</Text>
          {' '}Connected
        </Text>
      );

    case 'connecting':
      return (
        <Loader>Connecting ...</Loader>
      );

    case 'disconnected':
      return (
        <Text>
          <Text color="red">{ symbols.error }</Text>
          {' '}Disconnected
        </Text>
      );
  }
}