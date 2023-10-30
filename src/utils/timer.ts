import config from "../config";
import Maze from "../scenes/maze/Maze";


const formatTime = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const millis = milliseconds % 1000 / 100;

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedMillis = String(millis);

  return `${formattedMinutes}:${formattedSeconds}:${formattedMillis}`;
}

/**
 * Create a timer
 * @param scene
 */
const createTimer = (scene: Maze) => {
  scene.timerText = scene.add.text(
    config.scale.width - 10,
    10,
    'Time: 00:00:0000',
    {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
    }
  );
  scene.timerText.setOrigin(1, 0);

  scene.time.addEvent({
    delay: 100,
    loop: true,
    callback: () => {
      scene.elapsedTime += 100;
      const formattedTime = formatTime(scene.elapsedTime);
      scene.timerText.setText(`Time: ${formattedTime}`);
    },
  });
}
export {createTimer, formatTime};
