export class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;

    this.walls = {
      above: null,
      below: null,
      left: null,
      right: null,
    };
  }
}