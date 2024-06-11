import { Box, type DOMElement, measureElement } from 'ink';
import { type ReactNode, useContext, useEffect, useRef, useState } from 'react';

import { TableCellContext } from './TableCell.context.js';

// Component
export interface TableCellProps {
  readonly children?: ReactNode;
}

export default function TableCell({ children }: TableCellProps) {
  const { width, row, col, setWidth } = useContext(TableCellContext);
  const [marginRight, setMarginRight] = useState(0);

  const cell = useRef<DOMElement>(null);

  useEffect(() => {
    if (cell.current) {
      const { width: boxWidth } = measureElement(cell.current);

      setWidth(boxWidth, row, col);
      setMarginRight(width - boxWidth);
    }
  }, [width, row, col, setWidth]);

  return (
    <Box ref={cell} flexDirection="column" marginRight={marginRight + 1}>
      { children }
    </Box>
  );
}