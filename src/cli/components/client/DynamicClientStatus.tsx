import { startTransition, useLayoutEffect, useState } from 'react';

import type { JanusClient } from '../../../client/janus-client.js';
import { useStore$ } from '../../../utils/store.js';
import ClientStatus from './ClientStatus.jsx';

// Component
export interface DynamicClientStatusProps {
  readonly client: JanusClient;
}

export default function DynamicClientStatus({ client }: DynamicClientStatusProps) {
  const status = useStore$(client.status$);

  const [showStatus, setShowStatus] = useState(false);
  useLayoutEffect(() => {
    setShowStatus(true);

    if (status === 'connected') {
      const timeout = setTimeout(() => startTransition(() => {
        setShowStatus(false);
      }), 2000);
      return () => clearTimeout(timeout);
    }
  }, [status]);

  // Render
  if (showStatus) {
    return <ClientStatus status={status} />;
  }
}