import { render } from 'ink';
import type { ReactNode } from 'react';

import StaticLogs from './components/StaticLogs.jsx';

// High Order Component
export type InkedStepper<P, R> = (props: P, controller: AbortController) => AsyncGenerator<ReactNode, R>;
export type InkedComponent<P, R> = (props: P) => Promise<R>;

export function inked<P, R>(stepper: InkedStepper<P, R>): InkedComponent<P, R> {
  return async (props: P): Promise<R> => {
    const controller = new AbortController();

    const app = render(<StaticLogs/>);
    app.waitUntilExit().then(() => {
      controller.abort();
    });

    try {
      const generator = stepper(props, controller);

      while (true) {
        const result = await generator.next();

        if (!result.done) {
          app.rerender(
            <>
              <StaticLogs/>
              { result.value }
            </>
          );
        } else {
          return result.value;
        }
      }
    } finally {
      app.clear();
      app.unmount();
    }
  }
}