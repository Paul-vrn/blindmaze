import 'phaser';
import {GridView} from '../../entities/grid-view';
import {RandomizedKruskal} from '../../generators/randomized-kruskal';
import {RecursiveBacktracker} from '../../generators/recursive-backtracker';
import {Cell} from '../../models/cell';
import {Grid} from '../../models/grid';

export default class Maze01 extends Phaser.Scene {
  private gridView: any;
  private scheduler: any;
  private destroyedWallCount: any;
  private generators: any;
  private activeGeneratorIndex: any;
  private currentAlgoText: any;
  private lightPoint: any;
  private grid: Grid | undefined;
  private lightPointTarget: any;
  constructor() {
    super('Maze01');

  }

  create() {
    this.cameras.main.setBackgroundColor(0xcacaca);

    this.lightPoint = this.add.circle(0, 0, 5, 0xffd700); // Crée un point lumineux jaune
    this.lightPoint.setVisible(false); // Cache le point jusqu'à ce qu'il soit positionné
    this.physics.world.enable(this.lightPoint);
    this.lightPoint.setInteractive();
    
    this.lightPoint.on('pointerover', () => {
      this.input.on('pointermove', this._moveLightToPoint, this);
    });

    this.scheduler = new Phaser.Time.Clock(this);
    this.scheduler.start();

    this.destroyedWallCount = 0;

    const rows = 5;
    const cols = 8;

    this.grid = new Grid(rows, cols);
    //this.gridView = new GridView(this, this.grid, config.scale.width / 2, config.scale.height / 2);
    this.gridView = new GridView(this, this.grid, 250, 250);
    this.gridView.container.add(this.lightPoint);
    this.generators = [
      {
        name: 'Recursive Backtracer',
        generator: new RecursiveBacktracker(this, this.grid, this.gridView),
      },
      {
        name: 'Randomized Kruskal',
        generator: new RandomizedKruskal(this, this.grid, this.gridView),
      },
    ];
    this.activeGeneratorIndex = 0;

    this.add.text(25, 450, 'switch algo')
      .setInteractive()
      .on('pointerdown', () => {
        this.activeGeneratorIndex = Phaser.Math.Wrap(this.activeGeneratorIndex + 1, 0, this.generators.length);

        this._updateActiveGeneratorName();
      });
    this.currentAlgoText = this.add.text(25, 470, '');

    this.add.text(175, 450, 'generate')
      .setInteractive()
      .on('pointerdown', () => {
        this._reset();

        this._getActiveGenerator().generator.generate();
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

    this._updateActiveGeneratorName();

    this._placeLightInRandomCell();
    
    // COLLISION
    for (let key in this.gridView.wallViews) {
      if (this.gridView.wallViews.hasOwnProperty(key)) {
          this.physics.add.collider(this.lightPoint, this.gridView.wallViews[key], () => {
            console.log('collide');
          });
      }
  }
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
  }
  _reset() {
    this.destroyedWallCount = 0;
    this.scheduler.removeAllEvents();

    const generator = this._getActiveGenerator().generator;

    generator.reset();
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
          this.gridView.destroyWall(cell1.walls.left);
        });
      } else { // right
        this.scheduler.delayedCall(TIME_STEP * this.destroyedWallCount, () => {
          this.gridView.destroyWall(cell1.walls.right);
        });
      }
    } else {
      if (cell2.row < cell1.row) { // above
        this.scheduler.delayedCall(TIME_STEP * this.destroyedWallCount, () => {
          this.gridView.destroyWall(cell1.walls.above);
        });
      } else { // below
        this.scheduler.delayedCall(TIME_STEP * this.destroyedWallCount, () => {
          this.gridView.destroyWall(cell1.walls.below);
        });
      }
    }

    this.destroyedWallCount += 1;
  }

  _getActiveGenerator() {
    return this.generators[this.activeGeneratorIndex];
  }

  _updateActiveGeneratorName() {
    this.currentAlgoText.text = `algo: ${this._getActiveGenerator().name}`;
  }


  _moveLightToPoint(pointer: any) {
    let targetX = Phaser.Math.Clamp(pointer.x, this.gridView.startX, this.gridView.startX + this.gridView.gridWidth) - 90;
    let targetY = Phaser.Math.Clamp(pointer.y, this.gridView.startY, this.gridView.startY + this.gridView.gridHeight) - 150;
    
    let dx = targetX - this.lightPoint.x;
    let dy = targetY - this.lightPoint.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    let speed = distance / 1;  // Par exemple, atteindre la destination en 1 seconde
    this.lightPointTarget = { x: targetX, y: targetY };  // Stockez la cible

    this.physics.moveTo(this.lightPoint, targetX, targetY, speed);
    

    /*    this.lightPoint.tweens = this.tweens.add({
        targets: this.lightPoint,
        x: targetX,
        y: targetY,
        duration: 1000,
        ease: 'Sine.easeOut',
    });*/
  }
}