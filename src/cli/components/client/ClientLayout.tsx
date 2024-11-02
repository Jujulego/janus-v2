import { Box, Text } from 'ink';
import { type ReactNode, Suspense, useMemo, useState } from 'react';

import type { JanusClient } from '../../../client/janus-client.js';
import Loader from '../atoms/Loader.jsx';
import { ClientLayoutContext } from './ClientLayout.context.js';
import DynamicClientStatus from './DynamicClientStatus.jsx';

// Component
export interface WithClientLayoutProps {
  readonly client: JanusClient;
  readonly children: ReactNode;
}

export default function ClientLayout({ client, children }: WithClientLayoutProps) {
  // State
  const [help, setHelp] = useState<ReactNode>();

  // Render
  const context = useMemo(() => ({ help, setHelp }), [help, setHelp]);

  return (
    <Suspense fallback={<Loader>Connecting...</Loader>}>
      <ClientLayoutContext.Provider value={context}>
        { children }
      </ClientLayoutContext.Provider>

      <Box gap={1}>
        <DynamicClientStatus client={client} />
        { help && (
          <Text color="grey">--{' '}{ help }</Text>
        ) }
      </Box>
    </Suspense>
  );
}