import { render, cleanup } from 'ink-testing-library';
import { type Var, var$ } from 'kyrielle';
import symbols from 'log-symbols';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DynamicClientStatus from '@/src/cli/components/atoms/DynamicClientStatus.js';
import { JanusClient, type JanusClientStatus } from '@/src/client/janus-client.js';

// Setup
let client: JanusClient;
let status$: Var<JanusClientStatus>;

beforeEach(() => {
  client = new JanusClient();

  status$ = var$<JanusClientStatus>('connected');
  vi.spyOn(client, 'status$', 'get').mockReturnValue(status$);

  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// Tests
describe('ClientStatus', () => {
  it('should render connected status and disappear after 2 seconds', async () => {
    const { lastFrame } = render(<DynamicClientStatus client={client} />);
    expect(lastFrame()).toBe(`${symbols.success} Connected`);

    await vi.advanceTimersByTimeAsync(2000);
    expect(lastFrame()).toBe('');
  });

  it('should render connecting status and stay after 2 seconds', async () => {
    status$.mutate('connecting');

    const { lastFrame } = render(<DynamicClientStatus client={client} />);
    expect(lastFrame()).toBe('⠋ Connecting ...');

    await vi.advanceTimersByTimeAsync(2000);
    expect(lastFrame()).toBe('⠴ Connecting ...');
  });

  it('should render disconnected status and stay after 2 seconds', async () => {
    status$.mutate('disconnected');

    const { lastFrame } = render(<DynamicClientStatus client={client} />);
    expect(lastFrame()).toBe(`${symbols.error} Disconnected`);

    await vi.advanceTimersByTimeAsync(2000);
    expect(lastFrame()).toBe(`${symbols.error} Disconnected`);
  });
});