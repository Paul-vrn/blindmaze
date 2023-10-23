import 'phaser';

export class RandomizedKruskal {
  constructor(scene, grid, gridView) {
    this.scene = scene;
    this.grid = grid;
    this.gridView = gridView;

    this.reset();
  }

  reset() {
    this.walls = Phaser.Math.RND.shuffle([...this.grid.walls]);
    this.cellSets = [];
    this.grid.forEachCell(cell => {
      this.cellSets.push(new Set([cell]));
    });
  }

  generate() {
    this.walls.forEach(wall => {
      const cell1Set = this._findCellSet(wall.cell1);
      const cell2Set = this._findCellSet(wall.cell2);

      if (cell1Set != cell2Set) {
        this.scene.scheduleNextWallRemoval(wall.cell1, wall.cell2);

        const newCellSet = this._combineCellSets(cell1Set, cell2Set);
        this.cellSets.push(newCellSet);

        // remove old cell sets
        const cell1SetIndex = this.cellSets.findIndex(cellSet => cellSet == cell1Set);
        this.cellSets.splice(cell1SetIndex, 1);

        const cell2SetIndex = this.cellSets.findIndex(cellSet => cellSet == cell2Set);
        this.cellSets.splice(cell2SetIndex, 1);
      }
    });
  }

  _findCellSet(cell) {
    return this.cellSets.find(cellSet => {
      return cellSet.has(cell);
    });
  }

  _combineCellSets(set1, set2) {
    var _union = new Set(set1);
    for (var elem of set2) {
        _union.add(elem);
    }
    return _union;
  }
}