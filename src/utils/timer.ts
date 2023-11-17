import config from '../config';
import Maze from '../scenes/maze/Maze';

/**
 * Format time
 * @param milliseconds
 * @returns formatted time
 */
const formatTime = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const millis = (milliseconds % 1000) / 100;

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedMillis = String(millis);

  return `${formattedMinutes}:${formattedSeconds}:${formattedMillis}`;
};

let timerEvent: Phaser.Time.TimerEvent | null = null;
/**
 * Create a timer
 * @param maze
 */
const createTimer = (maze: Maze) => {
  maze.timerText = maze.add.text(
    config.scale.width - 10,
    10,
    'Time: 00:00:0000',
    {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
    }
  );
  maze.timerText.setOrigin(1, 0);

  timerEvent = maze.time.addEvent({
    delay: 100,
    loop: true,
    callback: () => {
      maze.elapsedTime += 100;
      const formattedTime = formatTime(maze.elapsedTime);
      maze.timerText.setText(`Time: ${formattedTime}`);
    },
  });
};

const stopTimer = () => {
  if (timerEvent) {
    timerEvent.remove();
    timerEvent = null;
  }
};

const resetTimer = (maze: Maze) => {
  maze.elapsedTime = 0;
  if (timerEvent) {
    maze.timerText.destroy();
  }
};

export { createTimer, formatTime, resetTimer, stopTimer };
