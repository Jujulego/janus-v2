import chalk from 'chalk';
import { cleanup, render } from 'ink-testing-library';
import { afterEach, describe, expect, it } from 'vitest';

import RedirectionStatus, { RedirectionStatusItem } from '@/src/cli/components/redirections/RedirectionStatus.js';
import { makeFragmentData } from '@/src/gql/index.js';

// Setup
afterEach(() => {
  cleanup();
});

// Tests
describe('RedirectionStatus', () => {
  it('should render enabled output', () => {
    const redirection = makeFragmentData({
      id: 'id',
      url: '/test',
      outputs: [
        {
          id: 'output-1',
          name: 'Output 1',
          target: 'https://example.com',
          enabled: true,
        }
      ],
    }, RedirectionStatusItem);

    const { lastFrame } = render(<RedirectionStatus redirection={redirection} />);

    expect(lastFrame()).toBe('/test -> Output 1 (https://example.com)');
  });

  it('should render disabled redirection', () => {
    const redirection = makeFragmentData({
      id: 'id',
      url: '/test',
      outputs: [
        {
          id: 'output-1',
          name: 'Output 1',
          target: 'https://example.com',
          enabled: false,
        }
      ],
    }, RedirectionStatusItem);

    const { lastFrame } = render(<RedirectionStatus redirection={redirection} />);

    expect(lastFrame()).toBe(chalk.grey(`/test -- ${chalk.italic('all outputs are disabled')}`));
  });
});
