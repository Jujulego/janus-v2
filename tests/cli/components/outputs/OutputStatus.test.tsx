import chalk from 'chalk';
import { cleanup, render } from 'ink-testing-library';
import isUnicodeSupported from 'is-unicode-supported';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import OutputStatus, { OutputStatusItem } from '@/src/cli/components/outputs/OutputStatus.jsx';
import { makeFragmentData } from '@/src/gql/index.js';

// Mocks
vi.mock('is-unicode-supported');

// Setup
beforeEach(() => {
  vi.mocked(isUnicodeSupported).mockResolvedValue(true);
});

afterEach(() => {
  cleanup();
});

// Tests
describe('OutputStatus', () => {
  it('should render enabled output', () => {
    const output = makeFragmentData({
      id: 'output-1',
      name: 'Output 1',
      target: 'https://example.com',
      enabled: true,
    }, OutputStatusItem);

    const { lastFrame } = render(<OutputStatus output={output} />);

    expect(lastFrame()).toBe(`${chalk.green('✔')}  Output 1 -> https://example.com`);
  });

  it('should render disabled redirection', () => {
    const output = makeFragmentData({
      id: 'output-1',
      name: 'Output 1',
      target: 'https://example.com',
      enabled: false,
    }, OutputStatusItem);

    const { lastFrame } = render(<OutputStatus output={output} />);

    expect(lastFrame()).toBe(`   ${chalk.grey('Output 1')} ${chalk.grey('->')} ${chalk.grey('https://example.com')}`);
  });
});
