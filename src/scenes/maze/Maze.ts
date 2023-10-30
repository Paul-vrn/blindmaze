import 'phaser';
import config from '../../config';
import {GridView} from '../../entities/grid-view';
import {RecursiveBacktracker} from '../../generators/recursive-backtracker';
import {Cell} from '../../models/cell';
import {Grid} from '../../models/grid';
import calculateSpeed from '../../utils/calculateSpeed';
import {createTimer} from '../../utils/timer';

export default class Maze extends Phaser.Scene {
  private rows: number;
  private cols: number;
  private gridView!: GridView;
  private scheduler!: any;
  private destroyedWallCount!: number;
  private lightPoint!: Phaser.GameObjects.Arc;
  private points!: Phaser.GameObjects.Arc[];
  private grid!: Grid;
  private lightPointTarget!: { x: number; y: number; } | null;
  private graphics!: Phaser.GameObjects.Graphics;
  private generator!: RecursiveBacktracker
  timerText!: Phaser.GameObjects.Text;
  elapsedTime = 0;
  constructor(name: string, rows = 5, cols = 8) {
    super(name);
    this.rows = rows;
    this.cols = cols;
  }

  create() {

    createTimer(this)

    this.cameras.main.setBackgroundColor(0xcacaca);
    this.lightPoint = this.add.circle(0, 0, 5, 0xffd700); // Crée un point lumineux jaune
    this.lightPoint.setVisible(false); // Cache le point jusqu'à ce qu'il soit positionné
    this.physics.world.enable(this.lightPoint);
    this.lightPoint.setInteractive();
    this.lightPoint.on('pointerover', () => {
      this.input.on('pointermove', this._moveLightToPoint, this);
      this.gridView.container.setMask(mask);
      this.lightPoint.setMask(mask);
    });
    this.scheduler = new Phaser.Time.Clock(this);
    this.scheduler.start();

    this.destroyedWallCount = 0;

    this.grid = new Grid(this.rows, this.cols);
    this.gridView = new GridView(this, this.grid, config.scale.width / 2, config.scale.height / 2);
    this.generator = new RecursiveBacktracker(this, this.grid, this.gridView);
    //this.gridView = new GridView(this, this.grid, 250, 250);
    this.gridView.container.add(this.lightPoint);

    this.add.text(175, 450, 'generate')
      .setInteractive()
      .on('pointerdown', () => {
        this._reset();
        this.generator.generate();
      });

    this.add.text(300, 450, 'reset')
      .setInteractive()
      .on('pointerdown', () => {
        this._reset();
      });

    this.add.text(380, 450, 'randomize')
      .setInteractive()
      .on('pointerdown', () => {
        const rows = Phaser.Math.RND.between(2, 10);
        const cols = Phaser.Math.RND.between(2, 10);
        this.grid?.setSize(rows, cols);
        this.gridView.refresh();
      });

    this._placeLightInRandomCell();

    this.graphics = this.make.graphics({ lineStyle: { color: 0x0000FF, width: 0.5 } });
    let mask = new Phaser.Display.Masks.GeometryMask(this, this.graphics);
    
    // COLLISION
    for (let key in this.gridView.wallViews) {
      if (this.gridView.wallViews.hasOwnProperty(key)) {
          this.physics.add.collider(this.lightPoint, this.gridView.wallViews[key]);
      }
    }
    this.gridView.outlineViews.forEach((outlineView: any) => {
      this.physics.add.collider(this.lightPoint, outlineView);
    });

    // END OF CREATE
  }

  update(time: number, delta: number): void {

    if (this.lightPointTarget) {
      let dx = this.lightPointTarget.x - this.lightPoint.x;
      let dy = this.lightPointTarget.y - this.lightPoint.y;
      let distanceToTarget = Math.sqrt(dx * dx + dy * dy);

      if (distanceToTarget < 5) {  // Par exemple, si moins de 5 pixels de la cible
        this.lightPoint.body.velocity.x = 0;
        this.lightPoint.body.velocity.y = 0;
              this.lightPointTarget = null;  // Réinitialisez la cible
      }
    }
    this.graphics
    .clear()
    .fillStyle(0x000000)
    .fillCircle(this.lightPoint.x+ this.gridView.startX, this.lightPoint.y+ this.gridView.startY, 70);

  }

  _reset() {
    this.destroyedWallCount = 0;
    this.scheduler.removeAllEvents();


    this.generator.reset();
    this.gridView.reset();
  }

  _placeLightInRandomCell() {
    const randomRow = Phaser.Math.RND.between(0, this.gridView.grid.rows - 1);
    const randomCol = Phaser.Math.RND.between(0, this.gridView.grid.cols - 1);
    const randomCell = this.grid?.get(randomRow, randomCol);

    if (randomCell) {
      const position = this.gridView._getCellCoordinates(randomCell);
      this.lightPoint.setPosition(position.x, position.y);
      this.lightPoint.setVisible(true);
      console.log('randomCell', randomCell, position.x, position.y);
    } else {
      console.error('randomCell is undefined');
    }
  }


  scheduleNextWallRemoval(cell1: Cell, cell2: Cell) {
    const TIME_STEP = 50;

    if (cell1.row == cell2.row) {
      if (cell2.col < cell1.col) { // left
        this.scheduler.delayedCall(TIME_STEP * this.destroyedWallCount, () => {
          this.gridView.destroyWall(cell1.walls.left!);
        });
      } else { // right
        this.scheduler.delayedCall(TIME_STEP * this.destroyedWallCount, () => {
          this.gridView.destroyWall(cell1.walls.right!);
        });
      }
    } else {
      if (cell2.row < cell1.row) { // above
        this.scheduler.delayedCall(TIME_STEP * this.destroyedWallCount, () => {
          this.gridView.destroyWall(cell1.walls.above!);
        });
      } else { // below
        this.scheduler.delayedCall(TIME_STEP * this.destroyedWallCount, () => {
          this.gridView.destroyWall(cell1.walls.below!);
        });
      }
    }

    this.destroyedWallCount += 1;
  }

  _moveLightToPoint(pointer: Phaser.Input.InputPlugin) {
    let targetX = Phaser.Math.Clamp(pointer.x, this.gridView.startX, this.gridView.startX + this.gridView.gridWidth) - this.gridView.startX;
    let targetY = Phaser.Math.Clamp(pointer.y, this.gridView.startY, this.gridView.startY + this.gridView.gridHeight) - this.gridView.startY;
    let dx = pointer.x - this.gridView.startX - this.lightPoint.x;
    let dy = pointer.y - this.gridView.startY - this.lightPoint.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    //let speed = Math.log(distance+1) * 20;  // using log to slow down the speed when the light is far away

    //let speed = (distance < 200) ? distance/2 : 200/2 + Math.log(distance+1 *2) * 20;
    let speed = calculateSpeed(distance);
    this.lightPointTarget = { x: targetX, y: targetY };  // Stockez la cible

    this.physics.moveTo(this.lightPoint, targetX, targetY, speed);

  }
}