const cacheSpeed = new Map<number, number>();
const maxSpeed = 200;

/**
 * Calculate the speed of the light point based on the distance to the target
 * @param distance distance between the light point and the cursor
 * @returns speed of the light point
 */
const calculateSpeed = (distance: number): number => {
  distance = Math.trunc(distance);
  if (cacheSpeed.has(distance)) {
    return cacheSpeed.get(distance) || 0;
  }
  let speed: number;
  if (distance < maxSpeed) {
    speed = distance;
  } else {
    speed = maxSpeed + Math.log(distance - maxSpeed + 20) * 10;
  }
  cacheSpeed.set(distance, speed);
  return speed;
};

export default calculateSpeed;
