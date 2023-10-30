const cacheSpeed = new Map<number, number>();
const easingFactor = 0.5;
const maxSpeed = 200;
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