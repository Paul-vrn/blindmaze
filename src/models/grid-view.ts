import 'phaser';
import { Cell } from './cell';
import { Wall } from './wall';

const CELL_SIZE = 40;
const WALL_THICKNESS = 5;

export interface ICoordinates {
  x: number;
  y: number;
}

interface IWallCoordinates extends ICoordinates {
  width: number;
  height: number;
}

export class GridView {
  scene: any;
  grid: any;
  gridX: number;
  gridY: number;
  container!: Phaser.GameObjects.Container;
  gridWidth!: number;
  gridHeight!: number;
  startX!: number;
  startY!: number;
  cellViews!: Record<string, any>;
  wallViews!: Record<string, any>;
  outlineViews!: any[];

  constructor(scene: any, grid: any, x: number, y: number) {
    this.scene = scene;
    this.grid = grid;
    this.gridX = x;
    this.gridY = y;
    this.refresh();
  }

  refresh(): void {
    if (this.container) {
      this.container.each((child: any) => child.destroy());
      this.container.destroy();
    }

    this.gridWidth =
      this.grid.cols * CELL_SIZE /*+ ((this.grid.cols + 1) * WALL_THICKNESS)*/;
    this.gridHeight =
      this.grid.rows * CELL_SIZE /*+ ((this.grid.rows + 1) * WALL_THICKNESS)*/;
    this.startX = this.gridX - this.gridWidth / 2;
    this.startY = this.gridY - this.gridHeight / 2;
    this.cellViews = this._buildCellViews(); // key: `${row}${col}`
    this.wallViews = this._buildWallViews(); // key: `${cell1.row}${cell1.col},${cell2.row}${cell2.col}`
    this.outlineViews = this._buildOutlineViews(); // []

    this.container = this.scene.add.container(this.startX, this.startY, [
      ...Object.values(this.cellViews),
      ...Object.values(this.wallViews),
      ...this.outlineViews,
    ]);
  }

  reset(): void {
    Object.values(this.wallViews).forEach((wallView) => {
      wallView.alpha = 1;
      wallView.body.enable = true;
    });
    this.scene.tweens.killAll();
  }

  destroyWall(wall: Wall): void {
    const wallView =
      this.wallViews[
        `${wall.cell1.row}${wall.cell1.col},${wall.cell2.row}${wall.cell2.col}`
      ];
    this.scene.tweens.add({
      targets: wallView,
      props: {
        alpha: 0,
      },
      duration: 200,
      onComplete: () => {
        // Deactivate the physical body of the wall
        wallView.body.enable = false;
      },
    });
  }

  public _buildCellViews(): Record<string, any> {
    const cellViews: { [key: string]: Phaser.GameObjects.Rectangle } = {};

    this.grid.forEachCell((cell: Cell) => {
      const { x, y } = this._getCellCoordinates(cell);

      const cellView = this.scene.add.rectangle(
        x,
        y,
        CELL_SIZE,
        CELL_SIZE,
        0xffffff
      );
      cellViews[`${cell.row}${cell.col}`] = cellView;
    });

    return cellViews;
  }

  public _buildWallViews(): Record<string, any> {
    const wallViews: { [key: string]: Phaser.GameObjects.Rectangle } = {};

    this.grid.forEachWall((wall: any) => {
      const { x, y, width, height } = this._getWallCoordinates(wall);

      const wallView = this.scene.add.rectangle(x, y, width, height, 0x000000);
      this.scene.physics.world.enable(wallView); // Activez la physique pour le mur
      wallView.body.immovable = true; // Rendez le mur immobile lors des collisions

      wallViews[
        `${wall.cell1.row}${wall.cell1.col},${wall.cell2.row}${wall.cell2.col}`
      ] = wallView;
    });
    return wallViews;
  }

  public _buildOutlineViews(): any[] {
    const outlineViews = [
      this.scene.add.rectangle(
        this.gridWidth / 2,
        0,
        this.gridWidth + WALL_THICKNESS,
        WALL_THICKNESS,
        0x000000
      ), // top
      this.scene.add.rectangle(
        this.gridWidth / 2,
        this.gridHeight,
        this.gridWidth + WALL_THICKNESS,
        WALL_THICKNESS,
        0x000000
      ), // bottom
      this.scene.add.rectangle(
        0,
        this.gridHeight / 2,
        WALL_THICKNESS,
        this.gridHeight + WALL_THICKNESS,
        0x000000
      ), // left
      this.scene.add.rectangle(
        this.gridWidth,
        this.gridHeight / 2,
        WALL_THICKNESS,
        this.gridHeight + WALL_THICKNESS,
        0x000000
      ), // right
    ];
    outlineViews.forEach((outlineView) => {
      this.scene.physics.world.enable(outlineView);
      outlineView.body.immovable = true;
    });

    return outlineViews;
  }

  public _getCellCoordinates(cell: Cell): ICoordinates {
    return {
      x:
        cell.col * CELL_SIZE +
        /*((cell.col + 1) * WALL_THICKNESS)*/ +CELL_SIZE / 2,
      y:
        cell.row * CELL_SIZE +
        /*((cell.row + 1) * WALL_THICKNESS)*/ +CELL_SIZE / 2,
    };
  }

  public _getWallCoordinates(wall: Wall): IWallCoordinates {
    const cell1Coordinates = this._getCellCoordinates(wall.cell1);
    const cell2Coordinates = this._getCellCoordinates(wall.cell2);

    if (cell1Coordinates.x != cell2Coordinates.x) {
      // different columns
      const x = (cell1Coordinates.x + cell2Coordinates.x) / 2;
      const y = cell1Coordinates.y;
      const width = WALL_THICKNESS;
      const height = CELL_SIZE;

      return { x, y, width, height };
    } else {
      // different rows
      const x = cell1Coordinates.x;
      const y = (cell1Coordinates.y + cell2Coordinates.y) / 2;
      const width = CELL_SIZE;
      const height = WALL_THICKNESS;

      return { x, y, width, height };
    }
  }
}
