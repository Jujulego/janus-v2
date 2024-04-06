import { type ReactNode, Suspense } from 'react';

import type { JanusClient } from '../../../client/janus-client.js';
import ClientStatus from '../atoms/ClientStatus.jsx';
import DynamicClientStatus from '../atoms/DynamicClientStatus.jsx';
import StaticLogs from '../StaticLogs.jsx';

// Component
export interface WithClientLayoutProps {
  readonly client: JanusClient;
  readonly children: ReactNode;
}

export default function WithClientLayout({ client, children }: WithClientLayoutProps) {
  // Render
  return (
    <>
      <StaticLogs />
      <Suspense fallback={<ClientStatus status="connecting" />}>
        { children }
        <DynamicClientStatus client={client} />
      </Suspense>
    </>
  );
}