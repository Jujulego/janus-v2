import { createContext } from 'react';

// Context
export interface TableContextProps {
  readonly matrix: number[][];
  readonly setWidth: (width: number, row: number, col: number) => void;
}

export const TableContext = createContext<TableContextProps>({
  matrix: [],
  setWidth: () => {},
});