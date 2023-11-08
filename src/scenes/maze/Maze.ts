import 'phaser';
import config from '../../config';
import { GridView, ICoordinates } from '../../entities/grid-view';
import { RecursiveBacktracker } from '../../generators/recursive-backtracker';
import { Cell } from '../../models/cell';
import { MazeConfig } from '../../models/gameConfig';
import { Grid } from '../../models/grid';
import calculateScore from '../../models/score';
import { addLevelToWorld, addScore } from '../../models/store';
import { getUsername } from '../../models/username';
import calculateSpeed from '../../utils/calculateSpeed';
import {
  createTimer,
  formatTime,
  resetTimer,
  stopTimer,
} from '../../utils/timer';

export default class Maze extends Phaser.Scene {
  title: string;
  worldTitle: string;
  private enableDeadWalls: boolean;
  private enableEnemies: boolean;
  private nbEnemies: number;
  private nbEnemyOrDeadWallTouched: number;
  private rows: number;
  private cols: number;
  private gridView!: GridView;
  private scheduler!: any;
  private destroyedWallCount: number;
  private lightPoint!: Phaser.GameObjects.Arc;
  private startPosition!: ICoordinates;
  private points: Phaser.GameObjects.Arc[];
  private nbPoints: number;
  private currentNbPoints: number;
  private grid!: Grid;
  private lightPointTarget!: ICoordinates | null;
  private graphics!: Phaser.GameObjects.Graphics;
  private generator!: RecursiveBacktracker;
  private mask!: Phaser.Display.Masks.GeometryMask;
  timerText!: Phaser.GameObjects.Text;
  elapsedTime: number = 0;
  private topText: Phaser.GameObjects.Text | null = null;
  private wallColliders: Record<string, Phaser.Physics.Arcade.Collider>;
  constructor(config: MazeConfig) {
    super(config.title);
    this.title = config.title;
    this.worldTitle = config.worldTitle;
    this.rows = config.rows;
    this.cols = config.cols;
    this.enableDeadWalls = config.enableDeadWalls;
    this.enableEnemies = config.enableEnemies;
    this.nbPoints = config.nbPoints;
    this.nbEnemies = config.nbEnemies;
    this.currentNbPoints = config.nbPoints;
    this.points = [];
    this.destroyedWallCount = 0;
    this.nbEnemyOrDeadWallTouched = 0;
    this.wallColliders = {};
  }
  create() {
    this.currentNbPoints = this.nbPoints;
    this.cameras.main.setBackgroundColor(0xcacaca);

    this.scheduler = new Phaser.Time.Clock(this);
    this.scheduler.start();

    this.graphics = this.make.graphics({
      lineStyle: { color: 0x0000ff, width: 0.5 },
    });
    this.mask = new Phaser.Display.Masks.GeometryMask(this, this.graphics);

    this.grid = new Grid(this.rows, this.cols);
    this.gridView = new GridView(
      this,
      this.grid,
      config.scale.width / 2,
      config.scale.height / 2
    );
    this.generator = new RecursiveBacktracker(this, this.grid, this.gridView);
    //this.gridView = new GridView(this, this.grid, 250, 250);

    this.createLightPoint();
    this.createPoints();

    // Placing light point and points
    this.startPosition = this.placePointInRandomCell(this.lightPoint)!;
    this.points.forEach((point: Phaser.GameObjects.Arc) =>
      this.placePointInRandomCell(point)
    );

    // COLLISION
    for (const key in this.gridView.wallViews) {
      const wallView = this.gridView.wallViews[key];
      this.wallColliders[key] = this.physics.add.collider(
        this.lightPoint,
        wallView
      );
    }
    console.log(this.physics.world.colliders);
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
    const countdownText = this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        String(countdown),
        {
          font: '412px Arial',
          color: '#000000',
        }
      )
      .setOrigin(0.5, 0.5)
      .setAlpha(0.3);

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
        } else if (countdown === 2) {
          if (this.enableDeadWalls) {
            this.createDeadWalls();
          }
          if (this.enableEnemies) {
            this.createEnemies();
          }
        }
      },
      callbackScope: this,
    });

    this.time.delayedCall(6000, () => {
      this.startGame();
    });
  }

  startGame() {
    this.input.on('pointermove', this.moveLightToPoint, this);
    this.gridView.container.setMask(this.mask);
    this.lightPoint.setMask(this.mask);
    this.points.forEach((point: Phaser.GameObjects.Arc) =>
      point.setMask(this.mask)
    );
    createTimer(this);
    this.time.addEvent({
      //delay: 20000, // 20 seconds
      delay: 20000,
      callback: this.showPointsBriefly,
      callbackScope: this,
      loop: true,
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
    for (let i = 0; i < this.currentNbPoints; i++) {
      const point = this.add.circle(0, 0, 5, 0x87f090);
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
      this.topText.setText(
        `Game Finished!\nTime: ${formatTime(this.elapsedTime)}`
      );
    } else {
      this.topText = this.add
        .text(
          config.scale.width / 2,
          50,
          `Game Finished!\nTime: ${formatTime(this.elapsedTime)}`,
          {
            align: 'center',
            fontSize: '40px',
            color: '#000',
          }
        )
        .setOrigin(0.5, 0.5); // Align text to the top left of the game grid
    }
    addLevelToWorld(this.worldTitle, this.title);
    this.time.delayedCall(5000, () => {
      addScore(this.worldTitle, {
        name: getUsername(),
        mazeName: this.title,
        score: calculateScore(
          this.elapsedTime,
          this.rows,
          this.cols,
          this.nbPoints,
          this.nbEnemies,
          this.nbEnemyOrDeadWallTouched
        ),
      });
      resetTimer(this);
      //this.scene.start('MainMenuScene');  // replace 'MainScene' with the key of your main scene
      this.scene.remove(this.title);
      //worldTitle
      this.scene.run(this.worldTitle);
    });
  }

  update(time: number, delta: number): void {
    if (this.lightPointTarget) {
      const dx = this.lightPointTarget.x - this.lightPoint.x;
      const dy = this.lightPointTarget.y - this.lightPoint.y;
      const distanceToTarget = Math.sqrt(dx * dx + dy * dy);

      if (distanceToTarget < 5) {
        // Par exemple, si moins de 5 pixels de la cible
        this.lightPoint.body.velocity.x = 0;
        this.lightPoint.body.velocity.y = 0;
        this.lightPointTarget = null; // Réinitialisez la cible
      }
    }
    this.graphics
      .clear()
      .fillStyle(0x000000)
      .fillCircle(
        this.lightPoint.x + this.gridView.startX,
        this.lightPoint.y + this.gridView.startY,
        70
      );
  }

  _reset() {
    this.destroyedWallCount = 0;
    this.scheduler.removeAllEvents();
    this.generator.reset();
    this.gridView.reset();
  }

  placePointInRandomCell(point: Phaser.GameObjects.Arc): ICoordinates | null {
    const randomRow = Phaser.Math.RND.between(0, this.gridView.grid.rows - 1);
    const randomCol = Phaser.Math.RND.between(0, this.gridView.grid.cols - 1);
    const randomCell = this.grid?.get(randomRow, randomCol);

    if (randomCell) {
      const position = this.gridView._getCellCoordinates(randomCell);
      point.setPosition(position.x, position.y);
      point.setVisible(true);
      return position;
    } else {
      console.error('randomCell is undefined');
    }
    return null;
  }
  scheduleNextWallRemoval(cell1: Cell, cell2: Cell) {
    const TIME_STEP = (50 * (8 * 8)) / (this.rows * this.cols);

    if (cell1.row == cell2.row) {
      if (cell2.col < cell1.col) {
        // left
        this.scheduler.delayedCall(TIME_STEP * this.destroyedWallCount, () => {
          this.gridView.destroyWall(cell1.walls.left!);
        });
      } else {
        // right
        this.scheduler.delayedCall(TIME_STEP * this.destroyedWallCount, () => {
          this.gridView.destroyWall(cell1.walls.right!);
        });
      }
    } else {
      if (cell2.row < cell1.row) {
        // above
        this.scheduler.delayedCall(TIME_STEP * this.destroyedWallCount, () => {
          this.gridView.destroyWall(cell1.walls.above!);
        });
      } else {
        // below
        this.scheduler.delayedCall(TIME_STEP * this.destroyedWallCount, () => {
          this.gridView.destroyWall(cell1.walls.below!);
        });
      }
    }

    this.destroyedWallCount += 1;
  }

  createDeadWalls() {
    const keys = Object.keys(this.gridView.wallViews);
    const remainingWalls = keys.filter(
      (key) => this.gridView.wallViews[key].body.enable
    );
    Phaser.Utils.Array.Shuffle(remainingWalls)
      .slice(0, Math.floor(remainingWalls.length * 0.3))
      .forEach((key) => {
        const wallView = this.gridView.wallViews[key];
        this.scheduler.delayedCall(500, () => {
          this.gridView.scene.tweens.add({
            targets: wallView,
            props: {
              fillColor: 0xff0000,
            },
            duration: 200,
          });
          this.wallColliders[key].destroy();
          this.physics.add.collider(this.lightPoint, wallView, () => {
            this.lightPoint.setPosition(
              this.startPosition.x,
              this.startPosition.y
            );
            this.nbEnemyOrDeadWallTouched++;
          });
        });
      });
  }
  createEnemies() {
    for (let i = 0; i < this.nbEnemies; i++) {
      const enemy: any = this.add.circle(0, 0, 5, 0xff0000);
      this.physics.world.enable(enemy);
      this.gridView.container.add(enemy);

      const enemyPosition = this.placePointInRandomCell(enemy);
      if (enemyPosition) {
        enemy.setPosition(enemyPosition.x, enemyPosition.y);
      }
      enemy.setInteractive();
      const speed = 70;
      const angle = Phaser.Math.FloatBetween(0, 2 * Math.PI);
      enemy.body.setVelocity(speed * Math.cos(angle), speed * Math.sin(angle));
      enemy.body.setBounce(1, 1);
      enemy.body.collideWorldBounds = true;
      enemy.body.allowGravity = false;

      Object.values(this.gridView.wallViews).forEach((wallView) => {
        this.physics.add.collider(enemy, wallView);
      });
      this.gridView.outlineViews.forEach((outlineView) => {
        this.physics.add.collider(enemy, outlineView);
      });
      // overlap insdead of collider because we don't want the lightpoint to change the direction of the enemy
      this.physics.add.overlap(this.lightPoint, enemy, () => {
        this.lightPoint.setPosition(this.startPosition.x, this.startPosition.y);
        this.nbEnemyOrDeadWallTouched++;
      });
    }
  }
  private showPointsBriefly() {
    const circles = this.points
      .filter((point) => point.visible)
      .map((point: Phaser.GameObjects.Arc) =>
        this.add
          .circle(
            point.x + this.gridView.startX,
            point.y + this.gridView.startY,
            5,
            0x87f090
          )
          .setAlpha(0)
      );

    this.tweens.add({
      targets: circles,
      alpha: 1,
      duration: 1000,
      ease: 'Sine.easeInOut',
      repeat: 0,
      yoyo: true,
    });
  }

  moveLightToPoint(pointer: Phaser.Input.InputPlugin) {
    const targetX =
      Phaser.Math.Clamp(
        pointer.x,
        this.gridView.startX,
        this.gridView.startX + this.gridView.gridWidth
      ) - this.gridView.startX;
    const targetY =
      Phaser.Math.Clamp(
        pointer.y,
        this.gridView.startY,
        this.gridView.startY + this.gridView.gridHeight
      ) - this.gridView.startY;
    const dx = pointer.x - this.gridView.startX - this.lightPoint.x;
    const dy = pointer.y - this.gridView.startY - this.lightPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const speed = calculateSpeed(distance);

    this.lightPointTarget = { x: targetX, y: targetY }; // Stockez la cible

    this.physics.moveTo(this.lightPoint, targetX, targetY, speed);
  }
}
