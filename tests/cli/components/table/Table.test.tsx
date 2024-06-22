import { Text } from 'ink';
import { render, cleanup } from 'ink-testing-library';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Table from '@/src/cli/components/table/Table.jsx';
import TableCell from '@/src/cli/components/table/TableCell.js';
import TableRow from '@/src/cli/components/table/TableRow.js';

// Setup
afterEach(() => {
  cleanup();
});

// Tests
describe('Table', () => {
  it('should render values aligned by columns', async () => {
    const { lastFrame, rerender } = render(
      <Table>
        <TableRow>
          <TableCell>
            <Text>Column A</Text>
          </TableCell>
          <TableCell>
            <Text>Column B</Text>
          </TableCell>
          <TableCell>
            <Text>Column C</Text>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Text>A long value</Text>
          </TableCell>
          <TableCell>
            <Text>42</Text>
          </TableCell>
          <TableCell>
            <Text>Toto</Text>
          </TableCell>
        </TableRow>
      </Table>
    );

    await vi.waitFor(() => expect(lastFrame()).toBe(
      'Column A     Column B Column C\n' +
      'A long value 42       Toto'
    ));

    // Shrink & grow columns
    rerender(
      <Table>
        <TableRow>
          <TableCell>
            <Text>Column A</Text>
          </TableCell>
          <TableCell>
            <Text>Column B</Text>
          </TableCell>
          <TableCell>
            <Text>Column C</Text>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>
            <Text>42</Text>
          </TableCell>
          <TableCell>
            <Text>A long value</Text>
          </TableCell>
          <TableCell>
            <Text>Toto</Text>
          </TableCell>
        </TableRow>
      </Table>
    );

    await vi.waitFor(() => expect(lastFrame()).toBe(
      'Column A Column B     Column C\n' +
      '42       A long value Toto'
    ));
  });
});