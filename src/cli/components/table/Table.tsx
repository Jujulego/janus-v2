import { Box } from 'ink';
import { Children, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { TableContext, type TableContextProps } from './Table.context.js';

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
      }

      const result: number[][] = [];

      for (let r = 0; r < Math.max(old.length, row + 1); ++r) {
        const oldLine = old[r] ?? [];

        if (r !== row) {
          result.push(oldLine);
        } else {
          const line: number[] = [];
          result.push(line);

          for (let c = 0; c < Math.max(oldLine.length, col + 1); ++c) {
            line.push(c === col ? width : oldLine[c] ?? 0);
          }
        }
      }

      return result;
    });
  }, []);

  const count = Children.count(children);

  useEffect(() => {
    setMatrix((old) => old.slice(0, count));
  }, [count]);

  // Render
  const context = useMemo<TableContextProps>(() => ({ matrix, setWidth }), [matrix, setWidth]);

  return (
    <TableContext.Provider value={context}>
      <Box flexDirection="column">
        { Children.map(children, (child, row) => (
          <TableRowContext.Provider value={row}>
            { child }
          </TableRowContext.Provider>
        )) }
      </Box>
    </TableContext.Provider>
  );
}