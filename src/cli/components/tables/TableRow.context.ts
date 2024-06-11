import { createContext } from 'react';

// Context
export interface TableRowContextProps {
  readonly matrix: number[][];
  readonly row: number;

  readonly setWidth: (width: number, row: number, col: number) => void;
}

export const TableRowContext = createContext<TableRowContextProps>({
  matrix: [],
  row: 0,

  setWidth: () => {},
});