import 'phaser';
import config from '../../config';
import {GridView} from '../../entities/grid-view';
import {RecursiveBacktracker} from '../../generators/recursive-backtracker';
import {Cell} from '../../models/cell';
import {Grid} from '../../models/grid';
import calculateSpeed from '../../utils/calculateSpeed';
import {addScore, calculateScore} from '../../utils/store';
import {createTimer, formatTime, resetTimer, stopTimer} from '../../utils/timer';

export default class Maze extends Phaser.Scene {
  private mazeName: string;
  private enableDeadWalls: boolean;
  private enableEnemies: boolean;
  private rows: number;
  private cols: number;
  private gridView!: GridView;
  private scheduler!: any;
  private destroyedWallCount: number;
  private lightPoint!: Phaser.GameObjects.Arc;
  private startCell!: Cell;
  private points: Phaser.GameObjects.Arc[];
  private nbPoints: number;
  private currentNbPoints: number;
  private grid!: Grid;
  private lightPointTarget!: { x: number; y: number; } | null;
  private graphics!: Phaser.GameObjects.Graphics;
  private generator!: RecursiveBacktracker
  private mask!: Phaser.Display.Masks.GeometryMask;
  timerText!: Phaser.GameObjects.Text;
  elapsedTime: number = 0;
  private topText: Phaser.GameObjects.Text | null = null;
  constructor(name: string, rows = 5, cols = 8, nbPoints = 3, enableDeadWalls = false, enableEnemies = false) {
    super(name);
    this.mazeName = name;
    this.rows = rows;
    this.cols = cols;
    this.enableDeadWalls = enableDeadWalls;
    this.enableEnemies = enableEnemies;
    this.nbPoints = nbPoints;
    this.currentNbPoints = nbPoints;
    this.points = []
    this.destroyedWallCount = 0;
  }

  create() {
    this.currentNbPoints = this.nbPoints;
    this.cameras.main.setBackgroundColor(0xcacaca);
    
    this.scheduler = new Phaser.Time.Clock(this);
    this.scheduler.start();

    this.graphics = this.make.graphics({ lineStyle: { color: 0x0000FF, width: 0.5 } });
    this.mask = new Phaser.Display.Masks.GeometryMask(this, this.graphics);
    
    this.grid = new Grid(this.rows, this.cols);
    this.gridView = new GridView(this, this.grid, config.scale.width / 2, config.scale.height / 2);
    this.generator = new RecursiveBacktracker(this, this.grid, this.gridView);
    //this.gridView = new GridView(this, this.grid, 250, 250);

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
    
    this.createLightPoint();
    this.createPoints();

    // Placing light point and points
    this.startCell = this.placePointInRandomCell(this.lightPoint);
    this.points.forEach((point: Phaser.GameObjects.Arc) => this.placePointInRandomCell(point));

    
    // COLLISION
    for (let key in this.gridView.wallViews) {
      if (this.gridView.wallViews.hasOwnProperty(key)) {
          this.physics.add.collider(this.lightPoint, this.gridView.wallViews[key]);
      }
    }
    this.gridView.outlineViews.forEach((outlineView: any) => {
      this.physics.add.collider(this.lightPoint, outlineView);
    });

    this._reset();
    this.generator.generate();
    this.countDown();
    // END OF CREATE
  }

  countDown() {
    let countdown = 5;
    let countdownText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, String(countdown), {
      font: '412px Arial',
      color: '#000000'
    }).setOrigin(0.5, 0.5).setAlpha(0.3);
  
    if (this.enableDeadWalls) {
      this.createDeadWalls();
    }
    this.time.addEvent({
      delay: 1000,
      repeat: 5,
      callback: () => {
        countdown--;
        countdownText.setText(countdown.toString());
        if (countdown === 0) {
          countdownText.setText('Go !');
        } else if (countdown === -1) {
          countdownText.destroy();
        }
      },
      callbackScope: this
    });
  
