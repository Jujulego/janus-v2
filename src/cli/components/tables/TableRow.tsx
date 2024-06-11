import { Box } from 'ink';
import { Children, type ReactNode, useContext } from 'react';

import { TableCellContext } from './TableCell.context.js';
import { TableRowContext } from './TableRow.context.js';

// Component
export interface TableRowProps {
  readonly children: ReactNode;
}

export default function TableRow({ children }: TableRowProps) {
  const { matrix = [], row, setWidth } = useContext(TableRowContext);

  return (
    <Box flexWrap="nowrap">
      { Children.map(children, (child, col) => (
        <TableCellContext.Provider
          value={{
            width: matrix.reduce((width, row) => Math.max(row[col] ?? 0, width), 0),
            row, col, setWidth
          }}
        >
          { child }
        </TableCellContext.Provider>
      )) }
    </Box>
  );
}