import { useApp } from 'ink';
import type { StoredResource } from 'kyrielle';
import { useEffect } from 'react';

import type { HealthPayload } from '../../../client/health.ref.js';

// Component
export interface HealthSpinnerProps {
  readonly health$: StoredResource<HealthPayload>;
}

export default function HealthSpinner(props: HealthSpinnerProps) {
  const app = useApp();

  useEffect(() => {
    const unsub = props.health$.subscribe(() => {
      app.exit();
    });

    return () => unsub.unsubscribe();
  }, [props.health$, app]);
}