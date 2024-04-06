import { Text } from 'ink';
import Spinner from 'ink-spinner';
import symbols from 'log-symbols';
import type { JanusClientStatus } from '../../../client/janus-client.js';

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
        <Text>
          <Spinner type="dots" />
          {' '}Connecting ...
        </Text>
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