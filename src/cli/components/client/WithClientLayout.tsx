import { type ReactNode, Suspense } from 'react';

import type { JanusClient } from '../../../client/janus-client.js';
import Loader from '../atoms/Loader.jsx';
import DynamicClientStatus from './DynamicClientStatus.jsx';

// Component
export interface WithClientLayoutProps {
  readonly client: JanusClient;
  readonly children: ReactNode;
}

export default function WithClientLayout({ client, children }: WithClientLayoutProps) {
  // Render
  return (
    <Suspense fallback={<Loader>Connecting...</Loader>}>
      { children }
      <DynamicClientStatus client={client} />
    </Suspense>
  );
}