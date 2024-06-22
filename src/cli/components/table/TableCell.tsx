import { Box, type DOMElement, measureElement } from 'ink';
import { type ReactNode, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { TableCellContext } from './TableCell.context.js';

// Component
export interface TableCellProps {
  readonly children?: ReactNode;
}

export default function TableCell({ children }: TableCellProps) {
  const { width, row, col, setWidth } = useContext(TableCellContext);
  const [cellWidth, setCellWidth] = useState(0);

  const cell = useRef<DOMElement>(null);

  useLayoutEffect(() => {
    setWidth(cellWidth, row, col);
  }, [cellWidth, row, col, setWidth]);

  useEffect(() => {
    if (cell.current) {
      const { width } = measureElement(cell.current);
      setCellWidth(width);
    }
  });

  return (
    <Box ref={cell} flexDirection="column" marginRight={width - cellWidth + 1}>
      { children }
    </Box>
  );
}