import 'phaser';
import config from '../../config';
import { GridView, ICoordinates } from '../../models/grid-view';
import { RecursiveBacktracker } from '../../generators/recursive-backtracker';
import { Cell } from '../../models/cell';
import { MazeConfig } from '../../models/gameConfig';
import { Grid } from '../../models/grid';
import calculateScore from '../../models/score';
import {
  addLevelToWorld,
  addScore,
  getHintSpace,
  storeHintSpace,
} from '../../models/store';
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
  rows: number;
  cols: number;
  nbPoints: number;
  enableDeadWalls: boolean;
  enableEnemies: boolean;
  nbEnemies: number;
  percentDeadWalls: number;
  nbEnemyOrDeadWallTouched: number;
  destroyedWallCount: number;
  currentNbPoints: number;
  bonusCount: number = 3;
  scheduler!: any;
  elapsedTime: number = 0;
  hintSpace: boolean = false;
  gridView!: GridView;
  grid!: Grid;
  restartPosition!: ICoordinates;
  lightPointTarget!: ICoordinates | null;
  lightPoint!: Phaser.GameObjects.Arc;
  points: Phaser.GameObjects.Arc[];
  graphics!: Phaser.GameObjects.Graphics;
  generator!: RecursiveBacktracker;
  mask!: Phaser.Display.Masks.GeometryMask;
  topText: Phaser.GameObjects.Text | null = null;
  timerText!: Phaser.GameObjects.Text;
  buttonBonus!: Phaser.GameObjects.Text;
  buttonBack!: Phaser.GameObjects.Text;
  wallColliders: Record<string, Phaser.Physics.Arcade.Collider>;
  spaceKey!: Phaser.Input.Keyboard.Key;
  hintContainer!: Phaser.GameObjects.Container;

  constructor(config: MazeConfig) {
    super(config.title);
    this.title = config.title;
    this.worldTitle = config.worldTitle;
    this.rows = config.rows;
    this.cols = config.cols;
    this.enableDeadWalls = config.enableDeadWalls;
    this.enableEnemies = config.enableEnemies;
    this.percentDeadWalls = config.percentDeadWalls;
    this.nbPoints = config.nbPoints;
    this.nbEnemies = config.nbEnemies;
    this.currentNbPoints = config.nbPoints;
    this.points = [];
    this.destroyedWallCount = 0;
    this.nbEnemyOrDeadWallTouched = 0;
    this.wallColliders = {};
    this.hintSpace = getHintSpace();
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
    this.restartPosition = this.placePointInRandomCell(this.lightPoint)!;
    this.points.forEach((point: Phaser.GameObjects.Arc) =>
      this.placePointInRandomCell(point)
    );

    // Defining collisions
    for (const key in this.gridView.wallViews) {
      const wallView = this.gridView.wallViews[key];
      this.wallColliders[key] = this.physics.add.collider(
        this.lightPoint,
        wallView
      );
    }
    this.gridView.outlineViews.forEach((outlineView: any) => {
      this.physics.add.collider(this.lightPoint, outlineView);
    });

    this._reset();
    this.generator.generate();
    this.countDown();

    const buttonStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '24px',
      color: '#fff',
      backgroundColor: '#333',
      padding: {
        x: 16,
        y: 8,
      },
    };

    this.buttonBonus = this.add.text(
      this.scale.width * 0.17,
      this.scale.height * 0.95,
      `Bonus: ${this.bonusCount} left`,
      buttonStyle
    );
    this.buttonBonus.setOrigin(0.5);
    this.buttonBonus.setAlpha(0.5);
    this.buttonBonus.on('pointerdown', () => {
      this.revealMazeBriefly();
    });
    this.buttonBack = this.add.text(
      this.scale.width * 0.91,
      this.scale.height * 0.95,
      'Back',
      buttonStyle
    );
    this.buttonBack.setOrigin(0.5);
    this.buttonBack.setAlpha(0.5);
    this.buttonBack.on('pointerdown', () => {
      stopTimer();
      this.scheduler.removeAllEvents();
      resetTimer(this);
      this.scene.run(this.worldTitle);
      this.scene.remove(this.title);
    });
    if (this.hintSpace) {
      this.createHintNote();
    }

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

  /**
   * Start the game after the countdown
   */
  startGame() {
    this.input.on('pointermove', this.moveLightToPoint, this);
    this.gridView.container.setMask(this.mask);
    this.lightPoint.setMask(this.mask);
    this.points.forEach((point: Phaser.GameObjects.Arc) =>
      point.setMask(this.mask)
    );
    this.buttonBack.setAlpha(1);
    this.buttonBack.setInteractive({ useHandCursor: true });
    this.buttonBonus.setAlpha(1);
    this.buttonBonus.setInteractive({ useHandCursor: true });

    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.spaceKey.on('down', () => {
      this.revealMazeBriefly();
      this.removeHint();
    });

    createTimer(this);

    this.revealPointsBriefly(15);
    this.updateRestartPosition(6);
  }
  removeHint() {
    console.log('removeHint');
    if (this.hintSpace) {
      this.hintContainer.destroy();
      this.hintSpace = false;
      storeHintSpace(this.hintSpace);
    }
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

  endGame() {
    // Stop any active game mechanics
    stopTimer();
    this.scheduler.removeAllEvents();
    this.lightPoint.body.velocity.x = 0;
    this.lightPoint.body.velocity.y = 0;
    this.lightPoint.setInteractive(false);
    this.buttonBack.removeInteractive();
    this.buttonBonus.removeInteractive();
    this.buttonBack.setAlpha(0.5);
    this.buttonBonus.setAlpha(0.5);
    this.input.off('pointermove', this.moveLightToPoint, this);
    this.gridView.container.clearMask();
    this.lightPoint.clearMask();
    this.points.forEach((point: Phaser.GameObjects.Arc) => point.clearMask());
    const score = calculateScore(
      this.elapsedTime,
      this.rows,
      this.cols,
      this.nbPoints,
      this.nbEnemies,
      this.nbEnemyOrDeadWallTouched
    );
    const endText = `Game Finished!\nTime: ${formatTime(
      this.elapsedTime
    )}\nScore: ${score}`;

    if (this.topText) {
      this.topText.setText(endText);
    } else {
      this.topText = this.add
        .text(config.scale.width / 2, 70, endText, {
          align: 'center',
          fontSize: '40px',
          color: '#000',
        })
        .setOrigin(0.5, 0.5); // Align text to the top left of the game grid
    }
    addLevelToWorld(this.worldTitle, this.title);
    this.time.delayedCall(5000, () => {
      addScore(this.worldTitle, {
        name: getUsername(),
        mazeName: this.title,
        score,
      });
      resetTimer(this);
      //this.scene.start('MainMenuScene');  // replace 'MainScene' with the key of your main scene
      this.scene.remove(this.title);
      //worldTitle
      this.scene.run(this.worldTitle);
    });
  }

  /**
   * Update the game
   * @param time
   * @param delta
   */
  update(time: number, delta: number): void {
    if (this.lightPointTarget) {
      const dx = this.lightPointTarget.x - this.lightPoint.x;
      const dy = this.lightPointTarget.y - this.lightPoint.y;
      const distanceToTarget = Math.sqrt(dx * dx + dy * dy);

      // Stop the light point if it is close enough to the target
      if (distanceToTarget < 5) {
        this.lightPoint.body.velocity.x = 0;
        this.lightPoint.body.velocity.y = 0;
        this.lightPointTarget = null;
      }
    }

    // circle around the light point that reveals the maze
    this.graphics
      .clear()
      .fillStyle(0x000000)
      .fillCircle(
        this.lightPoint.x + this.gridView.startX,
        this.lightPoint.y + this.gridView.startY,
        50
      );
  }

  _reset() {
    this.destroyedWallCount = 0;
    this.scheduler.removeAllEvents();
    this.generator.reset();
    this.gridView.reset();
  }

  /**
   * Place the given point in a random cell of the grid
   * @param point the point to place
   * @returns the coordinates of the cell where the point is placed
   */
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

  /**
   * Schedule the destruction of the wall between the two given cells
   * @param cell1
   * @param cell2
   */
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

  /**
   * Create the hint note for bonus button
   */
  createHintNote() {
    const noteStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '16px',
      color: '#000',
      backgroundColor: '#fff',
      padding: {
        x: 10,
        y: 5,
      },
    };

    const hintNote = this.add.text(0, 0, 'Press SPACE !', noteStyle);
    const gotItButton = this.add
      .text(0, hintNote.height + 5, 'Got it', noteStyle)
      .setInteractive();

    this.hintContainer = this.add.container(
      this.buttonBonus.x + 120,
      this.buttonBonus.y - 30,
      [hintNote, gotItButton]
    );

    gotItButton.on('pointerdown', () => {
      this.removeHint();
      storeHintSpace(false);
    });
  }

  /**
   * Create dead walls and add collisions with walls and light point
   */
  createDeadWalls() {
    const keys = Object.keys(this.gridView.wallViews);
    const remainingWalls = keys.filter(
      (key) => this.gridView.wallViews[key].body.enable
    );
    Phaser.Utils.Array.Shuffle(remainingWalls)
      .slice(0, Math.floor(remainingWalls.length * this.percentDeadWalls))
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
              this.restartPosition.x,
              this.restartPosition.y
            );
            this.nbEnemyOrDeadWallTouched++;
          });
        });
      });
  }

  /**
   * Create enemies and add collisions with walls and light point
   */
  createEnemies() {
    for (let i = 0; i < this.nbEnemies; i++) {
      const enemy: any = this.add.circle(0, 0, 3, 0xff0000);
      this.physics.world.enable(enemy);
      this.gridView.container.add(enemy);

      const enemyPosition = this.placePointInRandomCell(enemy);
      if (enemyPosition) {
        enemy.setPosition(enemyPosition.x, enemyPosition.y);
      }
      enemy.setInteractive();
      const speed = 50;
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
        this.lightPoint.setPosition(
          this.restartPosition.x,
          this.restartPosition.y
        );
        this.nbEnemyOrDeadWallTouched++;
      });
    }
  }

  /**
   * Update the restart position of the light point every second
   * @param time time in seconds
   */
  updateRestartPosition(time: number) {
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (this.lightPoint) {
          const x = this.lightPoint.x;
          const y = this.lightPoint.y;
          setTimeout(() => {
            this.restartPosition.x = x;
            this.restartPosition.y = y;
          }, time * 1000);
        }
      },
      callbackScope: this,
      loop: true,
    });
  }

  /**
   * Reveal the points during the given time
   * @param time time in seconds
   */
  revealPointsBriefly(time: number) {
    this.time.addEvent({
      delay: time * 1000,
      callback: () => {
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
      },
      callbackScope: this,
      loop: true,
    });
  }

  /**
   * Reavel the maze during 3s when clicking on the bonus button or pressing space
   */
  revealMazeBriefly() {
    this.buttonBonus.removeInteractive();
    this.buttonBonus.setAlpha(0.5);
    if (this.bonusCount < 1) {
      return;
    }
    this.gridView.container.clearMask();
    this.lightPoint.clearMask();
    this.points.forEach((point: Phaser.GameObjects.Arc) => point.clearMask());

    this.time.delayedCall(3000, () => {
      this.gridView.container.setMask(this.mask);
      this.lightPoint.setMask(this.mask);
      this.points.forEach((point: Phaser.GameObjects.Arc) =>
        point.setMask(this.mask)
      );
      if (this.bonusCount > 0) {
        this.buttonBonus.setInteractive({ useHandCursor: true });
        this.buttonBonus.setAlpha(1);
      }
    });
    this.bonusCount--;
    this.buttonBonus.setText(`Bonus: ${this.bonusCount} left`);
  }

  /**
   * Move the light point to the cursor position with a speed depending on the distance
   * @param {Phaser.Input.InputPlugin} pointer
   */
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

    this.lightPointTarget = { x: targetX, y: targetY };

    this.physics.moveTo(this.lightPoint, targetX, targetY, speed);
  }
}
