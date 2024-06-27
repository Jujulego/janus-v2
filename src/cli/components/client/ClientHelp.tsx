import { type ReactNode, useContext, useEffect } from 'react';

import { ClientLayoutContext } from './ClientLayout.context.js';

// Component
export interface ClientHelpProps {
  readonly children: ReactNode;
}

export default function ClientHelp({ children }: ClientHelpProps) {
  const { setHelp } = useContext(ClientLayoutContext);

  useEffect(() => {
    setHelp(children);

    return () => setHelp();
  }, [setHelp, children]);

  return null;
}