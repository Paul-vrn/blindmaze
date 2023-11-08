import { Wall } from './wall';

export class Cell {
  row: number;
  col: number;
  visited?: boolean;
  walls: {
    above?: Wall;
    below?: Wall;
    left?: Wall;
    right?: Wall;
  } = {};

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }
}