    this.time.delayedCall(6000, () => {
      this.startGame();
    });
  }

  startGame() {
    this.input.on('pointermove', this.moveLightToPoint, this);
    this.gridView.container.setMask(this.mask);
    this.lightPoint.setMask(this.mask);
    this.points.forEach((point: Phaser.GameObjects.Arc) => point.setMask(this.mask));
    createTimer(this);
    this.time.addEvent({
      //delay: 20000, // 20 seconds
      delay: 20000,
      callback: this.showPointsBriefly,
      callbackScope: this,
      loop: true
    });
  }
  createLightPoint() {
    this.lightPoint = this.add.circle(0, 0, 5, 0xffd700); // Crée un point lumineux jaune
    this.lightPoint.setVisible(false); // Cache le point jusqu'à ce qu'il soit positionné
    this.physics.world.enable(this.lightPoint);
    this.lightPoint.setInteractive();
    this.gridView.container.add(this.lightPoint);

  }
  createPoints() {
    for(let i = 0; i < this.currentNbPoints; i++){
      const point = this.add.circle(0, 0, 5, 0x87F090);
      point.setVisible(true);
      this.physics.world.enable(point);
      point.setInteractive();
      this.gridView.container.add(point);
      // collide point and lightpoint
      this.physics.add.collider(this.lightPoint, point, () => {
        point.setVisible(false);
        this.physics.world.disable(point);
        this.currentNbPoints--;
        this.checkGameOver();
      });
      this.points.push(point);
    }
  }
  
  checkGameOver() {
    if (this.currentNbPoints === 0) {
      this.endGame();
    }
  }

  private endGame() {
    // Stop any active game mechanics
    stopTimer(this);
    this.scheduler.removeAllEvents();
    this.lightPoint.body.velocity.x = 0;
    this.lightPoint.body.velocity.y = 0;
    this.lightPoint.setInteractive(false);
    this.input.off('pointermove', this.moveLightToPoint, this);
    this.gridView.container.clearMask();
    this.lightPoint.clearMask();
    this.points.forEach((point: Phaser.GameObjects.Arc) => point.clearMask());
    if (this.topText) {
      this.topText.setText(`Game Finished!\nTime: ${formatTime(this.elapsedTime)}`);
    } else {
      this.topText = this.add.text(config.scale.width/2, 50, `Game Finished!\nTime: ${formatTime(this.elapsedTime)}`, {
        align: 'center',
        fontSize: '40px',
        color: '#000'
      }).setOrigin(0.5, 0.5); // Align text to the top left of the game grid
    }
    this.time.delayedCall(5000, () => {
      addScore({name: 'test', mazeName: this.mazeName, score: calculateScore(this.elapsedTime, 1)});
      resetTimer(this);
      this.scene.start('MainMenuScene');  // replace 'MainScene' with the key of your main scene
  });
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

  placePointInRandomCell(point: Phaser.GameObjects.Arc): Cell {
    const randomRow = Phaser.Math.RND.between(0, this.gridView.grid.rows - 1);
    const randomCol = Phaser.Math.RND.between(0, this.gridView.grid.cols - 1);
    const randomCell = this.grid?.get(randomRow, randomCol);

    if (randomCell) {
      const position = this.gridView._getCellCoordinates(randomCell);
      point.setPosition(position.x, position.y);
      point.setVisible(true);
    } else {
      console.error('randomCell is undefined');
    }
    return randomCell;
  }
  scheduleNextWallRemoval(cell1: Cell, cell2: Cell) {
    const TIME_STEP = 50 * (8*8) / (this.rows * this.cols) ;

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

  createDeadWalls() {
    console.log(this.gridView.wallViews.length)
    const remainingWalls = Object.values(this.gridView.wallViews).filter(wallView => wallView.alpha === 1);
    console.log(remainingWalls.length)
  }
  private showPointsBriefly() {
    const circles = this.points
    .filter(point => point.visible)
    .map((point: Phaser.GameObjects.Arc) => this.add.circle(point.x + this.gridView.startX, point.y+ this.gridView.startY, 5, 0x87F090).setAlpha(0));

    this.tweens.add({
      targets: circles,
      alpha: 1,
      duration: 1000,
      ease: 'Sine.easeInOut',
      repeat: 0,
      yoyo: true
    });
  }

  moveLightToPoint(pointer: Phaser.Input.InputPlugin) {
    let targetX = Phaser.Math.Clamp(pointer.x, this.gridView.startX, this.gridView.startX + this.gridView.gridWidth) - this.gridView.startX;
    let targetY = Phaser.Math.Clamp(pointer.y, this.gridView.startY, this.gridView.startY + this.gridView.gridHeight) - this.gridView.startY;
    let dx = pointer.x - this.gridView.startX - this.lightPoint.x;
    let dy = pointer.y - this.gridView.startY - this.lightPoint.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    let speed = calculateSpeed(distance);

    this.lightPointTarget = { x: targetX, y: targetY };  // Stockez la cible

    this.physics.moveTo(this.lightPoint, targetX, targetY, speed);

  }
}