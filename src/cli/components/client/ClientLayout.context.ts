import { createContext, type ReactNode } from 'react';

// Context
export interface ClientLayoutContextProps {
  readonly help?: ReactNode;
  readonly setHelp: (help?: ReactNode) => void;
}

export const ClientLayoutContext = createContext<ClientLayoutContextProps>({
  setHelp: () => {},
});