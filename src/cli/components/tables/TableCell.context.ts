import { createContext } from 'react';

// Context
export interface TableCellContextProps {
  readonly width: number;
  readonly row: number;
  readonly col: number;

  readonly setWidth: (width: number, row: number, col: number) => void;
}

export const TableCellContext = createContext<TableCellContextProps>({
  width: 0,
  row: 0,
  col: 0,

  setWidth: () => {},
});