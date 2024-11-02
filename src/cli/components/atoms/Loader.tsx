import { Text } from 'ink';
import Spinner from 'ink-spinner';
import type { ReactNode } from 'react';

// Component
export interface LoaderProps {
  readonly children?: ReactNode;
}

export default function Loader({ children }: LoaderProps) {
  return (
    <Text>
      <Spinner type="dots" />
      {' '}{ children }
    </Text>
  );
}