import { render, cleanup } from 'ink-testing-library';
import symbols from 'log-symbols';
import { afterEach, describe, expect, it } from 'vitest';

import ClientStatus from '@/src/cli/components/atoms/ClientStatus.js';

// Setup
afterEach(() => {
  cleanup();
});

// Tests
describe('ClientStatus', () => {
  it('should render connected status', () => {
    const { lastFrame } = render(<ClientStatus status="connected" />);

    expect(lastFrame()).toBe(`${symbols.success} Connected`);
  });

  it('should render connecting status', () => {
    const { lastFrame } = render(<ClientStatus status="connecting" />);

    expect(lastFrame()).toBe('⠋ Connecting ...');
  });

  it('should render disconnected status', () => {
    const { lastFrame } = render(<ClientStatus status="disconnected" />);

    expect(lastFrame()).toBe(`${symbols.error} Disconnected`);
  });
});