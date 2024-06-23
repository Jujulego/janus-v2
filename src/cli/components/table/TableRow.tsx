import { Box } from 'ink';
import { Children, type ReactNode } from 'react';

import { TableColumnContext } from './TableColumn.context.js';

// Component
export interface TableRowProps {
  readonly children: ReactNode;
}

export default function TableRow({ children }: TableRowProps) {
  return (
    <Box flexWrap="nowrap">
      { Children.map(children, (child, col) => (
        <TableColumnContext.Provider value={col}>
          { child }
        </TableColumnContext.Provider>
      )) }
    </Box>
  );
}