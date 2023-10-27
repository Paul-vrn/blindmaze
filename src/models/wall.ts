import {Cell} from './cell';

export class Wall {
  cell1: Cell;
  cell2: Cell;

  constructor(cell1: Cell, cell2: Cell) {
    this.cell1 = cell1;
    this.cell2 = cell2;
  }
}
