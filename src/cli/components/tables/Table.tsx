import { Box } from 'ink';
import { Children, type ReactNode, useCallback, useState } from 'react';

import { TableRowContext } from './TableRow.context.js';

// Component
export interface TableProps {
  readonly children: ReactNode;
}

export default function Table({ children }: TableProps) {
  const [matrix, setMatrix] = useState<number[][]>([]);
  const setWidth = useCallback((width: number, row: number, col: number) => {
    setMatrix((old) => {
      if (old[row]?.[col] === width) {
        return old;
      } else {
        const result: number[][] = [];

        for (let r = 0; r < Math.max(old.length, row + 1); ++r) {
          if (r !== row) {
            result.push(old[r] ?? []);
          } else {
            const line: number[] = [];
            result.push(line);

            for (let c = 0; c < Math.max(old[r]?.length ?? 0, col + 1); ++c) {
              line.push(c === col ? width : old[r]?.[c] ?? 0);
            }
          }
        }

        return result;
      }
    });
  }, []);

  return (
    <Box flexDirection="column">
      { Children.map(children, (child, row) => (
        <TableRowContext.Provider value={{ matrix, row, setWidth }}>
          { child }
        </TableRowContext.Provider>
      )) }
    </Box>
  );
}