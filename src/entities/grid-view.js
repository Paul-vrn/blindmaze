import 'phaser';

const CELL_SIZE = 40;
const WALL_THICKNESS = 1;

export class GridView {
  constructor(scene, grid, x, y) {
    this.scene = scene;
    this.grid = grid;

    this.gridX = x;
    this.gridY = y;

    this.refresh();
  }

  refresh() {
    if (this.container) {
      this.container.each(child => child.destroy());
      this.container.destroy();
    }

    this.gridWidth = (this.grid.cols * CELL_SIZE) /*+ ((this.grid.cols + 1) * WALL_THICKNESS)*/;
    this.gridHeight = (this.grid.rows * CELL_SIZE) /*+ ((this.grid.rows + 1) * WALL_THICKNESS)*/;
    const centerX = this.gridX - this.gridWidth / 2;
    const centerY = this.gridY - this.gridHeight / 2;
    this.startX = centerX;
    this.startY = centerY;
    console.log(centerX, centerY);
    this.cellViews = this._buildCellViews(); // key: `${row}${col}`
    this.wallViews = this._buildWallViews(); // key: `${cell1.row}${cell1.col},${cell2.row}${cell2.col}`
    this.outlineViews = this._buildOutlineViews(); // []

    this.container = this.scene.add.container(centerX, centerY, [...Object.values(this.cellViews), ...Object.values(this.wallViews), ...this.outlineViews]);
  }

  reset() {
    Object.values(this.wallViews).forEach(wallView => wallView.alpha = 1);
    this.scene.tweens.killAll();
  }

  destroyWall(wall) {
    const wallView = this.wallViews[`${wall.cell1.row}${wall.cell1.col},${wall.cell2.row}${wall.cell2.col}`];
    this.scene.tweens.add({
      targets: wallView,
      props: {
        alpha: 0,
      },
      duration: 200,
      onComplete: () => {
        wallView.body.enable = false; // Désactivez le corps physique du mur
    }
    });
  }

  _buildCellViews() {
    const cellViews = {};

    this.grid.forEachCell(cell => {
      const { x, y } = this._getCellCoordinates(cell);

      const cellView = this.scene.add.rectangle(x, y, CELL_SIZE, CELL_SIZE, 0xFFFFFF);
      cellViews[`${cell.row}${cell.col}`] = cellView;
    });

    return cellViews;
  }

  _buildWallViews() {
    const wallViews = {};

    this.grid.forEachWall(wall => {
      const { x, y, width, height } = this._getWallCoordinates(wall);

      const wallView = this.scene.add.rectangle(x, y, width, height, 0x000000);
      this.scene.physics.world.enable(wallView);  // Activez la physique pour le mur
      wallView.body.immovable = true; // Rendez le mur immobile lors des collisions
      
      wallViews[`${wall.cell1.row}${wall.cell1.col},${wall.cell2.row}${wall.cell2.col}`] = wallView;
    });

    return wallViews;
  }

  _buildOutlineViews() {
    const outlineViews = [
      this.scene.add.rectangle(this.gridWidth / 2, 0, this.gridWidth, WALL_THICKNESS, 0x000000), // top
      this.scene.add.rectangle(this.gridWidth / 2, this.gridHeight, this.gridWidth, WALL_THICKNESS, 0x000000), // bottom
      this.scene.add.rectangle(0, this.gridHeight / 2, WALL_THICKNESS, this.gridHeight, 0x000000), // left
      this.scene.add.rectangle(this.gridWidth, this.gridHeight / 2, WALL_THICKNESS, this.gridHeight, 0x000000), // right
    ];

    return outlineViews;
  }

  _getCellCoordinates(cell) {
    return {
      x: (cell.col * CELL_SIZE) + /*((cell.col + 1) * WALL_THICKNESS)*/ + CELL_SIZE / 2,
      y: (cell.row * CELL_SIZE) + /*((cell.row + 1) * WALL_THICKNESS)*/ + CELL_SIZE / 2,
    }
  }

  _getWallCoordinates(wall) {
    const cell1Coordinates = this._getCellCoordinates(wall.cell1);
    const cell2Coordinates = this._getCellCoordinates(wall.cell2);

    if (cell1Coordinates.x != cell2Coordinates.x) { // different columns
      const x = (cell1Coordinates.x + cell2Coordinates.x) / 2;
      const y = cell1Coordinates.y;
      const width = WALL_THICKNESS;
      const height = CELL_SIZE;

      return { x, y, width, height };
    } else { // different rows
      const x = cell1Coordinates.x;
      const y = (cell1Coordinates.y + cell2Coordinates.y) / 2;
      const width = CELL_SIZE;
      const height = WALL_THICKNESS;

      return { x, y, width, height };
    }
  }
}