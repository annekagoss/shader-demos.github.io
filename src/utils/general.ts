export const calcWindowDiagonalAngle = (): number => {
  const { innerWidth, innerHeight } = window;
  return Math.atan(innerHeight / innerWidth);
};

export const calcWindowHypotenuse = (): number => {
  const { innerWidth, innerHeight } = window;
  return Math.sqrt(Math.pow(innerWidth, 2) + Math.pow(innerHeight, 2));
};
