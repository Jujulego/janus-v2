import { useContext, useMemo } from 'react';

import { TableContext } from './Table.context.js';
import { TableColumnContext } from './TableColumn.context.js';
import { TableRowContext } from './TableRow.context.js';

export function useTableCell() {
  const { matrix, setWidth } = useContext(TableContext);
  const row = useContext(TableRowContext);
  const col = useContext(TableColumnContext);

  return useMemo(() => ({
    width: matrix.reduce((width, row) => Math.max(row[col] ?? 0, width), 0),
    row, col, setWidth
  }), [matrix, row, col, setWidth]);
}